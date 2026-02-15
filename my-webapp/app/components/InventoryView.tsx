import { Plus, Search, Weight, Coins } from 'lucide-react';
import { useState } from 'react';
import { ItemCard } from './ItemCard';
import { CategoryFilter } from './CategoryFilter';
import type { Item, Category } from '../types';

interface InventoryViewProps {
  inventory: Item[];
  owner: { name: string; id: string } | null;
  ownerId: string | 'shared';
  isDM: boolean;
  onAddItem: () => void;
  onItemClick: (item: Item) => void;
  onMoveItem: (itemId: string, fromId: string, toId: string) => void;
  maxWeight?: number;
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
}: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredItems = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalWeight = inventory.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const totalValue = inventory.reduce((sum, item) => sum + ((item.value || 0) * item.quantity), 0);
  const weightPercentage = maxWeight ? (totalWeight / maxWeight) * 100 : 0;

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    setIsFilterOpen(false);
  };

  return (
    <div className="h-full w-full min-w-0 flex flex-col min-h-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-[#F5EFE0] border-b-[4px] border-[#3D1409] px-4 py-4 sm:px-5 md:px-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[#3D1409] text-lg sm:text-xl md:text-2xl">
              {owner?.name || 'Unknown'}
            </h2>
            <p className="text-[#5C4A2F] text-xs sm:text-sm">
              {inventory.length} {inventory.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {isDM && (
            <button
              onClick={onAddItem}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-[#5C1A1A] hover:bg-[#4A1515] text-white rounded-lg transition-all shadow-lg border-[3px] border-[#3D1409]"
              style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.3)' }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Give Item</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          {maxWeight !== undefined && (
            <div className="bg-white/70 border-[3px] border-[#8B6F47] rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#5C4A2F] text-xs sm:text-sm mb-2">
                <Weight className="w-4 h-4" />
                <span>Carrying Capacity</span>
              </div>
              <div className="text-[#3D1409] text-sm sm:text-base mb-2">
                {totalWeight.toFixed(1)} / {maxWeight} lbs
              </div>
              <div className="w-full h-2 bg-[#D4C4A8] rounded-full overflow-hidden border border-[#8B6F47]/40">
                <div 
                  className={`h-full transition-all ${
                    weightPercentage > 90 
                      ? 'bg-[#8B3A3A]' 
                      : weightPercentage > 70 
                      ? 'bg-[#B8860B]' 
                      : 'bg-[#5C7A3B]'
                  }`}
                  style={{ width: `${Math.min(weightPercentage, 100)}%` }}
                />
              </div>
              {weightPercentage > 100 && (
                <div className="text-[#8B3A3A] text-xs mt-1">⚠️ Overencumbered!</div>
              )}
            </div>
          )}

          <div className="bg-white/70 border-[3px] border-[#8B6F47] rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#5C4A2F] text-xs sm:text-sm mb-2">
              <Coins className="w-4 h-4" />
              <span>Total Value</span>
            </div>
            <div className="text-[#B8860B] text-sm sm:text-base">
              {totalValue.toLocaleString()} gp
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#5C4A2F]" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#E8D5B7] border-b-[3px] border-[#8B6F47] px-4 md:px-6 py-4">
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
            onClick={() => setIsFilterOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg transition-all border-[3px] shadow-sm bg-[#F5EFE0] text-[#3D1409] border-[#8B6F47] hover:border-[#5C4A2F] hover:bg-[#F0E8D5]"
            style={{ boxShadow: '0 2px 4px -1px rgba(61, 20, 9, 0.15)' }}
          >
            <span className="text-sm">Filter items</span>
            <span className="text-xs text-[#5C4A2F]">
              {selectedCategory === 'all' ? 'All items' : selectedCategory}
            </span>
          </button>

          {isFilterOpen && (
            <div
              className="absolute left-0 right-0 mt-3 z-20 rounded-lg border-[3px] border-[#8B6F47] bg-[#F5EFE0] p-3"
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

      {/* Inventory Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 md:p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-[#5C4A2F] text-lg mb-2">No items found</div>
            <div className="text-[#8B6F47] text-sm">
              {inventory.length === 0 
                ? 'This inventory is empty' 
                : 'Try adjusting your filters'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 justify-items-start">
            {filteredItems.map(item => (
              <div key={item.id} className="w-full max-w-[320px]">
                <ItemCard
                  item={item}
                  ownerId={ownerId}
                  onClick={() => onItemClick(item)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
