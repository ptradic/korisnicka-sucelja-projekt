import { NextRequest, NextResponse } from 'next/server';
import type { Item, Category, Rarity, ValueUnit } from '@/app/types';

// Open5e v2 API - comprehensive 5e or 5.5e item database (2700+ items)
const OPEN5E_BASE = 'https://api.open5e.com/v2';

interface Open5eItem {
  key: string;
  name: string;
  desc: string;
  category: { name: string; key: string };
  rarity: { name: string; key: string; rank: number } | null;
  is_magic_item: boolean;
  weapon: any | null;
  armor: any | null;
  weight: string;
  cost: string;
  requires_attunement: boolean;
  document: { key: string; display_name: string };
}

// Map Open5e category keys to our app categories
const CATEGORY_MAP: Record<string, Category> = {
  'weapon': 'weapons',
  'ammunition': 'weapons',
  'armor': 'armor',
  'shield': 'armor',
  'potion': 'consumables',
  'poison': 'consumables',
  'scroll': 'consumables',
  'wand': 'magic-gear',
  'rod': 'magic-gear',
  'staff': 'magic-gear',
  'ring': 'magic-gear',
  'wondrous-item': 'magic-gear',
  'spellcasting-focus': 'magic-gear',
  'gem': 'wealth-valuables',
  'art': 'wealth-valuables',
  'jewelry': 'wealth-valuables',
  'trade-good': 'wealth-valuables',
  'adventuring-gear': 'adventuring-gear',
  'tools': 'adventuring-gear',
  'equipment-pack': 'adventuring-gear',
  // Hidden categories for project scope.
  'mount': 'hidden',
  'land-vehicle': 'hidden',
  'waterborne-vehicle': 'hidden',
  'service': 'hidden',
};

function mapCategory(item: Open5eItem): Category {
  return CATEGORY_MAP[item.category.key] || 'hidden';
}

function mapRarity(rarity: Open5eItem['rarity']): Rarity {
  if (!rarity) return 'common';
  const key = rarity.key;
  if (key === 'common') return 'common';
  if (key === 'uncommon') return 'uncommon';
  if (key === 'rare') return 'rare';
  if (key === 'very-rare') return 'very rare';
  if (key === 'legendary') return 'legendary';
  if (key === 'artifact') return 'artifact';
  if (key === 'varies') return 'common';
  return 'common';
}

function normalizeValueUnit(value: number, valueUnit: ValueUnit): { value: number; valueUnit: ValueUnit } {
  if (valueUnit === 'gp' && value > 0 && value < 1) {
    if (value < 0.1) {
      return { value: Number((value * 100).toFixed(2)), valueUnit: 'cp' };
    }
    return { value: Number((value * 10).toFixed(2)), valueUnit: 'sp' };
  }

  return { value: Number(value.toFixed(2)), valueUnit };
}

function parseCost(costRaw: string, isMagicItem: boolean): {
  value?: number;
  valueUnit?: ValueUnit;
  valueUnknown?: boolean;
} {
  const cost = (costRaw || '').trim().toLowerCase();
  if (!cost) {
    return { valueUnknown: isMagicItem || undefined };
  }

  const normalized = cost.replace(/,/g, '');

  // Common Open5e format is a plain numeric string like "25.00".
  const numericOnly = normalized.match(/^\d+(?:\.\d+)?$/);
  if (numericOnly) {
    const parsed = Number(numericOnly[0]);
    if (Number.isFinite(parsed) && parsed > 0) {
      const normalizedCost = normalizeValueUnit(parsed, 'gp');
      return {
        value: normalizedCost.value,
        valueUnit: normalizedCost.valueUnit,
      };
    }
    return { valueUnknown: isMagicItem || undefined };
  }

  // Open5e cost strings can include extra text (e.g. "50 gp each", "250 gp (set)").
  // Capture the first coin amount anywhere in the string.
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(pp|gp|sp|cp)\b/);
  if (!match) {
    return { valueUnknown: isMagicItem || undefined };
  }

  const parsedValue = Number(match[1]);
  const parsedUnit = match[2];
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return { valueUnknown: isMagicItem || undefined };
  }

  if (parsedUnit === 'pp') {
    // Convert platinum to gold so UI can keep gp/sp/cp only.
    const normalizedCost = normalizeValueUnit(parsedValue * 10, 'gp');
    return {
      value: normalizedCost.value,
      valueUnit: normalizedCost.valueUnit,
    };
  }

  const normalizedCost = normalizeValueUnit(parsedValue, parsedUnit as ValueUnit);

  return {
    value: normalizedCost.value,
    valueUnit: normalizedCost.valueUnit,
  };
}

function transformItem(item: Open5eItem): Omit<Item, 'id'> {
  const parsedCost = parseCost(item.cost, item.is_magic_item);

  return {
    name: item.name,
    sourcebook: item.document?.key || 'unknown',
    description: item.desc || undefined,
    category: mapCategory(item),
    rarity: mapRarity(item.rarity),
    quantity: 1,
    weight: parseFloat(item.weight) || 0,
    value: parsedCost.value,
    valueUnit: parsedCost.valueUnit,
    valueUnknown: parsedCost.valueUnknown,
    attunement: item.requires_attunement,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category');
  const itemIndex = searchParams.get('index');

  try {
    // Fetch specific item details by key
    if (itemIndex) {
      const res = await fetch(`${OPEN5E_BASE}/items/${encodeURIComponent(itemIndex)}/?format=json`);
      if (!res.ok) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      const item: Open5eItem = await res.json();
      const transformed = transformItem(item);
      if (transformed.category === 'hidden') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json(transformed);
    }

    // Build search query params
    const params = new URLSearchParams({ format: 'json', limit: '100' });
    if (search) {
      params.set('name__icontains', search);
    }

    const res = await fetch(`${OPEN5E_BASE}/items/?${params.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch items from Open5e');
    }

    const data = await res.json();
    let results: Open5eItem[] = data.results;

    // Filter by our app category if specified, otherwise hide project-excluded categories.
    if (category) {
      results = results.filter((item) => mapCategory(item) === category);
    } else {
      results = results.filter((item) => mapCategory(item) !== 'hidden');
    }

    const items = results.map((item) => ({
      index: item.key,
      name: item.name,
      type: item.is_magic_item ? 'magic' : 'equipment',
      source: item.document.display_name,
      editionKey: item.document.key,
      rarity: item.rarity?.key || 'none',
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching 5e or 5.5e items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
