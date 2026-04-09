import type { Item, Category, Rarity } from '@/app/types';
import type { CampaignDoc, PlayerInventoryDoc, TransferRequest } from '@/src/firebaseService';
import masterItemDataRaw from '@/2024master.json';
import weaponDataRaw from '@/2024companion.json';

interface MasterItem {
  source_index?: number;
  key: string;
  name: string;
  desc?: string;
  category?: { name?: string; key?: string };
  weapon?: { name?: string; key?: string } | null;
  armor?: { name?: string; key?: string } | null;
  rarity?: { key?: string } | null;
  is_magic_item?: boolean;
  weight?: string;
  cost?: string;
  requires_attunement?: boolean;
  attunement_detail?: string | null;
  document?: { key?: string };
}

interface WeaponEntry {
  Name?: string;
  Damage?: string;
  Properties?: string;
  Mastery?: string;
}

interface ArmorEntry {
  Armor?: string;
  'Armor Class (AC)'?: string;
  Strength?: string;
  Stealth?: string;
}

interface CompanionWeaponsData {
  weapons?: WeaponEntry[];
  armors?: ArmorEntry[];
}

const DND_CATEGORY_MAP: Record<string, Category> = {
  weapon: 'weapons',
  ammunition: 'weapons',
  armor: 'armor',
  shield: 'armor',
  potion: 'consumables',
  poison: 'consumables',
  scroll: 'consumables',
  wand: 'magic-gear',
  rod: 'magic-gear',
  staff: 'magic-gear',
  ring: 'magic-gear',
  'wondrous-item': 'magic-gear',
  'spellcasting-focus': 'magic-gear',
  gem: 'wealth-valuables',
  art: 'wealth-valuables',
  jewelry: 'wealth-valuables',
  'trade-good': 'wealth-valuables',
  'adventuring-gear': 'adventuring-gear',
  tools: 'adventuring-gear',
  'equipment-pack': 'adventuring-gear',
  mount: 'hidden',
  'land-vehicle': 'hidden',
  'waterborne-vehicle': 'hidden',
  service: 'hidden',
};

function mapDndCategory(item: MasterItem): Category {
  const key = item.category?.key || '';
  return DND_CATEGORY_MAP[key] || 'hidden';
}

function mapDndRarity(rarityKey: string | undefined | null): Rarity {
  if (!rarityKey || rarityKey === 'common' || rarityKey === 'varies' || rarityKey === 'none') return 'common';
  if (rarityKey === 'uncommon') return 'uncommon';
  if (rarityKey === 'rare') return 'rare';
  if (rarityKey === 'very-rare') return 'very rare';
  if (rarityKey === 'legendary') return 'legendary';
  if (rarityKey === 'artifact') return 'artifact';
  return 'common';
}

function parseWeight(weightRaw: string | undefined): number {
  const parsed = Number.parseFloat(weightRaw || '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseCost(costRaw: string | undefined, isMagicItem: boolean): { value?: number; valueUnit?: 'gp' | 'sp' | 'cp'; valueUnknown?: boolean } {
  const cost = (costRaw || '').trim().toLowerCase();
  if (!cost) {
    return { valueUnknown: isMagicItem || undefined };
  }

  const numericOnly = cost.match(/^\d+(?:\.\d+)?$/);
  if (numericOnly) {
    const parsed = Number(numericOnly[0]);
    if (Number.isFinite(parsed) && parsed > 0) {
      if (parsed < 0.1) return { value: Number((parsed * 100).toFixed(2)), valueUnit: 'cp' };
      if (parsed < 1) return { value: Number((parsed * 10).toFixed(2)), valueUnit: 'sp' };
      return { value: Number(parsed.toFixed(2)), valueUnit: 'gp' };
    }
    return { valueUnknown: isMagicItem || undefined };
  }

  const match = cost.match(/(\d+(?:\.\d+)?)\s*(pp|gp|sp|cp)\b/);
  if (!match) return { valueUnknown: isMagicItem || undefined };

  const parsedValue = Number(match[1]);
  const parsedUnit = match[2] as 'pp' | 'gp' | 'sp' | 'cp';
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return { valueUnknown: isMagicItem || undefined };
  }

  const gpValue = parsedUnit === 'pp' ? parsedValue * 10 : parsedValue;
  const unit = parsedUnit === 'pp' ? 'gp' : parsedUnit;
  if (unit === 'gp' && gpValue < 0.1) return { value: Number((gpValue * 100).toFixed(2)), valueUnit: 'cp' };
  if (unit === 'gp' && gpValue < 1) return { value: Number((gpValue * 10).toFixed(2)), valueUnit: 'sp' };
  return { value: Number(gpValue.toFixed(2)), valueUnit: unit };
}

