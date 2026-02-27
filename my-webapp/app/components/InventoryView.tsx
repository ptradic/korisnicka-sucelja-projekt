import { Plus, Search, Weight, Minus, Coins } from 'lucide-react';
import { useState, useRef } from 'react';
import { ItemCard } from './ItemCard';
import { CategoryFilter } from './CategoryFilter';
import { useAutoScroll } from '../hooks/useAutoScroll';
import type { Item, Category, Currency } from '../types';

interface InventoryViewProps {
  inventory: Item[];
  owner: { name: string; id: string } | null;
  ownerId: string | 'shared';
  isDM: boolean;
  onAddItem: () => void;
  onItemClick: (item: Item) => void;
  onMoveItem: (itemId: string, fromId: string, toId: string) => void;
  maxWeight?: number;
  onMaxWeightChange?: (newMax: number) => void;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
  isShared?: boolean;
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
          className="text-sm font-bold text-[#3D1409] tabular-nums hover:bg-white/60 rounded px-1.5 py-0.5 transition-colors cursor-text min-w-[1.5rem] text-center"
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
        className="w-7 h-7 rounded-lg bg-[#D9C7AA] hover:bg-[#CDB89D] active:bg-[#C4B590] flex items-center justify-center transition-colors border border-[#8B6F47]/40"
        title="Add coins"
      >
        <Plus className="w-3.5 h-3.5 text-[#5C4A2F]" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-30 bg-[#F5EFE0] border-3 border-[#8B6F47] rounded-xl p-3 shadow-2xl min-w-[200px]"
          style={{ boxShadow: '0 8px 20px rgba(61, 20, 9, 0.25)' }}
        >
          <div className="text-xs font-bold text-[#3D1409] mb-2 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#B8860B]" />
            Add Coins
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {coinTypes.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={amounts[key] || ''}
                  onChange={(e) =>
                    setAmounts({ ...amounts, [key]: Math.max(0, parseInt(e.target.value) || 0) })
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
              className="flex-1 px-2 py-1.5 text-xs text-[#5C4A2F] bg-white/60 border border-[#8B6F47]/40 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-2 py-1.5 text-xs text-white bg-[#5C1A1A] hover:bg-[#4A1515] border border-[#3D1409] rounded-lg transition-colors font-semibold"
            >
              Add
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
}: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemListRef = useRef<HTMLDivElement>(null);

  // Enable auto-scroll when dragging items near the top
  useAutoScroll(itemListRef, { scrollThreshold: 100, scrollSpeed: 10 });

  const filteredItems = inventory.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const weightPercentage = maxWeight ? (totalWeight / maxWeight) * 100 : 0;

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    setIsFilterOpen(false);
  };

  return (
    <div className="h-full w-full min-w-0 flex flex-col min-h-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-[#F5EFE0] border-b-[3px] border-[#3D1409] px-4 py-3 sm:px-5 sm:py-4 shadow-md">
        {/* Owner name + item count */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h2 className="text-[#3D1409] text-base sm:text-lg font-bold truncate">
              {owner?.name || 'Unknown'}
            </h2>
            <span className="text-[#8B6F47] text-xs">
              {inventory.length} {inventory.length === 1 ? 'item' : 'items'}
            </span>
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
                  pp: currency.pp + added.pp,
                  gp: currency.gp + added.gp,
                  sp: currency.sp + added.sp,
                  cp: currency.cp + added.cp,
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
              <input
                type="number"
                min="1"
                value={maxWeight}
                onChange={(e) => onMaxWeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 text-[10px] text-[#3D1409] bg-transparent border-b border-[#8B6F47]/50 outline-none tabular-nums text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C4A2F]" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border-2 border-[#8B6F47]/60 rounded-lg text-[#3D1409] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#5C4A2F] focus:ring-1 focus:ring-[#5C4A2F]/20"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#E8D5B7] border-b-2 border-[#8B6F47]/50 px-3 md:px-4 py-2">
        <div className="hidden min-[940px]:block">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            items={inventory}
            className="mb-0"
          />
        </div>

        <div className="min-[940px]:hidden relative">
          <button
            onClick={() => setIsFilterOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md transition-all border-2 shadow-sm bg-[#F5EFE0] text-[#3D1409] border-[#8B6F47]/60 hover:border-[#5C4A2F] hover:bg-[#F0E8D5] text-xs"
          >
            <span>Filter</span>
            <span className="text-[10px] text-[#5C4A2F]">
              {selectedCategory === 'all' ? 'All' : selectedCategory}
            </span>
          </button>

          {isFilterOpen && (
            <div
              className="absolute left-0 right-0 mt-2 z-20 rounded-lg border-2 border-[#8B6F47] bg-[#F5EFE0] p-2"
              style={{ boxShadow: '0 8px 16px rgba(61, 20, 9, 0.2)' }}
            >
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                items={inventory}
                className="mb-0 overflow-x-visible"
                listClassName="flex-col"
              />
            </div>
          )}
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5" ref={itemListRef}>
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#5C4A2F] text-base mb-1">No items found</div>
            <div className="text-[#8B6F47] text-sm">
              {inventory.length === 0 ? 'This inventory is empty' : 'Try a different filter'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                ownerId={ownerId}
                onClick={() => onItemClick(item)}
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
    </div>
  );
}
