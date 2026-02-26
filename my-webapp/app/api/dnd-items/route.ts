import { NextRequest, NextResponse } from 'next/server';
import type { Item, Category, Rarity } from '@/app/types';

const DND_API_BASE = 'https://www.dnd5eapi.co/api';

interface DnDAPIItem {
  index: string;
  name: string;
  url: string;
  equipment_category?: { name: string };
  weapon_category?: string;
  armor_category?: string;
  gear_category?: { name: string };
  rarity?: { name: string };
  weight?: number;
  cost?: { quantity: number; unit: string };
  desc?: string[];
}

interface DnDMagicItem {
  index: string;
  name: string;
  url: string;
  equipment_category?: { name: string };
  rarity?: { name: string };
  desc?: string[];
  variants?: any[];
}

// Map D&D API categories to our app categories
function mapCategory(item: DnDAPIItem | DnDMagicItem): Category {
  const equipmentCat = item.equipment_category?.name?.toLowerCase() || '';
  
  if (equipmentCat.includes('weapon') || 'weapon_category' in item) return 'weapon';
  if (equipmentCat.includes('armor') || 'armor_category' in item) return 'armor';
  if (equipmentCat.includes('potion')) return 'potion';
  if (equipmentCat.includes('wondrous') || equipmentCat.includes('wand') || equipmentCat.includes('rod') || equipmentCat.includes('staff')) return 'magic';
  if (equipmentCat.includes('adventuring gear') || 'gear_category' in item) return 'misc';
  
  return 'misc';
}

// Map D&D API rarity to our app rarity
function mapRarity(rarityName?: string): Rarity {
  if (!rarityName) return 'common';
  
  const lower = rarityName.toLowerCase();
  if (lower.includes('varies')) return 'common';
  if (lower === 'common') return 'common';
  if (lower === 'uncommon') return 'uncommon';
  if (lower === 'rare') return 'rare';
  if (lower === 'very rare') return 'very rare';
  if (lower === 'legendary') return 'legendary';
  if (lower === 'artifact') return 'artifact';
  
  return 'common';
}

// Convert D&D API cost to gold pieces
function convertToGold(cost?: { quantity: number; unit: string }): number {
  if (!cost) return 0;
  
  const { quantity, unit } = cost;
  switch (unit.toLowerCase()) {
    case 'pp':
      return quantity * 10;
    case 'gp':
      return quantity;
    case 'sp':
      return quantity / 10;
    case 'cp':
      return quantity / 100;
    default:
      return quantity;
  }
}

// Transform D&D API item to our Item type
function transformDnDItem(item: DnDAPIItem, details?: any): Omit<Item, 'id'> {
  const description = details?.desc?.join('\n\n') || item.desc?.join('\n\n') || '';
  
  return {
    name: item.name,
    description: description || undefined,
    category: mapCategory(item),
    rarity: mapRarity(details?.rarity?.name || item.rarity?.name),
    quantity: 1,
    weight: details?.weight || item.weight || 0,
    value: convertToGold(details?.cost || item.cost),
    attunement: description.toLowerCase().includes('attunement') || false,
  };
}

// Transform magic item to our Item type
function transformMagicItem(item: DnDMagicItem, details?: any): Omit<Item, 'id'> {
  const description = details?.desc?.join('\n\n') || item.desc?.join('\n\n') || '';
  
  return {
    name: item.name,
    description: description || undefined,
    category: mapCategory(item),
    rarity: mapRarity(details?.rarity?.name || item.rarity?.name),
    quantity: 1,
    weight: 0, // Magic items often don't have weight in the API
    value: 0, // Magic items typically don't have set prices
    attunement: description.toLowerCase().includes('attunement') || false,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category');
  const itemIndex = searchParams.get('index'); // For getting specific item details

  try {
    // If requesting specific item details
    if (itemIndex) {
      const isMagicItem = itemIndex.startsWith('magic-');
      const endpoint = isMagicItem 
        ? `${DND_API_BASE}/magic-items/${itemIndex.replace('magic-', '')}`
        : `${DND_API_BASE}/equipment/${itemIndex}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch item details');
      
      const details = await response.json();
      const transformed = isMagicItem 
        ? transformMagicItem(details, details)
        : transformDnDItem(details, details);
      
      return NextResponse.json(transformed);
    }

    // Fetch both equipment and magic items
    const [equipmentResponse, magicItemsResponse] = await Promise.all([
      fetch(`${DND_API_BASE}/equipment`),
      fetch(`${DND_API_BASE}/magic-items`),
    ]);

    if (!equipmentResponse.ok || !magicItemsResponse.ok) {
      throw new Error('Failed to fetch items from D&D API');
    }

    const equipmentData = await equipmentResponse.json();
    const magicItemsData = await magicItemsResponse.json();

    // Combine and filter items
    let allItems: Array<{ index: string; name: string; type: 'equipment' | 'magic' }> = [
      ...equipmentData.results.map((item: any) => ({ ...item, type: 'equipment' as const })),
      ...magicItemsData.results.map((item: any) => ({ ...item, type: 'magic' as const, index: `magic-${item.index}` })),
    ];

    // Filter by search term
    if (search) {
      allItems = allItems.filter(item => 
        item.name.toLowerCase().includes(search)
      );
    }

    // Limit to 100 results for performance
    const limitedItems = allItems.slice(0, 100);

    // For the list view, we'll return basic info
    // The frontend will fetch full details when needed
    const items = limitedItems.map(item => ({
      index: item.index,
      name: item.name,
      type: item.type,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching D&D items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items from D&D API' },
      { status: 500 }
    );
  }
}
