import { NextRequest, NextResponse } from 'next/server';
import type { Item, Category, Rarity } from '@/app/types';

// Open5e v2 API - comprehensive D&D 5e item database (2700+ items)
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
  'weapon': 'weapon',
  'ammunition': 'weapon',
  'armor': 'armor',
  'shield': 'armor',
  'potion': 'potion',
  'poison': 'potion',
  'wand': 'magic',
  'rod': 'magic',
  'staff': 'magic',
  'ring': 'magic',
  'scroll': 'magic',
  'wondrous-item': 'magic',
  'spellcasting-focus': 'magic',
  'gem': 'treasure',
  'art': 'treasure',
  'jewelry': 'treasure',
  'trade-good': 'treasure',
  'adventuring-gear': 'misc',
  'tools': 'misc',
  'equipment-pack': 'misc',
  'mount': 'misc',
  'land-vehicle': 'misc',
  'waterborne-vehicle': 'misc',
  'service': 'misc',
};

function mapCategory(item: Open5eItem): Category {
  return CATEGORY_MAP[item.category.key] || 'misc';
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

function transformItem(item: Open5eItem): Omit<Item, 'id'> {
  return {
    name: item.name,
    description: item.desc || undefined,
    category: mapCategory(item),
    rarity: mapRarity(item.rarity),
    quantity: 1,
    weight: parseFloat(item.weight) || 0,
    value: parseFloat(item.cost) || 0,
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
      return NextResponse.json(transformItem(item));
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

    // Filter by our app category if specified
    if (category) {
      results = results.filter((item) => mapCategory(item) === category);
    }

    const items = results.map((item) => ({
      index: item.key,
      name: item.name,
      type: item.is_magic_item ? 'magic' : 'equipment',
      source: item.document.display_name,
      rarity: item.rarity?.key || 'none',
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching D&D items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
