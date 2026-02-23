import { useDrag } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
  ownerId: string | 'shared';
  onClick: () => void;
}

const rarityColors: Record<string, { text: string; dot: string; bg: string; border: string }> = {
  common: { text: 'text-[#5C4A2F]', dot: 'bg-[#A89A7C]', bg: 'hover:bg-[#F5F0E8]', border: 'border-[#D4C4A8]' },
  uncommon: { text: 'text-[#3D5A27]', dot: 'bg-[#5C7A3B]', bg: 'hover:bg-[#E8F5E9]', border: 'border-[#5C7A3B]/30' },
  rare: { text: 'text-[#2C4A7C]', dot: 'bg-[#4A6FA5]', bg: 'hover:bg-[#E3F2FD]', border: 'border-[#4A6FA5]/30' },
  'very rare': { text: 'text-[#5E3A7C]', dot: 'bg-[#7E57A2]', bg: 'hover:bg-[#F3E5F5]', border: 'border-[#7E57A2]/30' },
  legendary: { text: 'text-[#8B6914]', dot: 'bg-[#B8860B]', bg: 'hover:bg-[#FFF8E1]', border: 'border-[#B8860B]/30' },
  artifact: { text: 'text-[#6B2020]', dot: 'bg-[#8B3A3A]', bg: 'hover:bg-[#FFEBEE]', border: 'border-[#8B3A3A]/30' },
};

export function ItemCard({ item, ownerId, onClick }: ItemCardProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'INVENTORY_ITEM',
      item: { id: item.id, ownerId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item.id, ownerId],
  );

  const colors = rarityColors[item.rarity] || rarityColors.common;

  return (
    <div
      ref={drag as any}
      onClick={onClick}
      className={
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border bg-white/40 ' +
        colors.border + ' ' +
        colors.bg +
        (isDragging ? ' opacity-40 scale-95' : ' hover:shadow-sm')
      }
    >
      <GripVertical className="w-4 h-4 text-[#8B6F47]/40 shrink-0 cursor-grab" />
      <div className={'w-2.5 h-2.5 rounded-full shrink-0 ' + colors.dot} />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[#3D1409] font-medium truncate block">{item.name}</span>
        <span className="text-[11px] text-[#8B6F47]">{item.weight} lbs</span>
      </div>
      {item.quantity > 1 && (
        <span className="text-xs text-[#8B6F47] bg-[#D9C7AA]/60 px-1.5 py-0.5 rounded tabular-nums shrink-0">
          x{item.quantity}
        </span>
      )}
      <span className={'text-[11px] capitalize shrink-0 font-medium ' + colors.text}>
        {item.rarity}
      </span>
    </div>
  );
}
