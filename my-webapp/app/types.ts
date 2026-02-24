export type Category = 'weapon' | 'armor' | 'potion' | 'magic' | 'treasure' | 'misc';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: Category;
  rarity: Rarity;
  quantity: number;
  weight: number;
  value?: number;
  notes?: string;
  attunement?: boolean;
  createdAt?: string;
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

export interface VaultData {
  players: Player[];
  sharedLoot: Item[];
  isDM: boolean;
}

// Campaign and user types
export interface Campaign {
  id: string;
  name: string;
  description: string;
  dmId: string;
  dmName: string;
  playerIds: string[];
  sharedLoot: Item[];
  password?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'dm' | 'player';
  dmCampaigns: string[];
  playerCampaigns: string[];
}
