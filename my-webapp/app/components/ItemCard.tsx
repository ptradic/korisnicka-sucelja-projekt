import { useDrag } from 'react-dnd';
import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, Star, EyeOff, Sword, Shield, Droplet, Sparkles, Backpack, Gem, Package } from 'lucide-react';
import type { Item, Category } from '../types';
import { normalizeCategory } from '../types';

interface ItemCardProps {
  item: Item;
  ownerId: string | 'shared';
  onClick: () => void;
  bulkSelectEnabled?: boolean;
  isSelected?: boolean;
  selectedCount?: number;
  selectedItemIds?: string[];
  onToggleSelect?: (item: Item) => void;
  onSelectAll?: (item: Item) => void;
}

const rarityColors: Record<string, { text: string; badgeBg: string; bg: string; border: string }> = {
  common: { text: 'text-[#5C4A2F]', badgeBg: 'bg-[#A89A7C]', bg: 'bg-[#F5EFE0] hover:bg-[#F0E8D5]', border: 'border-[#A89A7C]/70' },
  uncommon: { text: 'text-[#3D5A27]', badgeBg: 'bg-[#5C7A3B]', bg: 'bg-[#F5EFE0] hover:bg-[#E8F5E9]', border: 'border-[#5C7A3B]/70' },
  rare: { text: 'text-[#2C4A7C]', badgeBg: 'bg-[#4A6FA5]', bg: 'bg-[#F5EFE0] hover:bg-[#E3F2FD]', border: 'border-[#4A6FA5]/70' },
  'very rare': { text: 'text-[#5E3A7C]', badgeBg: 'bg-[#7E57A2]', bg: 'bg-[#F5EFE0] hover:bg-[#F3E5F5]', border: 'border-[#7E57A2]/70' },
  legendary: { text: 'text-[#8B6914]', badgeBg: 'bg-[#B8860B]', bg: 'bg-[#F5EFE0] hover:bg-[#FFF8E1]', border: 'border-[#B8860B]/70' },
  artifact: { text: 'text-[#6B2020]', badgeBg: 'bg-[#8B3A3A]', bg: 'bg-[#F5EFE0] hover:bg-[#FFEBEE]', border: 'border-[#8B3A3A]/70' },
};

const categoryIconMap: Record<Category, React.ComponentType<{ className?: string }>> = {
  weapons: Sword,
  armor: Shield,
  consumables: Droplet,
  'magic-gear': Sparkles,
  'adventuring-gear': Backpack,
  'wealth-valuables': Gem,
  hidden: Package,
  weapon: Sword,
  potion: Droplet,
  magic: Sparkles,
  treasure: Gem,
  misc: Backpack,
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
  onSelectAll,
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

  // Hold-to-drag visual hint: shows a "charging" state before the 400ms
  // delayTouchStart fires, so the user knows they're about to drag.
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchMovedRef = useRef(false);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    touchMovedRef.current = false;
  }, []);

  const handleTouchStart = useCallback(() => {
    touchMovedRef.current = false;
    // Start visual feedback after 150ms — shorter than the 400ms drag delay
    // so the user sees feedback before the drag actually activates
    holdTimerRef.current = setTimeout(() => {
      if (!touchMovedRef.current) setIsHolding(true);
    }, 150);
  }, []);

  const handleTouchMove = useCallback(() => {
    touchMovedRef.current = true;
    clearHold();
  }, [clearHold]);

  const handleTouchEnd = useCallback(() => {
    clearHold();
  }, [clearHold]);

  // Clear hold state when drag actually starts
  useEffect(() => {
    if (isDragging) setIsHolding(false);
  }, [isDragging]);

  // When isHolding but not dragging, listen for touchend on document.
  // react-dnd swallows the element's onTouchEnd, but the document still
  // receives it — so we can reliably detect when the finger lifts.
  useEffect(() => {
    if (!isHolding || isDragging) return;
    const handleGlobalTouchEnd = () => setIsHolding(false);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchcancel', handleGlobalTouchEnd);
    return () => {
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isHolding, isDragging]);

  const colors = rarityColors[item.rarity] || rarityColors.common;
  const normalizedCategory = normalizeCategory(item.category);
  const ItemTypeIcon = categoryIconMap[normalizedCategory] || Package;

  return (
    <div
      ref={drag as any}
      onClick={() => {
        clearHold();
        if (bulkSelectEnabled && onToggleSelect) {
          onToggleSelect(item);
          return;
        }
        onClick();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      // Prevent the browser's native long-press context menu (download/share/print)
      // which fires at ~500ms and conflicts with the drag delay on tablets.
      onContextMenu={(e) => e.preventDefault()}
      // touch-action:pan-y lets the browser scroll vertically on a quick swipe.
      // React-dnd still receives all touch events; with delayTouchStart it waits
      // before committing to a drag, so a quick swipe stays a scroll.
      // WebkitTouchCallout:none suppresses the iOS/iPadOS long-press callout menu.
      style={{ touchAction: 'pan-y', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' } as React.CSSProperties}
      className={
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border-[3px] select-none ' +
        colors.border + ' ' +
        colors.bg +
        (isSelected ? ' ring-2 ring-[#5C1A1A] bg-[#F5E6D2]' : '') +
        (isDragging ? ' opacity-40 scale-95' : '') +
        (isHolding ? ' scale-[0.97] shadow-md ring-2 ring-[#B8860B]/50 bg-[#FFF8E1]/60' : ' hover:shadow-sm')
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
      <div className={'w-8 h-8 rounded-[14px] border border-white/30 shadow-sm flex items-center justify-center shrink-0 ' + colors.badgeBg}>
        <ItemTypeIcon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[#3D1409] font-medium truncate block">{item.name}</span>
        <span className="text-[11px] text-[#8B6F47]">{(item.weight ?? 0) * (item.quantity ?? 1)} lbs</span>
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
          {bulkSelectEnabled && selectedCount > 0 && selectedCount < item.quantity && onSelectAll && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelectAll(item); }}
              className="text-[10px] text-[#5C1A1A] bg-[#F5E6D2] hover:bg-[#E8D5B7] border border-[#8B6F47]/40 px-1.5 py-0.5 rounded font-medium transition-colors"
            >
              All
            </button>
          )}
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
