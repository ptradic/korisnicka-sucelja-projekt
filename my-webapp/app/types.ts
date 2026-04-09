export type Category =
  | 'weapons'
  | 'armor'
  | 'consumables'
  | 'magic-gear'
  | 'adventuring-gear'
  | 'wealth-valuables'
  | 'hidden'
  // Legacy categories kept for backward compatibility with already-saved data.
  | 'weapon'
  | 'potion'
  | 'magic'
  | 'treasure'
  | 'misc';

export function normalizeCategory(category: Category | string | undefined): Category {
  if (category === 'weapons' || category === 'armor' || category === 'consumables' || category === 'magic-gear' || category === 'adventuring-gear' || category === 'wealth-valuables' || category === 'hidden') {
    return category;
  }

  if (category === 'weapon') return 'weapons';
  if (category === 'potion') return 'consumables';
  if (category === 'magic') return 'magic-gear';
  if (category === 'treasure') return 'wealth-valuables';
  if (category === 'misc') return 'adventuring-gear';

  return 'hidden';
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';

export type ValueUnit = 'gp' | 'sp' | 'cp';

export interface Item {
  id: string;
  name: string;
  type?: string;
  damage?: string;
  properties?: string;
  mastery?: string;
  armorClass?: string;
  strengthRequirement?: string;
  stealth?: string;
  sourcebook?: string;
  description?: string;
  category: Category;
  rarity: Rarity;
  quantity: number;
  weight: number;
  value?: number;
  valueUnit?: ValueUnit;
  valueUnknown?: boolean;
  notes?: string;
  attunement?: boolean;
  attuned?: boolean;
  hiddenFromOthers?: boolean;
  createdAt?: string;

  // Optimized DB Storage
  source_key?: string;
  // Legacy reference kept for previously stored items.
  source_index?: number;
}

export interface Currency {
  pp: number;
  gp: number;
  sp: number;
  cp: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
  maxWeight: number;
  inventory: Item[];
  currency: Currency;
}
