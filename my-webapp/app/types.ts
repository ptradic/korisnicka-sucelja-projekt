export type Category = 'weapon' | 'armor' | 'potion' | 'magic' | 'treasure' | 'misc';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: Category;
  rarity: Rarity;
  quantity: number;
  weight: number;
  value?: number;
  notes?: string;
  attunement?: boolean;
  createdAt?: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
  maxWeight: number;
  inventory: Item[];
}

export interface VaultData {
  players: Player[];
  sharedLoot: Item[];
  isDM: boolean;
}
