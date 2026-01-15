import { useDrop } from 'react-dnd';
import { Package, Users } from 'lucide-react';
import type { Player } from '../types';

interface PlayerSidebarProps {
  players: Player[];
  selectedPlayerId: string | 'shared';
  onSelectPlayer: (playerId: string | 'shared') => void;
  onMoveItem: (itemId: string, fromId: string | 'shared', toId: string | 'shared') => void;
  dragOverPlayerId: string | 'shared' | null;
  onDragOverChange: (playerId: string | 'shared' | null) => void;
  sharedLootCount: number;
}

function PlayerIcon({ 
  player, 
  isSelected, 
  onClick, 
  onDrop, 
  isBeingDraggedOver 
}: { 
  player: Player; 
  isSelected: boolean; 
  onClick: () => void;
  onDrop: (itemId: string, fromId: string) => void;
  isBeingDraggedOver: boolean;
}) {
  const currentWeight = player.inventory.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const weightPercentage = (currentWeight / player.maxWeight) * 100;

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item: { id: string; ownerId: string }) => {
      onDrop(item.id, item.ownerId);
    },
    canDrop: (item: { id: string; ownerId: string }) => item.ownerId !== player.id,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [player.id]);

  return (
    <button
      ref={drop as any}
      onClick={onClick}
      className={`w-full p-3 rounded-lg transition-all relative border-[3px] shadow-md ${
        isSelected
          ? `${player.color} text-white shadow-lg border-[#3D1409]`
          : isOver && canDrop
          ? 'bg-[#D4C4A8] border-[#8B6F47] scale-105'
          : isBeingDraggedOver
          ? 'bg-[#CDB89D] border-[#3D1409]'
          : 'bg-[#F5EFE0] border-[#8B6F47] hover:border-[#5C4A2F] hover:bg-[#F0E8D5] text-[#3D1409]'
      }`}
      style={{
        boxShadow: isSelected 
          ? '0 4px 6px -1px rgba(61, 20, 9, 0.3), 0 2px 4px -1px rgba(61, 20, 9, 0.2)' 
          : '0 2px 4px -1px rgba(61, 20, 9, 0.15)'
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-3xl">{player.avatar}</div>
        <div className="text-sm truncate w-full text-center">{player.name}</div>
        
        {/* Weight bar */}
        <div className="w-full">
          <div className="text-xs opacity-90 mb-1">
            {currentWeight.toFixed(1)} / {player.maxWeight} lbs
          </div>
          <div className="w-full h-1.5 bg-[#D4C4A8] rounded-full overflow-hidden border border-[#8B6F47]/40">
            <div 
              className={`h-full transition-all ${
                weightPercentage > 90 ? 'bg-[#8B3A3A]' : weightPercentage > 70 ? 'bg-[#B8860B]' : 'bg-[#5C7A3B]'
              }`}
              style={{ width: `${Math.min(weightPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#B8860B]/30 rounded-lg pointer-events-none animate-pulse" />
      )}
    </button>
  );
}

function SharedLootIcon({ 
  isSelected, 
  onClick, 
  onDrop,
  itemCount,
  isBeingDraggedOver 
}: { 
  isSelected: boolean; 
  onClick: () => void;
  onDrop: (itemId: string, fromId: string) => void;
  itemCount: number;
  isBeingDraggedOver: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item: { id: string; ownerId: string }) => {
      onDrop(item.id, item.ownerId);
    },
    canDrop: (item: { id: string; ownerId: string }) => item.ownerId !== 'shared',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), []);

  return (
    <button
      ref={drop as any}
      onClick={onClick}
      className={`w-full p-3 rounded-lg transition-all relative border-[3px] shadow-md ${
        isSelected
          ? 'bg-[#8B6F47] text-white shadow-lg border-[#3D1409]'
          : isOver && canDrop
          ? 'bg-[#D4C4A8] border-[#8B6F47] scale-105'
          : isBeingDraggedOver
          ? 'bg-[#CDB89D] border-[#3D1409]'
          : 'bg-[#F5EFE0] border-[#8B6F47] hover:border-[#5C4A2F] hover:bg-[#F0E8D5] text-[#3D1409]'
      }`}
      style={{
        boxShadow: isSelected 
          ? '0 4px 6px -1px rgba(61, 20, 9, 0.3), 0 2px 4px -1px rgba(61, 20, 9, 0.2)' 
          : '0 2px 4px -1px rgba(61, 20, 9, 0.15)'
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <Package className="w-8 h-8" />
        <div className="text-sm">Shared Loot</div>
        <div className="text-xs opacity-80">{itemCount} items</div>
      </div>

      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#B8860B]/30 rounded-lg pointer-events-none animate-pulse" />
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
}: PlayerSidebarProps) {
  const handleDrop = (toId: string | 'shared') => (itemId: string, fromId: string) => {
    onMoveItem(itemId, fromId, toId);
    onDragOverChange(null);
  };

  return (
    <div className="w-72 bg-[#D9C7AA] border-r-[4px] border-[#3D1409] p-4 flex flex-col" style={{ boxShadow: '4px 0 8px rgba(61, 20, 9, 0.15)' }}>
      <div className="mb-6 pb-4 border-b-[3px] border-[#8B6F47]">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-[#3D1409]" />
          <div>
            <h1 className="text-[#3D1409]">Trailblazers' Vault</h1>
            <p className="text-[#5C4A2F] text-xs">Party inventory manager</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[#5C4A2F] text-xs mb-2 px-2">
            <Users className="w-4 h-4" />
            <span>PARTY MEMBERS</span>
          </div>
          <div className="space-y-2">
            {players.map(player => (
              <PlayerIcon
                key={player.id}
                player={player}
                isSelected={selectedPlayerId === player.id}
                onClick={() => onSelectPlayer(player.id)}
                onDrop={handleDrop(player.id)}
                isBeingDraggedOver={dragOverPlayerId === player.id}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[#5C4A2F] text-xs mb-2 px-2">
            <Package className="w-4 h-4" />
            <span>SHARED</span>
          </div>
          <SharedLootIcon
            isSelected={selectedPlayerId === 'shared'}
            onClick={() => onSelectPlayer('shared')}
            onDrop={handleDrop('shared')}
            itemCount={sharedLootCount}
            isBeingDraggedOver={dragOverPlayerId === 'shared'}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t-[3px] border-[#8B6F47]">
        <div className="text-xs text-[#5C4A2F] text-center">
          Drag items between inventories
        </div>
      </div>
    </div>
  );
}
