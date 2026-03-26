import { useDrag } from 'react-dnd';
import { GripVertical, Star, EyeOff } from 'lucide-react';
import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
  ownerId: string | 'shared';
  onClick: () => void;
  bulkSelectEnabled?: boolean;
  isSelected?: boolean;
  selectedCount?: number;
  selectedItemIds?: string[];
  onToggleSelect?: (item: Item) => void;
}

const rarityColors: Record<string, { text: string; dot: string; bg: string; border: string }> = {
  common: { text: 'text-[#5C4A2F]', dot: 'bg-[#A89A7C]', bg: 'hover:bg-[#F5F0E8]', border: 'border-[#D4C4A8]' },
  uncommon: { text: 'text-[#3D5A27]', dot: 'bg-[#5C7A3B]', bg: 'hover:bg-[#E8F5E9]', border: 'border-[#5C7A3B]/30' },
  rare: { text: 'text-[#2C4A7C]', dot: 'bg-[#4A6FA5]', bg: 'hover:bg-[#E3F2FD]', border: 'border-[#4A6FA5]/30' },
  'very rare': { text: 'text-[#5E3A7C]', dot: 'bg-[#7E57A2]', bg: 'hover:bg-[#F3E5F5]', border: 'border-[#7E57A2]/30' },
  legendary: { text: 'text-[#8B6914]', dot: 'bg-[#B8860B]', bg: 'hover:bg-[#FFF8E1]', border: 'border-[#B8860B]/30' },
  artifact: { text: 'text-[#6B2020]', dot: 'bg-[#8B3A3A]', bg: 'hover:bg-[#FFEBEE]', border: 'border-[#8B3A3A]/30' },
};

export function ItemCard({
  item,
  ownerId,
  onClick,
  bulkSelectEnabled = false,
  isSelected = false,
  selectedCount = 0,
  selectedItemIds = [],
  onToggleSelect,
}: ItemCardProps) {
  const dragIds = bulkSelectEnabled && isSelected && selectedItemIds.length > 0
    ? selectedItemIds
    : [item.id];

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'INVENTORY_ITEM',
      item: { id: item.id, ids: dragIds, ownerId, name: item.name, rarity: item.rarity },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item.id, ownerId, item.name, item.rarity, dragIds.join('|')],
  );

  const colors = rarityColors[item.rarity] || rarityColors.common;

  return (
    <div
      ref={drag as any}
      onClick={() => {
        if (bulkSelectEnabled && onToggleSelect) {
          onToggleSelect(item);
          return;
        }
        onClick();
      }}
      // touch-action:pan-y lets the browser scroll vertically on a quick swipe.
      // React-dnd still receives all touch events; with delayTouchStart it waits
      // before committing to a drag, so a quick swipe stays a scroll.
      style={{ touchAction: 'pan-y', WebkitUserSelect: 'none', userSelect: 'none' }}
      className={
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border bg-white/40 select-none ' +
        colors.border + ' ' +
        colors.bg +
        (isSelected ? ' ring-2 ring-[#5C1A1A] bg-[#F5E6D2]' : '') +
        (isDragging ? ' opacity-40 scale-95' : ' hover:shadow-sm')
      }
    >
      {bulkSelectEnabled && (
        <div
          className={
            'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ' +
            (isSelected ? 'bg-[#5C1A1A] border-[#3D1409] text-white' : 'bg-white border-[#8B6F47]/60')
          }
        >
          {isSelected && (
            <span className="text-[9px] leading-none tabular-nums">
              {selectedCount >= item.quantity ? '✓' : selectedCount}
            </span>
          )}
        </div>
      )}
      {/* Grip icon — visual hint that the card is draggable */}
      <div className="shrink-0 p-0.5 -ml-0.5">
        <GripVertical className="w-4 h-4 text-[#8B6F47]/40" />
      </div>
      <div className={'w-2.5 h-2.5 rounded-full shrink-0 ' + colors.dot} />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[#3D1409] font-medium truncate block">{item.name}</span>
        <span className="text-[11px] text-[#8B6F47]">{item.weight} lbs</span>
      </div>
      {item.hiddenFromOthers && (
        <EyeOff className="w-4 h-4 shrink-0 text-[#5C1A1A]/60" aria-label="Hidden from others" />
      )}
      {item.attunement && (
        <Star
          className={'w-4 h-4 shrink-0 ' + (item.attuned ? 'text-[#B8860B] fill-[#B8860B]' : 'text-[#8B6F47]/50')}
          aria-label={item.attuned ? 'Attuned' : 'Requires attunement'}
        />
      )}
      {item.quantity > 1 && (
        <div className="flex items-center gap-1 shrink-0">
          {bulkSelectEnabled && selectedCount > 0 && (
            <span className="text-[10px] text-[#5C1A1A] bg-[#F5E6D2] border border-[#8B6F47]/40 px-1.5 py-0.5 rounded tabular-nums">
              {selectedCount}/{item.quantity}
            </span>
          )}
          <span className="text-xs text-[#8B6F47] bg-[#D9C7AA]/60 px-1.5 py-0.5 rounded tabular-nums">
            x{item.quantity}
          </span>
        </div>
      )}
      <span className={'text-[11px] capitalize shrink-0 font-medium ' + colors.text}>
        {item.rarity}
      </span>
    </div>
  );
}
