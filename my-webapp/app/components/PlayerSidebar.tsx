import { useCallback, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Package, Users, User, ChevronLeft } from 'lucide-react';
import type { Player } from '../types';

interface PlayerSidebarProps {
  players: Player[];
  selectedPlayerId: string | 'shared';
  onSelectPlayer: (playerId: string | 'shared') => void;
  onMoveItem: (itemId: string, fromId: string | 'shared', toId: string | 'shared') => void;
  dragOverPlayerId: string | 'shared' | null;
  onDragOverChange: (playerId: string | 'shared' | null) => void;
  sharedLootCount: number;
  campaignName: string;
  totalSlots: number;
  onBack: () => void;
}

function PlayerSlot({
  player,
  isSelected,
  onClick,
  onDrop,
  isBeingDraggedOver,
}: {
  player: Player;
  isSelected: boolean;
  onClick: () => void;
  onDrop: (itemId: string, fromId: string) => void;
  isBeingDraggedOver: boolean;
}) {
  const currentWeight = player.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const weightPercentage = (currentWeight / player.maxWeight) * 100;

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'INVENTORY_ITEM',
      drop: (item: { id: string; ownerId: string }) => {
        onDrop(item.id, item.ownerId);
      },
      canDrop: (item: { id: string; ownerId: string }) => item.ownerId !== player.id,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [player.id, onDrop],
  );

  return (
    <button
      ref={drop as any}
      onClick={onClick}
      className={
        'w-full p-2 rounded-lg transition-all relative border-2 ' +
        (isSelected
          ? 'bg-[#5C1A1A] text-white border-[#3D1409] shadow-md'
          : isOver && canDrop
            ? 'bg-[#D4C4A8] border-[#8B6F47] scale-[1.02]'
            : isBeingDraggedOver
              ? 'bg-[#CDB89D] border-[#3D1409]'
              : 'bg-[#F5EFE0] border-[#8B6F47]/60 hover:border-[#5C4A2F] hover:bg-[#F0E8D5] text-[#3D1409]')
      }
    >
      <div className="flex items-center gap-2">
        <div
          className={
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 ' +
            (isSelected ? 'bg-white/20' : 'bg-[#D9C7AA] border border-[#8B6F47]/40')
          }
        >
          <User className={'w-4 h-4 ' + (isSelected ? 'text-white/80' : 'text-[#8B6F47]')} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs font-semibold truncate">{player.name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex-1 h-1 bg-[#D4C4A8] rounded-full overflow-hidden">
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
            <span
              className={
                'text-[9px] tabular-nums whitespace-nowrap ' +
                (isSelected ? 'text-white/60' : 'text-[#8B6F47]')
              }
            >
              {currentWeight.toFixed(0)}/{player.maxWeight}
            </span>
          </div>
        </div>
      </div>

      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#B8860B]/20 rounded-lg pointer-events-none animate-pulse" />
      )}
    </button>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <div className="w-full p-2 rounded-lg border-2 border-dashed border-[#8B6F47]/30 bg-[#F5EFE0]/50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#D9C7AA]/50 border border-dashed border-[#8B6F47]/30 flex items-center justify-center">
          <User className="w-4 h-4 text-[#8B6F47]/30" />
        </div>
        <div className="text-[10px] text-[#8B6F47]/50">Player {index + 1}</div>
      </div>
    </div>
  );
}

function SharedLootSlot({
  isSelected,
  onClick,
  onDrop,
  itemCount,
  isBeingDraggedOver,
}: {
  isSelected: boolean;
  onClick: () => void;
  onDrop: (itemId: string, fromId: string) => void;
  itemCount: number;
  isBeingDraggedOver: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'INVENTORY_ITEM',
      drop: (item: { id: string; ownerId: string }) => {
        onDrop(item.id, item.ownerId);
      },
      canDrop: (item: { id: string; ownerId: string }) => item.ownerId !== 'shared',
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDrop],
  );

  return (
    <button
      ref={drop as any}
      onClick={onClick}
      className={
        'w-full p-2 rounded-lg transition-all relative border-2 ' +
        (isSelected
          ? 'bg-[#8B6F47] text-white border-[#3D1409] shadow-md'
          : isOver && canDrop
            ? 'bg-[#D4C4A8] border-[#8B6F47] scale-[1.02]'
            : isBeingDraggedOver
              ? 'bg-[#CDB89D] border-[#3D1409]'
              : 'bg-[#F5EFE0] border-[#8B6F47]/60 hover:border-[#5C4A2F] hover:bg-[#F0E8D5] text-[#3D1409]')
      }
    >
      <div className="flex items-center gap-2">
        <div
          className={
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 ' +
            (isSelected ? 'bg-white/20' : 'bg-[#D9C7AA] border border-[#8B6F47]/40')
          }
        >
          <Package className={'w-4 h-4 ' + (isSelected ? 'text-white/80' : 'text-[#8B6F47]')} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs font-semibold">Shared Loot</div>
          <div className={'text-[9px] ' + (isSelected ? 'text-white/60' : 'text-[#8B6F47]')}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}  No weight limit
          </div>
        </div>
      </div>

      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#B8860B]/20 rounded-lg pointer-events-none animate-pulse" />
      )}
    </button>
  );
}

