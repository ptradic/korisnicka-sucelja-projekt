import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Trash2, Save, Edit2, Coins, Weight, Package, Sparkles, Star, StickyNote, Sword, Shield, Droplet, Backpack, Gem, EyeOff, Eye, ScrollText, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeCategory, type Item, type Category, type Rarity, type ValueUnit } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useCustomScrollbar } from '../hooks/useCustomScrollbar';
import companionDataJson from '@/2024companion.json';
import { weaponClassificationMap } from '@/src/hydrateItems';

interface ItemDetailsModalProps {
  item: Item;
  onClose: () => void;
  onUpdate?: (updates: Partial<Item>) => void;
  onDelete?: () => void;
  showDeleteAction?: boolean;
  deleteLabel?: string;
  confirmOnDelete?: boolean;
  canEdit?: boolean;
  canToggleHidden?: boolean;
  canToggleAttunement?: boolean;
  showQuantity?: boolean;
}

interface WeaponLookupEntry {
  Name?: string;
  Damage?: string;
  Properties?: string;
  Mastery?: string;
}

interface ArmorLookupEntry {
  Armor?: string;
  'Armor Class (AC)'?: string;
  Strength?: string;
  Stealth?: string;
}

interface CompanionDefinitionsData {
  weapons?: WeaponLookupEntry[];
  armors?: ArmorLookupEntry[];
  propertyDefinitions?: Record<string, string>;
  masteryDefinitions?: Record<string, string>;
}

const categories: Category[] = ['weapons', 'armor', 'consumables', 'magic-gear', 'adventuring-gear', 'wealth-valuables'];
const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];
const companionDefinitions = Array.isArray(companionDataJson)
  ? { weapons: companionDataJson as WeaponLookupEntry[] }
  : (companionDataJson as CompanionDefinitionsData);
const companionWeapons = companionDefinitions.weapons ?? [];
const companionArmors = companionDefinitions.armors ?? [];
const weaponTypes = Array.from(new Set(companionWeapons.map((weapon) => weapon.Name?.trim()).filter(Boolean))) as string[];
const armorTypes = Array.from(new Set(companionArmors.map((armor) => armor.Armor?.trim()).filter(Boolean))) as string[];
const weaponTypeMap = new Map(
  companionWeapons
    .map((weapon) => [weapon.Name?.trim().toLowerCase(), weapon] as const)
    .filter(([name]) => Boolean(name)),
);
const armorTypeMap = new Map(
  companionArmors
    .map((armor) => [armor.Armor?.trim().toLowerCase(), armor] as const)
    .filter(([name]) => Boolean(name)),
);
const propertyOptions = Object.keys(companionDefinitions.propertyDefinitions ?? {});
const masteryOptions = Object.keys(companionDefinitions.masteryDefinitions ?? {});

