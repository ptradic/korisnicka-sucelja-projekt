import { Sword, Shield, Droplet, Sparkles, Gem, Package } from 'lucide-react';
import type { Category, Item } from '../types';

interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  items: Item[];
  className?: string;
  listClassName?: string;
}

const categories: { value: Category | 'all'; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'all', label: 'All Items', icon: Package },
  { value: 'weapon', label: 'Weapons', icon: Sword },
  { value: 'armor', label: 'Armor', icon: Shield },
  { value: 'potion', label: 'Potions', icon: Droplet },
  { value: 'magic', label: 'Magic Items', icon: Sparkles },
  { value: 'treasure', label: 'Treasure', icon: Gem },
  { value: 'misc', label: 'Miscellaneous', icon: Package },
];

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  items,
  className,
  listClassName,
}: CategoryFilterProps) {
  const getCategoryCount = (category: Category | 'all') => {
    if (category === 'all') return items.length;
    return items.filter(item => item.category === category).length;
  };

  return (
    <div className={`mb-4 sm:mb-6 overflow-x-auto sm:overflow-x-visible ${className || ''}`.trim()}>
      <div className={`flex flex-wrap gap-2 min-w-0 pb-2 ${listClassName || ''}`.trim()}>
        {categories.map(({ value, label, icon: Icon }) => {
          const count = getCategoryCount(value);
          const isSelected = selectedCategory === value;

          return (
            <button
              key={value}
              onClick={() => onCategoryChange(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border-[3px] shadow-sm ${
                isSelected
                  ? 'bg-[#5C1A1A] text-white shadow-lg border-[#3D1409]'
                  : 'bg-[#F5EFE0] text-[#3D1409] border-[#8B6F47] hover:border-[#5C4A2F] hover:bg-[#F0E8D5]'
              }`}
              style={{
                boxShadow: isSelected 
                  ? '0 4px 6px -1px rgba(61, 20, 9, 0.3)' 
                  : '0 2px 4px -1px rgba(61, 20, 9, 0.15)'
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded border ${
                isSelected ? 'bg-[#3D1409]/40 text-white border-[#3D1409]' : 'bg-[#D9C7AA]/60 text-[#3D1409] border-[#8B6F47]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}