export function PlayerSidebar({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onMoveItem,
  dragOverPlayerId,
  onDragOverChange,
  sharedLootCount,
  campaignName,
  totalSlots,
  onBack,
}: PlayerSidebarProps) {
  const [isWide, setIsWide] = useState(false);
  const [isClickExpanded, setIsClickExpanded] = useState(false);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const handle = (e: MediaQueryListEvent | MediaQueryList) => setIsWide(e.matches);
    handle(mq);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current !== null) window.clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const handleDrop = useCallback(
    (toId: string | 'shared') => (itemId: string, fromId: string) => {
      onMoveItem(itemId, fromId, toId);
      onDragOverChange(null);
    },
    [onMoveItem, onDragOverChange],
  );

  const [{ isSidebarOver }, sidebarDrop] = useDrop(
    () => ({
      accept: 'INVENTORY_ITEM',
      collect: (monitor) => ({
        isSidebarOver: monitor.isOver(),
      }),
    }),
    [],
  );

  const isExpanded = isWide || isSidebarOver || dragOverPlayerId !== null || isClickExpanded;

  const handleSidebarClick = () => {
    if (isWide) return;
    setIsClickExpanded(true);
    if (clickTimeoutRef.current !== null) window.clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = window.setTimeout(() => setIsClickExpanded(false), 3000);
  };

  return (
    <div
      ref={sidebarDrop as any}
      onClick={handleSidebarClick}
      className={
        (isExpanded ? 'w-52' : 'w-14') +
        ' sm:w-52 bg-[#D9C7AA] border-r-4 border-[#3D1409] p-2 sm:p-3 flex flex-col shrink-0 transition-all duration-200 overflow-hidden relative'
      }
      style={{ boxShadow: '4px 0 8px rgba(61, 20, 9, 0.15)' }}
    >
      {!isExpanded && (
        <div className="sm:hidden absolute inset-0 bg-[#5C1A1A] flex flex-col items-center justify-center gap-2 text-white pointer-events-none">
          <div
            className="text-[10px] font-semibold tracking-[0.2em]"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            PARTY
          </div>
          <div className="text-xs"></div>
        </div>
      )}

      {isExpanded && (
        <>
          {/* Campaign name header */}
          <div className="mb-3 pb-2 border-b-2 border-[#8B6F47]/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="flex items-center gap-1 text-[#5C4A2F] hover:text-[#3D1409] transition-colors mb-1 text-[10px]"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
            <h2 className="text-[#3D1409] text-sm font-bold truncate leading-tight">
              {campaignName}
            </h2>
          </div>

          {/* Party Members */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            <div className="flex items-center gap-1.5 text-[#5C4A2F] text-[10px] font-semibold uppercase tracking-wider mb-1 px-0.5">
              <Users className="w-3 h-3" />
              <span>Party</span>
            </div>
            <div className="space-y-1.5">
              {players.map((player) => (
                <PlayerSlot
                  key={player.id}
                  player={player}
                  isSelected={selectedPlayerId === player.id}
                  onClick={() => onSelectPlayer(player.id)}
                  onDrop={handleDrop(player.id)}
                  isBeingDraggedOver={dragOverPlayerId === player.id}
                />
              ))}
              {Array.from({ length: Math.max(0, totalSlots - players.length) }).map(
                (_, i) => (
                  <EmptySlot key={'empty-' + i} index={players.length + i} />
                ),
              )}
            </div>

            {/* Shared Loot */}
            <div className="mt-3 pt-2 border-t-2 border-[#8B6F47]/30">
              <div className="flex items-center gap-1.5 text-[#5C4A2F] text-[10px] font-semibold uppercase tracking-wider mb-1 px-0.5">
                <Package className="w-3 h-3" />
                <span>Shared</span>
              </div>
              <SharedLootSlot
                isSelected={selectedPlayerId === 'shared'}
                onClick={() => onSelectPlayer('shared')}
                onDrop={handleDrop('shared')}
                itemCount={sharedLootCount}
                isBeingDraggedOver={dragOverPlayerId === 'shared'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t-2 border-[#8B6F47]/30">
            <div className="text-[9px] text-[#8B6F47] text-center leading-tight">
              Drag items between inventories
            </div>
          </div>
        </>
      )}
    </div>
  );
}