const formatCategoryLabel = (category: string) => {
  if (category === 'wealth-valuables') return 'Wealth & Valuables';
  return category
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const rarityColors: Record<string, string> = {
  common: 'text-[#5C4A2F]',
  uncommon: 'text-[#3D5A27]',
  rare: 'text-[#2C4A7C]',
  'very rare': 'text-[#5E3A7C]',
  legendary: 'text-[#8B6914]',
  artifact: 'text-[#6B2020]',
};

const rarityGradients: Record<string, string> = {
  common: 'from-[#8B6F47] to-[#A0845A]',
  uncommon: 'from-[#3D5A27] to-[#5C7A3B]',
  rare: 'from-[#2C4A7C] to-[#4A6FA5]',
  'very rare': 'from-[#5E3A7C] to-[#7E57A2]',
  legendary: 'from-[#8B6914] to-[#B8860B]',
  artifact: 'from-[#6B2020] to-[#8B3A3A]',
};

const categoryIcons: Partial<Record<Category, React.ComponentType<{ className?: string }>>> = {
  weapons: Sword,
  armor: Shield,
  consumables: Droplet,
  'magic-gear': Sparkles,
  'adventuring-gear': Backpack,
  'wealth-valuables': Gem,
  hidden: Package,
};

function normalizeValueUnit(value: number, valueUnit: ValueUnit): { value: number; valueUnit: ValueUnit } {
  if (valueUnit === 'gp' && value > 0 && value < 1) {
    if (value < 0.1) {
      return { value: Number((value * 100).toFixed(2)), valueUnit: 'cp' };
    }
    return { value: Number((value * 10).toFixed(2)), valueUnit: 'sp' };
  }

  return { value: Number(value.toFixed(2)), valueUnit };
}

function toGpValue(value: number, valueUnit: ValueUnit): number {
  if (valueUnit === 'sp') return Number((value / 10).toFixed(4));
  if (valueUnit === 'cp') return Number((value / 100).toFixed(4));
  return value;
}

function getValueColor(valueUnit: ValueUnit): string {
  if (valueUnit === 'sp') return 'text-[#7A869A]';
  if (valueUnit === 'cp') return 'text-[#7A3E2A]';
  return 'text-[#B8860B]';
}

function splitChoiceList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function matchesChoiceToken(token: string, option: string): boolean {
  const normalizedToken = token.toLowerCase();
  const normalizedOption = option.toLowerCase();
  return (
    normalizedToken === normalizedOption
    || normalizedToken.startsWith(`${normalizedOption} `)
    || normalizedToken.startsWith(`${normalizedOption}(`)
  );
}

function mapValueToChoices(value: string, options: string[]): string[] {
  const tokens = splitChoiceList(value);
  const matched = tokens
    .map((token) => options.find((option) => matchesChoiceToken(token, option)))
    .filter((option): option is string => Boolean(option));

  return Array.from(new Set(matched));
}

function getUnmappedTokens(value: string, options: string[]): string[] {
  return splitChoiceList(value).filter(
    (token) => !options.some((option) => matchesChoiceToken(token, option)),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractPropertyOptionsFromText(value: string): string[] {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return [];

  return propertyOptions.filter((option) => {
    const pattern = new RegExp(`(^|[^a-z])${escapeRegExp(option.toLowerCase())}(?=[^a-z]|$)`, 'i');
    return pattern.test(normalized);
  });
}

/**
 * Strips the leading **Metadata Line**\n\n prefix added by hydrateItems.
 * If the meta line contains attunement info it is kept, since that restriction is meaningful.
 */
function stripDescriptionMetaLine(description: string | undefined): string | null {
  if (!description) return null;
  const match = description.match(/^\*\*([^*]+)\*\*\n\n([\s\S]*)$/);
  if (match) {
    if (match[1].toLowerCase().includes('attunement')) return description.trim();
    return match[2].trim() || null;
  }
  return description.trim() || null;
}

/** Returns property tokens paired with their full definitions from 2024companion.json. */
function getPropertyDefinitions(properties: string): Array<{ token: string; definition: string }> {
  const tokens = splitChoiceList(properties);
  const result: Array<{ token: string; definition: string }> = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const matchedKey = propertyOptions.find((opt) => matchesChoiceToken(token, opt));
    if (matchedKey && !seen.has(matchedKey)) {
      const definition = companionDefinitions.propertyDefinitions?.[matchedKey];
      if (definition) {
        seen.add(matchedKey);
        result.push({ token, definition });
      }
    }
  }
  return result;
}

/** Returns the mastery name + definition, or null if not found. */
function getMasteryDefinition(mastery: string): { name: string; definition: string } | null {
  const tokens = splitChoiceList(mastery);
  for (const token of tokens) {
    const matchedKey = masteryOptions.find((opt) => matchesChoiceToken(token, opt));
    if (matchedKey) {
      const definition = companionDefinitions.masteryDefinitions?.[matchedKey];
      if (definition) return { name: matchedKey, definition };
    }
  }
  return null;
}

/** Returns a label like "Martial Ranged Weapon" or "Simple Melee Weapon", or null if unknown. */
function getWeaponClassificationLabel(item: Item): string | null {
  const typeKey = (item.type || item.name || '').trim().toLowerCase();
  const classification = weaponClassificationMap.get(typeKey);
  if (!classification) return null;
  const tier = classification.martial ? 'Martial' : classification.simple ? 'Simple' : null;
  const isRanged = item.properties
    ? splitChoiceList(item.properties).some((t) => matchesChoiceToken(t, 'Ammunition'))
    : false;
  const range = isRanged ? 'Ranged' : 'Melee';
  return tier ? `${tier} ${range} Weapon` : `${range} Weapon`;
}

export function ItemDetailsModal({ item, onClose, onUpdate, onDelete, showDeleteAction = true, deleteLabel = 'Remove', confirmOnDelete = false, canEdit = true, canToggleHidden = false, canToggleAttunement = false, showQuantity = true }: ItemDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedDefs, setExpandedDefs] = useState<Set<string>>(new Set());
  const toggleDef = (key: string) => setExpandedDefs((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPropertyPickerOpen, setIsPropertyPickerOpen] = useState(false);
  const [quantityInput, setQuantityInput] = useState<string>(item.quantity.toString());
  const backdropMouseDown = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const propertyPickerRef = useRef<HTMLDivElement | null>(null);
  const editDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const editDescriptionTrackRef = useRef<HTMLDivElement | null>(null);
  const isEditDescriptionDragging = useRef(false);
  const editDescriptionDragStartY = useRef(0);
  const editDescriptionDragStartTop = useRef(0);
  const {
    showScrollbar,
    thumbTop,
    thumbHeight,
    trackRef,
    handleTrackClick,
    handleThumbMouseDown,
  } = useCustomScrollbar(contentRef);
  const [showEditDescriptionScrollbar, setShowEditDescriptionScrollbar] = useState(false);
  const [editDescriptionThumbTop, setEditDescriptionThumbTop] = useState(0);
  const [editDescriptionThumbHeight, setEditDescriptionThumbHeight] = useState(0);

  // Intercept browser back button to close the modal instead of navigating away
  // Intercept browser back button to close the modal instead of navigating away
  useEffect(() => {
    history.pushState({ tbvModal: true }, '');
    const handlePopState = () => { onClose(); };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const updateEditDescriptionScrollbar = () => {
    const el = editDescriptionRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasScroll = scrollHeight > clientHeight + 1;
    setShowEditDescriptionScrollbar(hasScroll);

    if (!hasScroll) {
      setEditDescriptionThumbTop(0);
      setEditDescriptionThumbHeight(0);
      return;
    }

    const trackH = Math.max(1, editDescriptionTrackRef.current?.clientHeight ?? clientHeight);
    const ratio = clientHeight / scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const tTop = maxTop * (scrollTop / Math.max(1, scrollHeight - clientHeight));
    setEditDescriptionThumbHeight(tHeight);
    setEditDescriptionThumbTop(tTop);
  };

  useEffect(() => {
    if (!isEditing) return;

    const el = editDescriptionRef.current;
    if (!el) return;

    const handler = () => updateEditDescriptionScrollbar();
    el.addEventListener('scroll', handler);
    el.addEventListener('input', handler);

    const resizeObserver = new ResizeObserver(handler);
    resizeObserver.observe(el);

    const timer = setTimeout(handler, 100);

    return () => {
      el.removeEventListener('scroll', handler);
      el.removeEventListener('input', handler);
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [isEditing]);

  const handleEditDescriptionThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isEditDescriptionDragging.current = true;
    editDescriptionDragStartY.current = e.clientY;
    editDescriptionDragStartTop.current = editDescriptionThumbTop;

    const handleMove = (ev: MouseEvent) => {
      if (!isEditDescriptionDragging.current || !editDescriptionRef.current) return;
      const el = editDescriptionRef.current;
      const trackH = Math.max(1, editDescriptionTrackRef.current?.clientHeight ?? el.clientHeight);
      const delta = ev.clientY - editDescriptionDragStartY.current;
      const ratio = el.clientHeight / el.scrollHeight;
      const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
      const maxTop = Math.max(0, trackH - tHeight);
      const newTop = Math.min(maxTop, Math.max(0, editDescriptionDragStartTop.current + delta));
      const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
      el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
    };

    const handleUp = () => {
      isEditDescriptionDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleEditDescriptionTrackClick = (e: React.MouseEvent) => {
    if (!editDescriptionTrackRef.current || !editDescriptionRef.current) return;
    const rect = editDescriptionTrackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const el = editDescriptionRef.current;
    const trackH = Math.max(1, rect.height);
    const ratio = el.clientHeight / el.scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const newTop = Math.min(maxTop, Math.max(0, clickY - tHeight / 2));
    const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
    el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
  };

  const initialGpValue = item.value && item.value > 0
    ? toGpValue(item.value, (item.valueUnit || 'gp') as ValueUnit)
    : null;
  const initialCategory = normalizeCategory(item.category);
  const initialWeaponType = initialCategory === 'weapons' ? (item.type || item.name || '') : '';
  const initialArmorType = initialCategory === 'armor' ? (item.type || item.name || '') : '';
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    category: item.category,
    weaponType: initialWeaponType,
    armorType: initialArmorType,
    rarity: item.rarity,
    quantity: item.quantity.toString(),
    damage: item.damage || '',
    properties: item.properties || '',
    mastery: item.mastery || '',
    armorClass: item.armorClass || '',
    strengthRequirement: item.strengthRequirement || '',
    stealth: item.stealth || '',
    weight: item.weight.toString(),
    value: initialGpValue ? initialGpValue.toString() : '',
    attunement: item.attunement || false,
    attuned: item.attuned || false,
  });
  const selectedPropertyOptions = useMemo(
    () => mapValueToChoices(formData.properties, propertyOptions),
    [formData.properties],
  );
  const customPropertyTokens = useMemo(
    () => getUnmappedTokens(formData.properties, propertyOptions),
    [formData.properties],
  );
  const selectedMasteryOption = useMemo(() => {
    const selected = mapValueToChoices(formData.mastery, masteryOptions);
    return selected[0] || '';
  }, [formData.mastery]);
  const customMasteryValue = useMemo(() => {
    const unmapped = getUnmappedTokens(formData.mastery, masteryOptions);
    return unmapped[0] || '';
  }, [formData.mastery]);

  const togglePropertyOption = (option: string) => {
    setFormData((prev) => {
      const currentKnown = mapValueToChoices(prev.properties, propertyOptions);
      const currentCustom = getUnmappedTokens(prev.properties, propertyOptions);
      const nextKnown = currentKnown.includes(option)
        ? currentKnown.filter((value) => value !== option)
        : [...currentKnown, option];

      return {
        ...prev,
        properties: [...nextKnown, ...currentCustom].join(', '),
      };
    });
  };

  useEffect(() => {
    if (!isPropertyPickerOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!propertyPickerRef.current) return;
      if (!propertyPickerRef.current.contains(event.target as Node)) {
        setIsPropertyPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isPropertyPickerOpen]);

  const handleSave = async () => {
    if (!onUpdate) {
      setIsEditing(false);
      return;
    }

    const parsedValue = formData.value ? parseFloat(formData.value) : 0;
    const hasEstimatedValue = Number.isFinite(parsedValue) && parsedValue > 0;
    const parsedQuantity = formData.quantity === '' ? 1 : Number(formData.quantity);
    const parsedWeight = formData.weight === '' ? 0 : Number(formData.weight);
    const normalizedValue = hasEstimatedValue
      ? normalizeValueUnit(parsedValue, 'gp')
      : null;

    await onUpdate({
      name: formData.name,
      type: normalizeCategory(formData.category) === 'weapons'
        ? (formData.weaponType.trim() || formData.name.trim())
        : normalizeCategory(formData.category) === 'armor'
          ? (formData.armorType.trim() || formData.name.trim())
        : formData.name.trim(),
      description: formData.description,
      category: formData.category,
      rarity: formData.rarity,
      quantity: Number.isFinite(parsedQuantity) && parsedQuantity >= 1 ? Math.floor(parsedQuantity) : 1,
      damage: formData.damage.trim() || undefined,
      properties: formData.properties.trim() || undefined,
      mastery: formData.mastery.trim() || undefined,
      armorClass: formData.armorClass.trim() || undefined,
      strengthRequirement: formData.strengthRequirement.trim() || undefined,
      stealth: formData.stealth.trim() || undefined,
      weight: Number.isFinite(parsedWeight) && parsedWeight >= 0 ? parsedWeight : 0,
      value: normalizedValue ? normalizedValue.value : undefined,
      valueUnit: normalizedValue ? normalizedValue.valueUnit : undefined,
      valueUnknown: hasEstimatedValue ? undefined : true,
      attunement: formData.attunement,
      attuned: formData.attunement ? formData.attuned : false,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirmOnDelete) {
      setShowDeleteConfirm(true);
    } else {
      onDelete?.();
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  const displayValue = item.value && item.value > 0
    ? normalizeValueUnit(item.value, (item.valueUnit || 'gp') as ValueUnit)
    : null;
  const quantityMultiplier = showQuantity ? item.quantity : 1;

  const gradient = rarityGradients[item.rarity] || rarityGradients.common;
  const activeCategory = normalizeCategory(isEditing ? formData.category : item.category);
  const ItemTypeIcon = categoryIcons[activeCategory] || Package;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => { backdropMouseDown.current = e.target === e.currentTarget; }}
      onMouseUp={(e) => {
        if (backdropMouseDown.current && e.target === e.currentTarget) onClose();
        backdropMouseDown.current = false;
      }}
    >
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)', maxHeight: 'min(90vh, 700px)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#F5EFE0] p-4 sm:p-5 pb-3 flex flex-col gap-1 z-10 rounded-t-xl shrink-0">
          {/* Row 1: icon + name + buttons */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
              <ItemTypeIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] font-extrabold focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                />
              ) : (
                <h2 className="text-lg font-extrabold text-[#3D1409] break-words">{item.name}</h2>
              )}
            </div>
            {!isEditing && canEdit && onUpdate && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all shrink-0"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Row 2: rarity + sourcebook — aligned to icon left / X right */}
          {!isEditing && (
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm font-extrabold capitalize ${rarityColors[item.rarity]}`}>
                {item.rarity} {item.category}
                {showQuantity && item.quantity > 1 && <span className="text-[#5C4A2F] ml-1">× {item.quantity}</span>}
              </p>
              <p className="text-[10px] text-[#5C4A2F] uppercase tracking-wide shrink-0">Sourcebook: {item.sourcebook || 'unknown'}</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 sm:mx-5 border-t-2 border-[#DCC8A8] shrink-0" />

        {/* Content */}
        <div className="relative flex-1 min-h-0 flex">
          <div
            ref={contentRef}
            className={
              isEditing
                ? 'p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 flex flex-col gap-2 custom-scrollbar'
                : 'p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar'
            }
          >
          {isEditing ? (
            <>
              <div className="shrink-0 flex flex-col">
                <label className="block text-[#3D1409] font-semibold text-sm mb-0.5 shrink-0">Description</label>
                <div className="relative" style={{ height: '120px' }}>
                  <textarea
                    ref={editDescriptionRef}
                    defaultValue={formData.description}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      setFormData((prev) => ({ ...prev, description: el.value }));
                      updateEditDescriptionScrollbar();
                    }}
                    onKeyUp={(e) => {
                      const el = e.currentTarget;
                      setFormData((prev) => ({ ...prev, description: el.value }));
                      updateEditDescriptionScrollbar();
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-full h-full pl-3 pr-10 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 custom-scrollbar resize-none"
                    placeholder="Describe the item..."
                  />

                  {showEditDescriptionScrollbar && (
                    <div
                      ref={editDescriptionTrackRef}
                      onClick={handleEditDescriptionTrackClick}
                      className="absolute top-2 right-1 bottom-3 w-3.5 flex items-stretch cursor-pointer"
                    >
                      <div
                        onMouseDown={handleEditDescriptionThumbMouseDown}
                        className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
                        style={{
                          top: `${editDescriptionThumbTop}px`,
                          height: `${editDescriptionThumbHeight}px`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 1: Category + Rarity */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <div className="min-w-[220px] flex-1">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
                    Category <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const nextCategory = e.target.value as Category;
                      setFormData((prev) => ({
                        ...prev,
                        category: nextCategory,
                        weaponType: normalizeCategory(nextCategory) === 'weapons' ? prev.weaponType : '',
                        armorType: normalizeCategory(nextCategory) === 'armor' ? prev.armorType : '',
                        damage: normalizeCategory(nextCategory) === 'weapons' ? prev.damage : '',
                        properties: normalizeCategory(nextCategory) === 'weapons' ? prev.properties : '',
                        mastery: normalizeCategory(nextCategory) === 'weapons' ? prev.mastery : '',
                        armorClass: normalizeCategory(nextCategory) === 'armor' ? prev.armorClass : '',
                        strengthRequirement: normalizeCategory(nextCategory) === 'armor' ? prev.strengthRequirement : '',
                        stealth: normalizeCategory(nextCategory) === 'armor' ? prev.stealth : '',
                      }));
                      if (normalizeCategory(nextCategory) !== 'weapons') {
                        setIsPropertyPickerOpen(false);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{formatCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>

                {normalizeCategory(formData.category) === 'weapons' && (
                  <div className="min-w-[220px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
                      Weapon Type <span className="text-[#8B3A3A]">*</span>
                    </label>
                    <select
                      value={formData.weaponType}
                      onChange={(e) => {
                        const selectedWeaponType = e.target.value;
                        const matchedWeapon = weaponTypeMap.get(selectedWeaponType.trim().toLowerCase());
                        const mappedProperties = matchedWeapon?.Properties
                          ? extractPropertyOptionsFromText(matchedWeapon.Properties).join(', ')
                          : '';

                        setFormData((prev) => ({
                          ...prev,
                          weaponType: selectedWeaponType,
                          damage: matchedWeapon?.Damage ?? prev.damage,
                          properties: mappedProperties || prev.properties,
                          mastery: matchedWeapon?.Mastery ?? prev.mastery,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    >
                      <option value="">Select a weapon type</option>
                      {weaponTypes.map((weaponType) => (
                        <option key={weaponType} value={weaponType}>{weaponType}</option>
                      ))}
                    </select>
                  </div>
                )}

                {normalizeCategory(formData.category) === 'armor' && (
                  <div className="min-w-[220px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
                      Armor Type <span className="text-[#8B3A3A]">*</span>
                    </label>
                    <select
                      value={formData.armorType}
                      onChange={(e) => {
                        const selectedArmorType = e.target.value;
                        const matchedArmor = armorTypeMap.get(selectedArmorType.trim().toLowerCase());

                        setFormData((prev) => ({
                          ...prev,
                          armorType: selectedArmorType,
                          armorClass: matchedArmor?.['Armor Class (AC)'] ?? prev.armorClass,
                          strengthRequirement: matchedArmor?.Strength ?? prev.strengthRequirement,
                          stealth: matchedArmor?.Stealth ?? prev.stealth,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    >
                      <option value="">Select an armor type</option>
                      {armorTypes.map((armorType) => (
                        <option key={armorType} value={armorType}>{armorType}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="min-w-[220px] flex-1">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
                    Rarity <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
                  >
                    {rarities.map(rar => (
                      <option key={rar} value={rar} className="capitalize">{rar}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Quantity + Weight + Value + Attunement */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <div className="min-w-[180px] flex-1">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
                    Quantity <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    placeholder="1"
                  />
                </div>

                <div className="min-w-[180px] flex-1">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    placeholder="0.0"
                  />
                </div>

                <div className="min-w-[180px] flex-1">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Value (gp)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    placeholder="Not estimated"
                  />
                </div>

                <div className="min-w-[180px] flex-1">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Attunement</label>
                  <select
                    value={formData.attunement ? 'requires' : 'does-not-require'}
                    onChange={(e) => {
                      const requiresAttunement = e.target.value === 'requires';
                      setFormData({
                        ...formData,
                        attunement: requiresAttunement,
                        attuned: requiresAttunement ? formData.attuned : false,
                      });
                    }}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                  >
                    <option value="requires">Requires</option>
                    <option value="does-not-require">Doesn't require</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Weapon fields */}
              {normalizeCategory(formData.category) === 'weapons' && (
                <div className="flex flex-wrap gap-2 shrink-0">
                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Damage</label>
                    <input
                      type="text"
                      value={formData.damage}
                      onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
                      className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                      placeholder="e.g., 1d8 Slashing"
                    />
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Properties</label>
                    <div className="relative" ref={propertyPickerRef}>
                      <button
                        type="button"
                        onClick={() => setIsPropertyPickerOpen((prev) => !prev)}
                        className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 flex items-center justify-between text-left"
                      >
                        <span>{selectedPropertyOptions.length > 0 ? `${selectedPropertyOptions.length} selected` : 'Select properties'}</span>
                        <span className="text-xs text-[#8B6F47]">{isPropertyPickerOpen ? 'Close' : 'Open'}</span>
                      </button>

                      {isPropertyPickerOpen && (
                        <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border-3 border-[#8B6F47] bg-[#F5EFE0] p-2 shadow-lg max-h-[180px] overflow-y-auto custom-scrollbar space-y-1.5">
                          {propertyOptions.map((option) => (
                            <label key={option} className="flex items-center gap-2 text-xs text-[#3D1409] cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={selectedPropertyOptions.includes(option)}
                                onChange={() => togglePropertyOption(option)}
                                className="h-3.5 w-3.5 rounded border-[#8B6F47] text-[#5C1A1A] focus:ring-[#5C1A1A]/30"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedPropertyOptions.length > 0 && (
                      <p className="mt-1 text-[10px] text-[#5C4A2F] leading-relaxed">{selectedPropertyOptions.join(', ')}</p>
                    )}
                    {customPropertyTokens.length > 0 && (
                      <p className="mt-1 text-[10px] text-[#8B6F47]">
                        Custom values kept: {customPropertyTokens.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Mastery</label>
                    <select
                      value={selectedMasteryOption || customMasteryValue}
                      onChange={(e) => setFormData({ ...formData, mastery: e.target.value })}
                      className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    >
                      <option value="">Select mastery</option>
                      {customMasteryValue && !masteryOptions.includes(customMasteryValue) && (
                        <option value={customMasteryValue}>{customMasteryValue} (custom)</option>
                      )}
                      {masteryOptions.map((mastery) => (
                        <option key={mastery} value={mastery}>{mastery}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {normalizeCategory(formData.category) === 'armor' && (
                <div className="flex flex-wrap gap-2 shrink-0">
                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Armor Class</label>
                    <input
                      type="text"
                      value={formData.armorClass}
                      onChange={(e) => setFormData({ ...formData, armorClass: e.target.value })}
                      className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                      placeholder="e.g., 16"
                    />
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Strength</label>
                    <input
                      type="text"
                      value={formData.strengthRequirement}
                      onChange={(e) => setFormData({ ...formData, strengthRequirement: e.target.value })}
                      className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                      placeholder="e.g., 15 or -"
                    />
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Stealth</label>
                    <input
                      type="text"
                      value={formData.stealth}
                      onChange={(e) => setFormData({ ...formData, stealth: e.target.value })}
                      className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                      placeholder="e.g., Disadvantage or -"
                    />
                  </div>
                </div>
              )}

              <div className="border-t-2 border-[#DCC8A8] shrink-0" />

              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1 px-4 py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex-1 group px-4 py-2.5"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              {normalizeCategory(item.category) === 'weapons' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <Sword className="w-3.5 h-3.5" />
                      <span>Damage</span>
                    </div>
                    <p className="text-[#3D1409] font-bold text-sm">{item.damage || '-'}</p>
                  </div>

                  <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <ScrollText className="w-3.5 h-3.5" />
                      <span>Properties</span>
                    </div>
                    <p className="text-[#3D1409] font-bold text-sm">{item.properties || '-'}</p>
                  </div>

                  <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mastery</span>
                    </div>
                    <p className="text-[#3D1409] font-bold text-sm">{item.mastery || '-'}</p>
                  </div>
                </div>
              )}

              {/* Description: magic text first, then weapon classification + property/mastery defs */}
              {(() => {
                const viewCategory = normalizeCategory(item.category);
                const bodyText = stripDescriptionMetaLine(item.description);
                const isMagic = item.rarity !== 'common' || Boolean(item.attunement);
                const displayBodyText = isMagic ? bodyText : null;
                const classificationLabel = viewCategory === 'weapons' ? getWeaponClassificationLabel(item) : null;
                const propertyDefs = viewCategory === 'weapons' && item.properties
                  ? getPropertyDefinitions(item.properties) : [];
                const masteryDef = viewCategory === 'weapons' && item.mastery
                  ? getMasteryDefinition(item.mastery) : null;
                const hasDefs = propertyDefs.length > 0 || masteryDef !== null;
                const nonWeaponBodyText = viewCategory !== 'weapons' && !displayBodyText ? bodyText : null;
                if (!displayBodyText && !classificationLabel && !hasDefs && !nonWeaponBodyText) return null;

                const mdComponents = {
                  p: ({ children }: { children?: React.ReactNode }) => <p className="leading-relaxed">{children}</p>,
                  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
                  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-[#2D0F06]">{children}</strong>,
                  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
                  code: ({ children }: { children?: React.ReactNode }) => <code className="font-mono text-[0.85em] bg-[#F5EFE0] px-1 py-0.5 rounded">{children}</code>,
                  table: ({ children }: { children?: React.ReactNode }) => (
                    <div className="overflow-x-auto rounded-lg border border-[#DCC8A8] bg-[#F8F2E6]">
                      <table className="min-w-full border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-[#E8D5B7]">{children}</thead>,
                  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
                  tr: ({ children }: { children?: React.ReactNode }) => <tr className="border-b border-[#DCC8A8] last:border-0">{children}</tr>,
                  th: ({ children }: { children?: React.ReactNode }) => <th className="px-3 py-2 text-left font-semibold text-[#3D1409]">{children}</th>,
                  td: ({ children }: { children?: React.ReactNode }) => <td className="px-3 py-2 text-[#3D1409] align-top">{children}</td>,
                };

                return (
                  <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider">
                      <StickyNote className="w-3.5 h-3.5" />
                      <span>Description</span>
                    </div>

                    {/* Magic item description shown first */}
                    {displayBodyText && (
                      <div className="text-[#3D1409] text-sm leading-relaxed space-y-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {displayBodyText}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Non-weapon item descriptions (potions, gear, etc.) */}
                    {nonWeaponBodyText && (
                      <div className="text-[#3D1409] text-sm leading-relaxed space-y-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {nonWeaponBodyText}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Weapon classification + property/mastery definitions */}
                    {(classificationLabel || hasDefs) && (
                      <div className="space-y-2.5">
                        {(displayBodyText || nonWeaponBodyText) && <div className="border-t border-[#DCC8A8]" />}
                        {classificationLabel && (
                          <p className="text-[#5C4A2F] text-xs font-semibold uppercase tracking-wide italic">
                            {classificationLabel}
                          </p>
                        )}
                        {propertyDefs.map(({ token, definition }) => {
                          const isOpen = expandedDefs.has(token);
                          return (
                            <div key={token}>
                              <button
                                type="button"
                                onClick={() => toggleDef(token)}
                                className="flex items-center gap-1 text-left group"
                              >
                                <span className="font-bold text-[#2D0F06] text-sm">{token}.</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-[#8B6F47] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {isOpen && (
                                <p className="mt-1 text-[#3D1409] text-sm leading-relaxed">{definition}</p>
                              )}
                            </div>
                          );
                        })}
                        {masteryDef && (() => {
                          const masteryKey = `mastery:${masteryDef.name}`;
                          const isOpen = expandedDefs.has(masteryKey);
                          return (
                            <div>
                              <button
                                type="button"
                                onClick={() => toggleDef(masteryKey)}
                                className="flex items-center gap-1 text-left group"
                              >
                                <span className="font-bold text-[#2D0F06] text-sm">Mastery: {masteryDef.name}.</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-[#8B6F47] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {isOpen && (
                                <p className="mt-1 text-[#3D1409] text-sm leading-relaxed">{masteryDef.definition}</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stats row */}
              <div className={`grid gap-3 ${showQuantity ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Weight className="w-3.5 h-3.5" />
                    <span>Weight</span>
                  </div>
                  <p className="text-[#3D1409] font-bold text-sm">
                    {(item.weight * quantityMultiplier).toFixed(1)} lbs
                    {showQuantity && item.quantity > 1 && (
                      <span className="text-[#5C4A2F] text-xs font-normal ml-1">
                        ({item.weight} × {item.quantity})
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Value</span>
                  </div>
                  {item.valueUnknown || !displayValue ? (
                    <p className="text-[#8B6F47] font-bold text-sm">Not estimated</p>
                  ) : (
                    <p className={getValueColor(displayValue.valueUnit) + ' font-bold text-sm'}>
                      {(displayValue.value * quantityMultiplier).toLocaleString()} {displayValue.valueUnit}
                      {showQuantity && item.quantity > 1 && (
                        <span className="text-[#5C4A2F] text-xs font-normal ml-1">
                          ({displayValue.value} × {item.quantity})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Mobile: horizontal bar with big buttons */}
                {showQuantity && (
                <div className="sm:hidden bg-white/50 border-2 border-[#DCC8A8] rounded-xl px-2 py-1.5 col-span-2 flex items-center justify-between gap-2">
                  {onUpdate && (
                    <button
                      onClick={() => { const q = Math.max(1, item.quantity - 1); onUpdate({ quantity: q }); setQuantityInput(q.toString()); }}
                      className="w-8 h-8 rounded-lg bg-[#DCC8A8] hover:bg-[#C4B090] text-[#3D1409] font-bold text-base flex items-center justify-center transition-colors shrink-0"
                    >−</button>
                  )}
                  <div className="flex items-center gap-1.5 text-[#5C4A2F] text-sm font-semibold uppercase tracking-wider">
                    <Package className="w-3.5 h-3.5" />
                    <span>Quantity:</span>
                    {onUpdate ? (
                      <input
                        type="number"
                        min="1"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(quantityInput);
                          if (!isNaN(val) && val >= 1) { onUpdate({ quantity: val }); setQuantityInput(val.toString()); }
                          else setQuantityInput(item.quantity.toString());
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        className="w-12 text-center text-lg font-bold text-[#3D1409] bg-white/70 border-2 border-transparent rounded-lg focus:outline-none focus:border-[#5C1A1A] leading-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      <span className="text-[#3D1409] font-bold text-lg leading-none">{item.quantity}</span>
                    )}
                  </div>
                  {onUpdate ? (
                    <button
                      onClick={() => { const q = item.quantity + 1; onUpdate({ quantity: q }); setQuantityInput(q.toString()); }}
                      className="w-8 h-8 rounded-lg bg-[#DCC8A8] hover:bg-[#C4B090] text-[#3D1409] font-bold text-base flex items-center justify-center transition-colors shrink-0"
                    >+</button>
                  ) : (
                    <div />
                  )}
                </div>
                )}

                {/* Desktop: original card layout */}
                {showQuantity && (
                <div className="hidden sm:block bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>Quantity</span>
                  </div>
                  {onUpdate ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { const q = Math.max(1, item.quantity - 1); onUpdate({ quantity: q }); setQuantityInput(q.toString()); }}
                        className="w-6 h-6 rounded-lg bg-[#DCC8A8] hover:bg-[#C4B090] text-[#3D1409] font-bold text-sm flex items-center justify-center transition-colors"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(quantityInput);
                          if (!isNaN(val) && val >= 1) { onUpdate({ quantity: val }); setQuantityInput(val.toString()); }
                          else setQuantityInput(item.quantity.toString());
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        className="w-10 text-center text-sm font-bold text-[#3D1409] bg-white/70 border-2 border-transparent rounded-lg focus:outline-none focus:border-[#5C1A1A] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => { const q = item.quantity + 1; onUpdate({ quantity: q }); setQuantityInput(q.toString()); }}
                        className="w-6 h-6 rounded-lg bg-[#DCC8A8] hover:bg-[#C4B090] text-[#3D1409] font-bold text-sm flex items-center justify-center transition-colors"
                      >+</button>
                    </div>
                  ) : (
                    <p className="text-[#3D1409] font-bold text-sm">{item.quantity}</p>
                  )}
                </div>
                )}
              </div>

              {normalizeCategory(item.category) === 'armor' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Armor Class</span>
                    </div>
                    <p className="text-[#3D1409] font-bold text-sm">{item.armorClass || '-'}</p>
                  </div>

                  <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <Weight className="w-3.5 h-3.5" />
                      <span>Strength</span>
                    </div>
                    <p className="text-[#3D1409] font-bold text-sm">{item.strengthRequirement || '-'}</p>
                  </div>

                  <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Stealth</span>
                    </div>
                    <p className="text-[#3D1409] font-bold text-sm">{item.stealth || '-'}</p>
                  </div>
                </div>
              )}

              {/* Attunement badge with toggle */}
              {item.attunement && onUpdate && (canEdit || canToggleAttunement) && (
                <div className="flex items-center justify-between bg-[#F3E5F5]/70 border-2 border-[#7E57A2]/40 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7E57A2]" />
                    <span className="text-[#5E3A7C] text-sm font-semibold">Requires Attunement</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ attuned: !item.attuned });
                    }}
                    className={'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer '
                      + (item.attuned
                        ? 'bg-[#7E57A2]/20 text-[#5E3A7C] hover:bg-[#7E57A2]/30'
                        : 'bg-white/50 text-[#8B6F47] hover:bg-white/70')
                    }
                    title={item.attuned ? 'Click to unattune' : 'Click to attune'}
                  >
                    <Star className={'w-4 h-4 ' + (item.attuned ? 'text-[#B8860B] fill-[#B8860B]' : 'text-[#8B6F47]/60')} />
                    <span className="text-xs font-semibold">{item.attuned ? 'Attuned' : 'Not Attuned'}</span>
                  </button>
                </div>
              )}

              {/* Hidden from others toggle */}
              {canToggleHidden && onUpdate && (
                <div className={`flex items-center justify-between border-2 rounded-xl px-3.5 py-2.5 ${item.hiddenFromOthers ? 'bg-[#3D1409]/8 border-[#5C1A1A]/40' : 'bg-white/40 border-[#DCC8A8]'}`}>
                  <div className="flex items-center gap-2">
                    <EyeOff className={`w-4 h-4 ${item.hiddenFromOthers ? 'text-[#5C1A1A]' : 'text-[#8B6F47]/50'}`} />
                    <div>
                      <span className={`text-sm font-semibold ${item.hiddenFromOthers ? 'text-[#3D1409]' : 'text-[#8B6F47]'}`}>Hidden from others</span>
                      <p className="text-[10px] text-[#8B6F47] mt-0.5">{item.hiddenFromOthers ? 'Only you and the GM can see this item' : 'Visible to all players in the vault'}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ hiddenFromOthers: !item.hiddenFromOthers });
                    }}
                    className={'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer '
                      + (item.hiddenFromOthers
                        ? 'bg-[#5C1A1A]/20 text-[#5C1A1A] hover:bg-[#5C1A1A]/30'
                        : 'bg-white/50 text-[#8B6F47] hover:bg-white/70')
                    }
                    title={item.hiddenFromOthers ? 'Click to make visible' : 'Click to hide'}
                  >
                    {item.hiddenFromOthers
                      ? <><EyeOff className="w-4 h-4" /><span className="text-xs font-semibold">Hidden</span></>
                      : <><Eye className="w-4 h-4" /><span className="text-xs font-semibold">Visible</span></>
                    }
                  </button>
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-2">
                    <StickyNote className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </div>
                  <p className="text-[#3D1409] text-sm leading-relaxed">{item.notes}</p>
                </div>
              )}

              <div className="border-t-2 border-[#DCC8A8]" />

              <div className="flex gap-2">
                {showDeleteAction && onDelete && (
                  <button
                    onClick={handleDelete}
                    className="btn-secondary flex-1 px-4 py-2.5 bg-[#FFEBEE]/80 hover:bg-[#FFCDD2] border-[#8B3A3A]/60 hover:border-[#8B3A3A] text-[#6B2020]"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteLabel}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`btn-secondary px-4 py-2.5 ${showDeleteAction && onDelete ? 'flex-1' : 'w-full'}`}
                >
                  Close
                </button>
              </div>
            </>
          )}

          </div>

          {showScrollbar && (
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              className="hidden sm:flex absolute top-2 right-0.5 bottom-2 w-3.5 items-stretch cursor-pointer z-10"
            >
              <div
                onMouseDown={handleThumbMouseDown}
                className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
                style={{
                  top: `${thumbTop}px`,
                  height: `${thumbHeight}px`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDeleteModal
          title="Delete Item"
          message={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
