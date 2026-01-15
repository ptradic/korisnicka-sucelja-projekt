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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#F5EFE0] border-b-[4px] border-[#3D1409] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#3D1409]">{owner?.name || 'Unknown'}</h2>
            <p className="text-[#5C4A2F] text-sm">
              {inventory.length} {inventory.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {isDM && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-[#5C1A1A] hover:bg-[#4A1515] text-white rounded-lg transition-all shadow-lg border-[3px] border-[#3D1409]"
              style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.3)' }}
            >
              <Plus className="w-5 h-5" />
              <span>Give Item</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {maxWeight !== undefined && (
            <div className="bg-white/70 border-[3px] border-[#8B6F47] rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#5C4A2F] text-sm mb-2">
                <Weight className="w-4 h-4" />
                <span>Carrying Capacity</span>
              </div>
              <div className="text-[#3D1409] mb-2">
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
            <div className="flex items-center gap-2 text-[#5C4A2F] text-sm mb-2">
              <Coins className="w-4 h-4" />
              <span>Total Value</span>
            </div>
            <div className="text-[#B8860B]">
              {totalValue.toLocaleString()} gp
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C4A2F]" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#E8D5B7] border-b-[3px] border-[#8B6F47] px-6 py-4">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          items={inventory}
        />
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 overflow-y-auto p-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                ownerId={ownerId}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
