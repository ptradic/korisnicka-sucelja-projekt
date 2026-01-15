import { useDrag } from 'react-dnd';
import { Sword, Shield, Droplet, Sparkles, Gem, Package, GripVertical, Weight } from 'lucide-react';
import type { Item, Category } from '../types';

interface ItemCardProps {
  item: Item;
  ownerId: string | 'shared';
  onClick: () => void;
}

const categoryIcons: Record<Category, React.ComponentType<any>> = {
  weapon: Sword,
  armor: Shield,
  potion: Droplet,
  magic: Sparkles,
  treasure: Gem,
  misc: Package,
};

const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { 
    bg: 'bg-[#F5F0E8]', 
    border: 'border-[#A89A7C]', 
    text: 'text-[#5C4A2F]',
    glow: 'hover:shadow-[#8B6F47]/20' 
  },
  uncommon: { 
    bg: 'bg-[#E8F5E9]', 
    border: 'border-[#5C7A3B]', 
    text: 'text-[#3D5A27]',
    glow: 'hover:shadow-[#5C7A3B]/20' 
  },
  rare: { 
    bg: 'bg-[#E3F2FD]', 
    border: 'border-[#4A6FA5]', 
    text: 'text-[#2C4A7C]',
    glow: 'hover:shadow-[#4A6FA5]/20' 
  },
  'very rare': { 
    bg: 'bg-[#F3E5F5]', 
    border: 'border-[#7E57A2]', 
    text: 'text-[#5E3A7C]',
    glow: 'hover:shadow-[#7E57A2]/20' 
  },
  legendary: { 
    bg: 'bg-[#FFF8E1]', 
    border: 'border-[#B8860B]', 
    text: 'text-[#8B6914]',
    glow: 'hover:shadow-[#B8860B]/30' 
  },
  artifact: { 
    bg: 'bg-[#FFEBEE]', 
    border: 'border-[#8B3A3A]', 
    text: 'text-[#6B2020]',
    glow: 'hover:shadow-[#8B3A3A]/30' 
  },
};

export function ItemCard({ item, ownerId, onClick }: ItemCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'INVENTORY_ITEM',
    item: { id: item.id, ownerId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item.id, ownerId]);

  const Icon = categoryIcons[item.category];
  const colors = rarityColors[item.rarity];
  const totalWeight = item.weight * item.quantity;

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`${colors.bg} border-[3px] ${colors.border} rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02] ${colors.glow} hover:shadow-lg ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{ boxShadow: '0 2px 4px rgba(61, 20, 9, 0.15)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className={`w-5 h-5 ${colors.text} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className={`${colors.text} truncate`}>{item.name}</h3>
          </div>
        </div>
        <GripVertical className="w-4 h-4 text-[#8B6F47] flex-shrink-0 ml-2" />
      </div>

      <p className="text-[#5C4A2F] text-sm line-clamp-2 mb-3">
        {item.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded ${colors.bg} ${colors.border} ${colors.text} border-2 capitalize`}>
            {item.rarity}
          </span>
          <span className="text-[#5C4A2F]">
            Qty: {item.quantity}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#5C4A2F]">
          <div className="flex items-center gap-1">
            <Weight className="w-3 h-3" />
            <span>{totalWeight.toFixed(1)} lbs</span>
          </div>
          {item.value && (
            <span className="text-[#B8860B]">{(item.value * item.quantity).toLocaleString()} gp</span>
          )}
        </div>

        {item.attunement && (
          <div className="text-xs text-[#7E57A2] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Requires Attunement
          </div>
        )}
      </div>
    </div>
  );
}
