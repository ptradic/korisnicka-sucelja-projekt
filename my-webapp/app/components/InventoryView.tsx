import { Plus, Search, Weight, Minus, Coins, ArrowUpDown, Filter, CircleHelp, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ItemCard } from './ItemCard';
import { CategoryFilter } from './CategoryFilter';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useCustomScrollbar } from '../hooks/useCustomScrollbar';
import type { Item, Category, Currency } from '../types';
import { normalizeCategory } from '../types';

interface InventoryViewProps {
  inventory: Item[];
  owner: { name: string; id: string } | null;
  ownerId: string | 'shared';
  isDM: boolean;
  onAddItem: () => void;
  onItemClick: (item: Item) => void;
  onMoveItem: (itemIds: string[], fromId: string, toId: string) => void;
  maxWeight?: number;
  onMaxWeightChange?: (newMax: number) => void;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
  isShared?: boolean;
  syncStatus?: 'saving' | 'saved';
}

// Simple inline coin display — click to edit
function CoinDisplay({
  label,
  value,
  colorClass,
  onChange,
}: {
  label: string;
  value: number;
  colorClass: string;
  onChange: (val: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setEditValue(value.toString());
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const finishEditing = () => {
    const parsed = parseInt(editValue) || 0;
    onChange(Math.max(0, parsed));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') finishEditing();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-1">
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-12 text-center text-sm font-bold bg-white border-2 border-[#5C1A1A] rounded px-1 py-0.5 text-[#3D1409] outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      ) : (
        <button
          onClick={startEditing}
          className="btn-ghost text-sm font-bold tabular-nums !px-1.5 !py-0.5 border-transparent text-[#3D1409] hover:bg-white/60 cursor-text min-w-6 text-center"
        >
          {value}
        </button>
      )}
      <span className={'text-[11px] font-bold ' + colorClass}>{label}</span>
    </div>
  );
}

// "Add coins" popover
function AddCoinsButton({
  onAdd,
}: {
  onAdd: (currency: Currency) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amounts, setAmounts] = useState<Currency>({ pp: 0, gp: 0, sp: 0, cp: 0 });

  const handleSubmit = () => {
    if (amounts.pp || amounts.gp || amounts.sp || amounts.cp) {
      onAdd(amounts);
      setAmounts({ pp: 0, gp: 0, sp: 0, cp: 0 });
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setOpen(false);
  };

  const coinTypes: { key: keyof Currency; label: string; color: string }[] = [
    { key: 'pp', label: 'PP', color: 'text-[#8B8B8B]' },
    { key: 'gp', label: 'GP', color: 'text-[#B8860B]' },
    { key: 'sp', label: 'SP', color: 'text-[#808080]' },
    { key: 'cp', label: 'CP', color: 'text-[#B87333]' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={open
          ? 'btn-primary h-7 min-w-10 !px-1.5 !py-0 rounded-lg text-white border-[#3D1409]'
          : 'btn-secondary h-7 min-w-10 !px-1.5 !py-0 rounded-lg text-[#5C4A2F] border-[#8B6F47]/60 hover:border-[#5C4A2F]'
        }
        title="Add or subtract coins"
      >
        <span className={open ? 'text-[11px] font-extrabold tracking-tight text-white' : 'text-[11px] font-extrabold tracking-tight text-[#5C4A2F]'}>+/-</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-30 bg-[#F5EFE0] border-3 border-[#8B6F47] rounded-xl p-3 shadow-2xl min-w-[200px]"
          style={{ boxShadow: '0 8px 20px rgba(61, 20, 9, 0.25)' }}
        >
          <div className="text-xs font-bold text-[#3D1409] mb-2 flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold tracking-tight text-[#B8860B]">+/-</span>
            Add / Subtract Coins
          </div>
          <p className="text-[10px] text-[#8B6F47] mb-2 -mt-1">Use negative numbers to subtract</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {coinTypes.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={amounts[key] || ''}
                  onChange={(e) =>
                    setAmounts({ ...amounts, [key]: parseInt(e.target.value) || 0 })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="0"
                  className="w-14 px-2 py-1 text-xs bg-white/70 border-2 border-[#8B6F47]/60 rounded-lg text-[#3D1409] text-center outline-none focus:border-[#5C1A1A] tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className={'text-[11px] font-bold ' + color}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="btn-secondary flex-1 !px-2 !py-1.5 rounded-lg text-xs text-[#5C4A2F] border-[#8B6F47]/40"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex-1 !px-2 !py-1.5 rounded-lg text-xs font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InventoryView({
  inventory,
  owner,
  ownerId,
  isDM,
  onAddItem,
  onItemClick,
  onMoveItem,
  maxWeight,
  onMaxWeightChange,
  currency,
  onCurrencyChange,
  isShared,
  syncStatus = 'saved',
}: InventoryViewProps) {
  type SortField = 'none' | 'name' | 'rarity' | 'weight' | 'value';
  type SortDirection = 'asc' | 'desc';

  const rarityRank: Record<Item['rarity'], number> = {
    common: 0,
    uncommon: 1,
    rare: 2,
    'very rare': 3,
    legendary: 4,
    artifact: 5,
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [bulkSelectEnabled, setBulkSelectEnabled] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isEditingMaxWeight, setIsEditingMaxWeight] = useState(false);
  const [maxWeightEditValue, setMaxWeightEditValue] = useState('');
  const [filtersOverflow, setFiltersOverflow] = useState(false);
  const [mobileListMinHeight, setMobileListMinHeight] = useState<number | null>(null);
  const itemListRef = useRef<HTMLDivElement>(null);
  const itemListSectionRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMeasureRef = useRef<HTMLDivElement>(null);
  const previousQuantityByIdRef = useRef<Map<string, number>>(new Map());
  const helpSeenKey = 'vault-inventory-help-seen';

  // Enable auto-scroll when dragging items near the top
  useAutoScroll(itemListRef, { scrollThreshold: 100, scrollSpeed: 10 });

  const {
    showScrollbar: showItemListScrollbar,
    thumbTop: itemListThumbTop,
    thumbHeight: itemListThumbHeight,
    trackRef: itemListTrackRef,
    handleTrackClick: handleItemListTrackClick,
    handleThumbMouseDown: handleItemListThumbMouseDown,
  } = useCustomScrollbar(itemListRef);

  const visibleItems = inventory.filter((item) => normalizeCategory(item.category) !== 'hidden');

  const filteredItems = visibleItems
    .filter((item) => {
      const mappedCategory = normalizeCategory(item.category);
      const matchesCategory = selectedCategory === 'all' || mappedCategory === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortField === 'none') return 0;

      let baseCompare = 0;

      if (sortField === 'name') {
        baseCompare = a.name.localeCompare(b.name);
      } else if (sortField === 'rarity') {
        const diff = rarityRank[a.rarity] - rarityRank[b.rarity];
        baseCompare = diff !== 0 ? diff : a.name.localeCompare(b.name);
      } else if (sortField === 'weight') {
        const diff = a.weight - b.weight;
        baseCompare = diff !== 0 ? diff : a.name.localeCompare(b.name);
      } else {
        const valueDiff = (a.value || 0) - (b.value || 0);
        baseCompare = valueDiff !== 0 ? valueDiff : a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? baseCompare : -baseCompare;
    });

  const totalWeight = visibleItems.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const weightPercentage = maxWeight ? (totalWeight / maxWeight) * 100 : 0;

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    setIsFilterOpen(false);
  };

  const toggleBulkSelect = () => {
    setBulkSelectEnabled((enabled) => {
      if (enabled) {
        setSelectedItemIds([]);
      }
      return !enabled;
    });
  };

  const toggleItemSelection = (item: Item) => {
    setSelectedItemIds((prev) => {
      const currentCount = prev.reduce((count, id) => count + (id === item.id ? 1 : 0), 0);
      const nextCount = currentCount >= item.quantity ? 0 : currentCount + 1;
      const withoutItem = prev.filter((id) => id !== item.id);

      if (nextCount === 0) {
        return withoutItem;
      }

      return [...withoutItem, ...Array(nextCount).fill(item.id)];
    });
  };

  useEffect(() => {
    if (!bulkSelectEnabled) return;
    const visibleItemIds = new Set(filteredItems.map((item) => item.id));
    const itemById = new Map(filteredItems.map((item) => [item.id, item]));
    setSelectedItemIds((prev) => {
      const nextById = new Map<string, number>();
      for (const id of prev) {
        if (!visibleItemIds.has(id)) continue;
        const current = nextById.get(id) || 0;
        nextById.set(id, current + 1);
      }

      const next: string[] = [];
      for (const [id, count] of nextById.entries()) {
        const item = itemById.get(id);
        if (!item) continue;
        const clampedCount = Math.min(count, item.quantity);
        for (let i = 0; i < clampedCount; i += 1) {
          next.push(id);
        }
      }

      if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [bulkSelectEnabled, filteredItems]);

  const inventoryQuantityKey = inventory.map((item) => `${item.id}:${item.quantity}`).join('|');
  const selectedItemIdsKey = selectedItemIds.join('|');

  useEffect(() => {
    const currentQuantityById = new Map(inventory.map((item) => [item.id, item.quantity]));

    if (bulkSelectEnabled && selectedItemIds.length > 0) {
      const idsToClear = new Set<string>();
      for (const id of selectedItemIds) {
        const prevQty = previousQuantityByIdRef.current.get(id);
        const currQty = currentQuantityById.get(id);
        if (currQty === undefined) {
          idsToClear.add(id);
          continue;
        }
        if (prevQty !== undefined && currQty < prevQty) {
          idsToClear.add(id);
        }
      }

      if (idsToClear.size > 0) {
        setSelectedItemIds([]);
        setBulkSelectEnabled(false);
      }
    }

    previousQuantityByIdRef.current = currentQuantityById;
  }, [bulkSelectEnabled, inventoryQuantityKey, selectedItemIdsKey]);

  const selectedCountById = new Map<string, number>();
  for (const id of selectedItemIds) {
    selectedCountById.set(id, (selectedCountById.get(id) || 0) + 1);
  }

  const handleSortSelect = (field: SortField, direction: SortDirection = 'asc') => {
    setSortField(field);
    setSortDirection(direction);
    setIsSortMenuOpen(false);
  };

  const toggleSortField = (field: Exclude<SortField, 'none'>) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection('asc');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const EARLY_COLLAPSE_PX = 220;

    const checkOverflow = () => {
      const el = filterMeasureRef.current;
      if (!el) return;

      const lastChip = el.querySelector('button:last-of-type') as HTMLElement | null;
      if (!lastChip) {
        setFiltersOverflow(el.scrollWidth > el.clientWidth);
        return;
      }

      const containerRect = el.getBoundingClientRect();
      const chipRect = lastChip.getBoundingClientRect();
      setFiltersOverflow(chipRect.right > containerRect.right - EARLY_COLLAPSE_PX);
    };

    checkOverflow();

    const observer = new ResizeObserver(() => checkOverflow());
    if (filterMeasureRef.current) {
      observer.observe(filterMeasureRef.current);
    }

    window.addEventListener('resize', checkOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [visibleItems]);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(helpSeenKey);
      if (!seen) {
        setShowHelpOverlay(true);
      }
    } catch {
      // Ignore storage errors and keep default behavior.
    }
  }, []);

  useEffect(() => {
    const updateMobileListMinHeight = () => {
      if (window.innerWidth >= 640) {
        setMobileListMinHeight(null);
        return;
      }

      const section = itemListSectionRef.current;
      if (!section) return;

      const top = section.getBoundingClientRect().top;
      const nextMinHeight = Math.max(180, Math.floor(window.innerHeight - top));
      setMobileListMinHeight(nextMinHeight);
    };

    const rafId = window.requestAnimationFrame(updateMobileListMinHeight);
    window.addEventListener('resize', updateMobileListMinHeight);
    window.addEventListener('orientationchange', updateMobileListMinHeight);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateMobileListMinHeight);
      window.removeEventListener('orientationchange', updateMobileListMinHeight);
    };
  }, [isFilterOpen, filtersOverflow]);

  const closeHelpOverlay = (markSeen: boolean) => {
    setShowHelpOverlay(false);
    if (!markSeen) return;
    try {
      localStorage.setItem(helpSeenKey, '1');
    } catch {
      // Ignore storage errors.
    }
  };

  const selectedFilterLabel =
    selectedCategory === 'all'
      ? 'All items'
      : selectedCategory === 'wealth-valuables'
        ? 'Wealth & Valuables'
        : selectedCategory
            .split(/[-_]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

  return (
    <div className="h-full w-full min-w-0 flex flex-col min-h-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-[#F5EFE0] border-b-[3px] border-[#3D1409] px-4 py-3 sm:px-5 sm:py-4 shadow-md">
        {/* Owner name + item count */}
        <div className="relative flex items-start gap-2 mb-2">
          <div className="min-w-0 pr-16">
            <h2 className="text-[#3D1409] text-base sm:text-lg font-bold truncate">
              {owner?.name || 'Unknown'}
            </h2>
            <span className="text-[#8B6F47] text-xs">
              {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div
            className={
              'absolute top-0 right-0 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ' +
              (syncStatus === 'saving'
                ? 'text-amber-700'
                : 'text-emerald-700')
            }
            title={syncStatus === 'saving' ? 'Firebase write in progress' : 'All changes saved to Firebase'}
          >
            <span
              className={
                'w-1.5 h-1.5 rounded-full ' +
                (syncStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')
              }
            />
            {syncStatus === 'saving' ? 'Saving…' : 'Saved'}
          </div>
        </div>

        {/* Currency row (not for shared loot) */}
        {!isShared && currency && onCurrencyChange && (
          <div className="flex items-center gap-3 mb-2 py-2 px-3 bg-white/50 rounded-lg border border-[#8B6F47]/20">
            <Coins className="w-4 h-4 text-[#B8860B] shrink-0" />
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <CoinDisplay
                label="pp"
                value={currency.pp}
                colorClass="text-[#8B8B8B]"
                onChange={(v) => onCurrencyChange({ ...currency, pp: v })}
              />
              <CoinDisplay
                label="gp"
                value={currency.gp}
                colorClass="text-[#B8860B]"
                onChange={(v) => onCurrencyChange({ ...currency, gp: v })}
              />
              <CoinDisplay
                label="sp"
                value={currency.sp}
                colorClass="text-[#808080]"
                onChange={(v) => onCurrencyChange({ ...currency, sp: v })}
              />
              <CoinDisplay
                label="cp"
                value={currency.cp}
                colorClass="text-[#B87333]"
                onChange={(v) => onCurrencyChange({ ...currency, cp: v })}
              />
            </div>
            <AddCoinsButton
              onAdd={(added) =>
                onCurrencyChange({
                  pp: Math.max(0, currency.pp + added.pp),
                  gp: Math.max(0, currency.gp + added.gp),
                  sp: Math.max(0, currency.sp + added.sp),
                  cp: Math.max(0, currency.cp + added.cp),
                })
              }
            />
          </div>
        )}

        {/* Carry capacity (compact)  not for shared */}
        {!isShared && maxWeight !== undefined && (
          <div className="flex items-center gap-2 mb-2">
            <Weight className="w-3 h-3 text-[#5C4A2F] shrink-0" />
            <div className="flex-1 h-1.5 bg-[#D4C4A8] rounded-full overflow-hidden border border-[#8B6F47]/30">
              <div
                className={
                  'h-full transition-all ' +
                  (weightPercentage > 90
                    ? 'bg-[#8B3A3A]'
                    : weightPercentage > 70
                      ? 'bg-[#B8860B]'
                      : 'bg-[#5C7A3B]')
                }
                style={{ width: Math.min(weightPercentage, 100) + '%' }}
              />
            </div>
            <span className="text-[10px] text-[#5C4A2F] tabular-nums whitespace-nowrap">
              {totalWeight.toFixed(1)}/
            </span>
            {onMaxWeightChange ? (
              isEditingMaxWeight ? (
                <input
                  type="number"
                  min="0"
                  autoFocus
                  value={maxWeightEditValue}
                  onChange={(e) => setMaxWeightEditValue(e.target.value)}
                  onBlur={() => {
                    const parsed = parseInt(maxWeightEditValue);
                    onMaxWeightChange(isNaN(parsed) ? 0 : Math.max(0, parsed));
                    setIsEditingMaxWeight(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const parsed = parseInt(maxWeightEditValue);
                      onMaxWeightChange(isNaN(parsed) ? 0 : Math.max(0, parsed));
                      setIsEditingMaxWeight(false);
                    }
                    if (e.key === 'Escape') setIsEditingMaxWeight(false);
                  }}
                  className="w-10 text-[10px] text-[#3D1409] bg-white border border-[#8B6F47]/50 rounded outline-none tabular-nums text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                <button
                  onClick={() => {
                    setMaxWeightEditValue((maxWeight ?? 0).toString());
                    setIsEditingMaxWeight(true);
                  }}
                  className="inline-flex items-center justify-center w-10 px-0 py-0 text-[10px] text-[#3D1409] tabular-nums text-center cursor-text bg-transparent border-0 border-b border-[#8B6F47]/50 rounded-none hover:bg-white/60 transition-colors"
                >
                  {maxWeight ?? 0}
                </button>
              )
            ) : (
              <span className="text-[10px] text-[#3D1409] tabular-nums">{maxWeight}</span>
            )}
            <span className="text-[10px] text-[#5C4A2F]">lbs</span>
            {weightPercentage > 100 && (
              <span className="text-[9px] text-[#8B3A3A] ml-1">Overencumbered!</span>
            )}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C4A2F]" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border-2 border-[#8B6F47]/60 rounded-lg text-[#3D1409] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#5C4A2F] focus:ring-1 focus:ring-[#5C4A2F]/20"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen((o) => !o)}
            title={isFilterOpen ? 'Close filters' : 'Open filters'}
            className={`${filtersOverflow ? 'inline-flex' : 'hidden'} shrink-0 w-9 h-9 !p-0 rounded-lg ${
              isFilterOpen || selectedCategory !== 'all'
                ? 'btn-primary text-white border-[#3D1409]'
                : 'btn-secondary text-[#5C4A2F] border-[#8B6F47]/60 hover:border-[#5C4A2F]'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <div className="relative shrink-0" ref={sortMenuRef}>
            <button
              onClick={() => setIsSortMenuOpen((v) => !v)}
              title="Sort options"
              className={sortField !== 'none' || isSortMenuOpen
                ? 'btn-primary w-9 h-9 !p-0 rounded-lg text-white border-[#3D1409]'
                : 'btn-secondary w-9 h-9 !p-0 rounded-lg text-[#5C4A2F] border-[#8B6F47]/60 hover:border-[#5C4A2F]'
              }
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {isSortMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-30 min-w-[170px] bg-[#F5EFE0] border-2 border-[#8B6F47] rounded-lg p-1.5"
                style={{ boxShadow: '0 8px 16px rgba(61, 20, 9, 0.2)' }}
              >
                <button
                  onClick={() => handleSortSelect('none', 'asc')}
                  className={
                    'w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ' +
                    (sortField === 'none'
                      ? 'bg-[#5C1A1A] text-white'
                      : 'text-[#3D1409] hover:bg-[#E8D5B7]')
                  }
                >
                  No sorting
                </button>
                <button
                  onClick={() => toggleSortField('name')}
                  className={
                    'w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ' +
                    (sortField === 'name'
                      ? 'bg-[#5C1A1A] text-white'
                      : 'text-[#3D1409] hover:bg-[#E8D5B7]')
                  }
                >
                  Name ({sortField === 'name' && sortDirection === 'desc' ? 'Z-A' : 'A-Z'})
                </button>
                <button
                  onClick={() => toggleSortField('rarity')}
                  className={
                    'w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ' +
                    (sortField === 'rarity'
                      ? 'bg-[#5C1A1A] text-white'
                      : 'text-[#3D1409] hover:bg-[#E8D5B7]')
                  }
                >
                  Rarity ({sortField === 'rarity' && sortDirection === 'desc' ? 'Artifact to Common' : 'Common to Artifact'})
                </button>
                <button
                  onClick={() => toggleSortField('weight')}
                  className={
                    'w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ' +
                    (sortField === 'weight'
                      ? 'bg-[#5C1A1A] text-white'
                      : 'text-[#3D1409] hover:bg-[#E8D5B7]')
                  }
                >
                  Weight ({sortField === 'weight' && sortDirection === 'desc' ? 'High to Low' : 'Low to High'})
                </button>
                <button
                  onClick={() => toggleSortField('value')}
                  className={
                    'w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ' +
                    (sortField === 'value'
                      ? 'bg-[#5C1A1A] text-white'
                      : 'text-[#3D1409] hover:bg-[#E8D5B7]')
                  }
                >
                  Value ({sortField === 'value' && sortDirection === 'desc' ? 'High to Low' : 'Low to High'})
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowHelpOverlay(true)}
            title="Inventory help"
            className="btn-secondary shrink-0 w-9 h-9 !p-0 rounded-lg text-[#5C4A2F] border-[#8B6F47]/60 hover:border-[#5C4A2F]"
          >
            <CircleHelp className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Hidden width probe to detect when category filters overflow */}
      <div className="absolute -z-10 pointer-events-none opacity-0 w-full h-0 overflow-hidden" aria-hidden="true">
        <div ref={filterMeasureRef} className="px-3 md:px-4 py-2">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            items={visibleItems}
            className="mb-0"
          />
        </div>
      </div>

      {/* Filters */}
      {!filtersOverflow && (
        <div className="bg-[#E8D5B7] border-b-2 border-[#8B6F47]/50 px-3 md:px-4 py-2">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            items={visibleItems}
            className="mb-0"
          />
        </div>
      )}

      {isFilterOpen && filtersOverflow && (
        <div className="relative">
          <div
            className="absolute left-3 right-3 top-0 mt-2 z-20 rounded-lg border-2 border-[#8B6F47] bg-[#F5EFE0] p-2"
            style={{ boxShadow: '0 8px 16px rgba(61, 20, 9, 0.2)' }}
          >
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              items={visibleItems}
              className="mb-0 overflow-x-visible"
              listClassName="flex-col"
            />
          </div>
        </div>
      )}

      {/* Item list */}
      <div
        ref={itemListSectionRef}
        className="relative flex-1 min-h-0"
        style={{ minHeight: mobileListMinHeight ? `${mobileListMinHeight}px` : undefined }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden p-4 sm:p-5 custom-scrollbar" ref={itemListRef}>
          {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#5C4A2F] text-base mb-1">No items found</div>
            <div className="text-[#8B6F47] text-sm">
              {visibleItems.length === 0 ? 'This inventory is empty' : 'Try a different filter'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1 pb-1">
              <p className="text-[11px] font-semibold text-[#8B6F47]">
                {selectedFilterLabel}
              </p>
              <div className="flex items-center gap-2">
                {bulkSelectEnabled && (
                  <span className="text-[11px] text-[#5C4A2F] whitespace-nowrap">
                    {selectedItemIds.length} selected
                  </span>
                )}
                {bulkSelectEnabled && selectedItemIds.length > 0 && (
                  <button
                    onClick={() => setSelectedItemIds([])}
                    className="btn-ghost h-7 px-2 text-[11px] border-transparent text-[#8B6F47] hover:text-[#3D1409]"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={toggleBulkSelect}
                  className={
                    bulkSelectEnabled
                      ? 'btn-primary h-7 px-2.5 text-[11px] border-[#3D1409]'
                      : 'btn-secondary h-7 px-2.5 text-[11px] border-[#8B6F47]/60 text-[#5C4A2F]'
                  }
                  title="Toggle bulk select"
                >
                  {bulkSelectEnabled ? 'Bulk On' : 'Bulk Select'}
                </button>
              </div>
            </div>
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                ownerId={ownerId}
                onClick={() => onItemClick(item)}
                bulkSelectEnabled={bulkSelectEnabled}
                isSelected={(selectedCountById.get(item.id) || 0) > 0}
                selectedCount={selectedCountById.get(item.id) || 0}
                selectedItemIds={selectedItemIds}
                onToggleSelect={toggleItemSelection}
              />
            ))}
          </div>
          )}

          {/* Add item button at end of list */}
          <button
            onClick={onAddItem}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-[#8B6F47]/40 text-[#8B6F47] hover:border-[#5C1A1A] hover:text-[#5C1A1A] hover:bg-[#F5EFE0] transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {showItemListScrollbar && (
          <div
            ref={itemListTrackRef}
            onClick={handleItemListTrackClick}
            className="absolute top-2 right-0.5 bottom-2 w-3.5 flex items-stretch cursor-pointer z-10"
          >
            <div
              onMouseDown={handleItemListThumbMouseDown}
              className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
              style={{
                top: `${itemListThumbTop}px`,
                height: `${itemListThumbHeight}px`,
              }}
            />
          </div>
        )}
      </div>

      {showHelpOverlay && (
        <div
          className="fixed inset-0 z-60 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => closeHelpOverlay(true)}
        >
          <div
            className="w-full max-w-md bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl p-5 shadow-2xl"
            style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <CircleHelp className="w-5 h-5 text-[#5C1A1A]" />
                <h3 className="text-[#3D1409] font-extrabold text-base">Quick Vault Help</h3>
              </div>
              <button
                onClick={() => closeHelpOverlay(true)}
                className="btn-ghost !p-1 border-transparent text-[#8B6F47] hover:text-[#3D1409]"
                title="Close help"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-[#3D1409]">
              <p><span className="font-semibold">Drag and drop:</span> drag any item card and drop it on a player in the sidebar.</p>
              <p><span className="font-semibold">Shared loot:</span> drop items onto Shared Loot to make them available to everyone.</p>
              <p><span className="font-semibold">Sort and filter:</span> use the sort and filter buttons near search to quickly find items.</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => closeHelpOverlay(false)}
                className="btn-secondary flex-1 text-sm !py-2"
              >
                Close
              </button>
              <button
                onClick={() => closeHelpOverlay(true)}
                className="btn-primary flex-1 text-sm !py-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