function transformMasterItem(item: MasterItem): Omit<Item, 'id'> {
  const category = mapDndCategory(item);
  const parsedCost = parseCost(item.cost, Boolean(item.is_magic_item));
  const categoryLabel = item.category?.name?.trim();
  const weaponName = item.weapon?.name?.trim();
  const armorName = item.armor?.name?.trim();
  const normalizedCategoryLabel = categoryLabel?.toLowerCase();
  const attunementDetail = item.attunement_detail?.trim();
  const metadataLine = [categoryLabel, attunementDetail].filter(Boolean).join(', ');
  const metadataLineBold = metadataLine ? `**${metadataLine}**` : '';
  const baseDescription = item.desc?.trim();
  const description = metadataLineBold
    ? [metadataLineBold, baseDescription].filter(Boolean).join('\n\n')
    : (baseDescription || undefined);
  const resolvedType = weaponName
    || armorName
    || (normalizedCategoryLabel === 'staff' ? 'Quarterstaff' : item.name);

  return {
    source_key: item.key,
    name: item.name,
    type: resolvedType,
    sourcebook: item.document?.key || 'srd-2024',
    description,
    category,
    rarity: mapDndRarity(item.rarity?.key),
    quantity: 1,
    weight: parseWeight(item.weight),
    value: parsedCost.value,
    valueUnit: parsedCost.valueUnit,
    valueUnknown: parsedCost.valueUnknown,
    attunement: Boolean(item.requires_attunement),
  };
}

const masterItems = masterItemDataRaw as MasterItem[];
const weaponItems = Array.isArray(weaponDataRaw)
  ? (weaponDataRaw as WeaponEntry[])
  : ((weaponDataRaw as CompanionWeaponsData).weapons ?? []);
const armorItems = Array.isArray(weaponDataRaw)
  ? []
  : ((weaponDataRaw as CompanionWeaponsData).armors ?? []);

const masterItemByKey = new Map<string, MasterItem>();
const masterItemByLegacyIndex = new Map<number, MasterItem>();
const masterItemByName = new Map<string, MasterItem>();
const weaponByName = new Map<string, WeaponEntry>();
const armorByName = new Map<string, ArmorEntry>();

for (const [index, item] of masterItems.entries()) {
  const key = item.key?.trim();
  if (key) {
    masterItemByKey.set(key, item);
  }

  const legacyIndex = typeof item.source_index === 'number' ? item.source_index : index;
  masterItemByLegacyIndex.set(legacyIndex, item);

  if (typeof item.name === 'string' && item.name.trim()) {
    masterItemByName.set(item.name.trim().toLowerCase(), item);
  }
}

for (const weapon of weaponItems) {
  const name = weapon.Name?.trim().toLowerCase();
  if (name) {
    weaponByName.set(name, weapon);
  }
}

for (const armor of armorItems) {
  const name = armor.Armor?.trim().toLowerCase();
  if (name) {
    armorByName.set(name, armor);
  }
}

function resolveSourceKey(item: Item): string | undefined {
  const directSourceKey = item.source_key?.trim();
  if (directSourceKey) {
    return directSourceKey;
  }

  if (typeof item.source_index === 'number') {
    const matchedByLegacyIndex = masterItemByLegacyIndex.get(item.source_index);
    const legacyKey = matchedByLegacyIndex?.key?.trim();
    if (legacyKey) {
      return legacyKey;
    }
  }

  if (!item.name) {
    return undefined;
  }

  const sourcebook = (item.sourcebook || '').trim().toLowerCase();
  const isSrd = !sourcebook || sourcebook === 'srd-2024' || sourcebook === 'system reference document 5.2' || sourcebook === 'unknown';
  if (!isSrd) {
    return undefined;
  }

  const matched = masterItemByName.get(item.name.trim().toLowerCase());
  return matched?.key;
}

function withWeaponStats(baseItem: Omit<Item, 'id'>): Omit<Item, 'id'> {
  const lookupKey = (baseItem.type || baseItem.name || '').trim().toLowerCase();
  const weaponStats = weaponByName.get(lookupKey);
  if (!weaponStats) {
    return baseItem;
  }

  return {
    ...baseItem,
    damage: weaponStats.Damage || baseItem.damage,
    properties: weaponStats.Properties || baseItem.properties,
    mastery: weaponStats.Mastery || baseItem.mastery,
  };
}

function withArmorStats(baseItem: Omit<Item, 'id'>): Omit<Item, 'id'> {
  const lookupKey = (baseItem.type || baseItem.name || '').trim().toLowerCase();
  const armorStats = armorByName.get(lookupKey);
  if (!armorStats) {
    return baseItem;
  }

  return {
    ...baseItem,
    armorClass: armorStats['Armor Class (AC)'] || baseItem.armorClass,
    strengthRequirement: armorStats.Strength || baseItem.strengthRequirement,
    stealth: armorStats.Stealth || baseItem.stealth,
  };
}

function getBaseItemFromSourceKey(sourceKey: string): Omit<Item, 'id'> | null {
  const baseRaw = masterItemByKey.get(sourceKey);
  if (!baseRaw) {
    return null;
  }

  return withArmorStats(withWeaponStats(transformMasterItem(baseRaw)));
}

export function hydrateItem(dbItem: Item): Item {
  const sourceKey = resolveSourceKey(dbItem);
  if (!sourceKey) {
    return dbItem;
  }

  const baseItem = getBaseItemFromSourceKey(sourceKey);
  if (!baseItem) {
    return { ...dbItem, source_key: sourceKey };
  }

  return {
    ...baseItem,
    ...dbItem,
    source_key: sourceKey,
  };
}

export function dehydrateItem(item: Item): Item {
  const sourceKey = resolveSourceKey(item);
  if (!sourceKey) {
    return item;
  }

  const baseItem = getBaseItemFromSourceKey(sourceKey);
  if (!baseItem) {
    return { ...item, source_key: sourceKey };
  }

  const minimal: Partial<Item> & Pick<Item, 'id' | 'quantity'> = {
    id: item.id,
    quantity: item.quantity,
    source_key: sourceKey,
  };

  const itemWithSource: Item = { ...item, source_key: sourceKey };

  for (const [key, value] of Object.entries(itemWithSource)) {
    if (key === 'id' || key === 'quantity' || key === 'source_key' || key === 'source_index') {
      continue;
    }
    if (value === undefined) {
      continue;
    }

    const baseValue = (baseItem as any)[key];
    if (value === baseValue) {
      continue;
    }

    if (key === 'createdAt') {
      continue;
    }
    if (key === 'hiddenFromOthers' && value === false) {
      continue;
    }
    if (key === 'attuned' && value === false && !baseValue) {
      continue;
    }

    (minimal as any)[key] = value;
  }

  return minimal as Item;
}

export function hydrateCampaign(doc: CampaignDoc): CampaignDoc {
  return {
    ...doc,
    sharedLoot: (doc.sharedLoot || []).map(hydrateItem),
    customItemPool: doc.customItemPool ? doc.customItemPool.map(hydrateItem) : doc.customItemPool,
  };
}

export function hydrateUserDoc<T extends { userHomebrew?: Item[] }>(doc: T): T {
  return {
    ...doc,
    userHomebrew: doc.userHomebrew ? doc.userHomebrew.map(hydrateItem) : doc.userHomebrew,
  };
}

export function hydratePlayerInventory(doc: PlayerInventoryDoc): PlayerInventoryDoc {
  return {
    ...doc,
    inventory: (doc.inventory || []).map(hydrateItem),
  };
}

export function hydrateTransferRequest(doc: TransferRequest): TransferRequest {
  if (!doc.itemData) {
    return doc;
  }

  return {
    ...doc,
    itemData: hydrateItem(doc.itemData),
  };
}
