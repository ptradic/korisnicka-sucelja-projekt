import { useCallback, useEffect, useRef, useState } from 'react';
import { useDrop, useDragLayer } from 'react-dnd';
import { Package, Users, User, Copy, Check, Settings, X, Eye, EyeOff, Save } from 'lucide-react';
import type { Player } from '../types';
import { useCustomScrollbar } from '../hooks/useCustomScrollbar';
import { calcTotalWeight } from '@/lib/utils';

interface PlayerSidebarProps {
  players: Player[];
  selectedPlayerId: string | 'shared';
  onSelectPlayer: (playerId: string | 'shared') => void;
  onMoveItem: (itemIds: string[], fromId: string | 'shared', toId: string | 'shared') => void;
  dragOverPlayerId: string | 'shared' | null;
  onDragOverChange: (playerId: string | 'shared' | null) => void;
  sharedLootCount: number;
  campaignName: string;
  campaignId?: string;
  campaignPassword?: string;
  isGM?: boolean;
  totalSlots: number;
  onUpdateCampaignSettings?: (updates: { name: string; password: string }) => Promise<void>;
  currentUserId?: string;
  onUpdateMyCharacterProfile?: (updates: { name: string; avatar: string }) => Promise<void>;
}

function isHttpAvatarUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function PlayerAvatar({
  avatar,
  isSelected,
  sizeClass,
  iconClass,
  textClass,
}: {
  avatar: string;
  isSelected: boolean;
  sizeClass: string;
  iconClass: string;
  textClass: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const trimmedAvatar = avatar.trim();
  const canRenderImage = !imageFailed && isHttpAvatarUrl(trimmedAvatar);

  useEffect(() => {
    setImageFailed(false);
  }, [avatar]);

  return (
    <div
      className={
        sizeClass +
        ' rounded-full flex items-center justify-center shrink-0 transition-all overflow-hidden ' +
        (isSelected ? 'bg-white/20' : 'bg-[#D9C7AA] border border-[#8B6F47]/40')
      }
    >
      {canRenderImage ? (
        <img
          src={trimmedAvatar}
          alt="Player avatar"
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : trimmedAvatar ? (
        <span className={textClass + ' select-none'}>{trimmedAvatar.slice(0, 2)}</span>
      ) : (
        <User className={iconClass + ' ' + (isSelected ? 'text-white/80' : 'text-[#8B6F47]')} />
      )}
    </div>
  );
}

function CharacterNameModal({
  initialName,
  initialAvatar,
  onClose,
  onSave,
}: {
  initialName: string;
  initialAvatar: string;
  onClose: () => void;
  onSave: (updates: { name: string; avatar: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedAvatar = avatar.trim();

    if (!trimmedName) {
      setError('Character name is required.');
      return;
    }
    if (trimmedAvatar && !isHttpAvatarUrl(trimmedAvatar)) {
      setError('Avatar must be a valid http(s) image link.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({ name: trimmedName, avatar: trimmedAvatar });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Could not update character settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-md w-full shadow-2xl"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
      >
        <div className="p-5 pb-3 flex items-start justify-between border-b-2 border-[#DCC8A8]">
          <div>
            <h2 className="text-lg font-extrabold text-[#3D1409]">Character Settings</h2>
            <p className="text-[#5C4A2F] text-xs">This only affects this vault.</p>
          </div>
          <button onClick={onClose} className="btn-ghost !p-1.5 text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">Character Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C1A1A]"
              placeholder="e.g., Elira Nightwind"
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">Avatar Image Link</label>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C1A1A]"
              placeholder="https://example.com/avatar.png"
              type="url"
              inputMode="url"
            />
            <p className="text-[11px] text-[#5C4A2F] mt-1">Use a direct image URL (http or https), or leave blank.</p>
          </div>

          {error && (
            <p className="text-xs text-[#8B3A3A] bg-[#FFEBEE] border border-[#8B3A3A]/30 rounded-lg px-2 py-1.5">{error}</p>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1 px-4 py-2.5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 px-4 py-2.5 disabled:opacity-60">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultSettingsModal({
  campaignId,
  initialName,
  initialPassword,
  onClose,
  onSave,
}: {
  campaignId: string;
  initialName: string;
  initialPassword: string;
  onClose: () => void;
  onSave: (updates: { name: string; password: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState(initialPassword);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(campaignId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vault name is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await onSave({ name: trimmedName, password: password.trim() });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Could not save vault settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-md w-full shadow-2xl"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
      >
        <div className="p-5 pb-3 flex items-start justify-between border-b-2 border-[#DCC8A8]">
          <div>
            <h2 className="text-lg font-extrabold text-[#3D1409]">Vault Settings</h2>
            <p className="text-[#5C4A2F] text-xs">GM only</p>
          </div>
          <button onClick={onClose} className="btn-ghost !p-1.5 text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white/50 border-2 border-[#8B6F47] rounded-xl p-3">
            <label className="block text-[#3D1409] font-semibold text-sm mb-2">Invite Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-[#8B6F47] rounded-lg px-3 py-2 font-mono text-base tracking-widest text-[#3D1409] text-center font-bold">
                {campaignId}
              </div>
              <button onClick={handleCopy} className="btn-primary !p-2.5 rounded-lg" title="Copy invite code">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[#5C4A2F] text-xs mt-2">
              Give this invite code to players so they can join this vault.
            </p>
          </div>

          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">Vault Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C1A1A]"
              placeholder="Enter vault name"
            />
          </div>

          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">Vault Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C1A1A]"
                placeholder="Enter vault password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A]"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#8B3A3A] bg-[#FFEBEE] border border-[#8B3A3A]/30 rounded-lg px-2 py-1.5">{error}</p>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1 px-4 py-2.5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 px-4 py-2.5 disabled:opacity-60">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/*  Compact pill for mobile horizontal bar  */
function PlayerPill({
  player,
  isSelected,
  onClick,
  onDrop,
  isBeingDraggedOver,
  isAnyDragging,
}: {
  player: Player;
  isSelected: boolean;
  onClick: () => void;
  onDrop: (itemIds: string[], fromId: string) => void;
  isBeingDraggedOver: boolean;
  isAnyDragging: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'INVENTORY_ITEM',
      drop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => {
        onDrop(dragItem.ids && dragItem.ids.length > 0 ? dragItem.ids : [dragItem.id], dragItem.ownerId);
      },
      canDrop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => dragItem.ownerId !== player.id,
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
        'shrink-0 flex items-center gap-1.5 rounded-full border-2 transition-all whitespace-nowrap relative ' +
        (isAnyDragging ? 'px-5 py-3 ' : 'px-3 py-1.5 ') +
        (isSelected
          ? 'bg-[#5C1A1A] text-white border-[#3D1409] shadow-md'
          : isOver && canDrop
            ? 'bg-[#D4C4A8] border-[#8B6F47] scale-105'
            : isBeingDraggedOver
              ? 'bg-[#CDB89D] border-[#3D1409]'
              : 'bg-[#F5EFE0] border-[#8B6F47]/50 text-[#3D1409]')
      }
    >
      <PlayerAvatar
        avatar={player.avatar}
        isSelected={isSelected}
        sizeClass={isAnyDragging ? 'w-8 h-8' : 'w-6 h-6'}
        iconClass={isAnyDragging ? 'w-4 h-4' : 'w-3 h-3'}
        textClass={
          (isAnyDragging ? 'text-sm ' : 'text-xs ') +
          'font-semibold leading-none ' +
          (isSelected ? 'text-white/90' : 'text-[#5C1A1A]')
        }
      />
      <span className={(isAnyDragging ? 'text-sm ' : 'text-xs ') + 'font-semibold'}>{player.name}</span>
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#B8860B]/20 rounded-full pointer-events-none animate-pulse" />
      )}
    </button>
  );
}

function SharedPill({
  isSelected,
  onClick,
  onDrop,
  itemCount,
  isBeingDraggedOver,
  isAnyDragging,
}: {
  isSelected: boolean;
  onClick: () => void;
  onDrop: (itemIds: string[], fromId: string) => void;
  itemCount: number;
  isBeingDraggedOver: boolean;
  isAnyDragging: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'INVENTORY_ITEM',
      drop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => {
        onDrop(dragItem.ids && dragItem.ids.length > 0 ? dragItem.ids : [dragItem.id], dragItem.ownerId);
      },
      canDrop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => dragItem.ownerId !== 'shared',
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
        'shrink-0 flex items-center gap-1.5 rounded-full border-2 transition-all whitespace-nowrap relative ' +
        (isAnyDragging ? 'px-5 py-3 ' : 'px-3 py-1.5 ') +
        (isSelected
          ? 'bg-[#8B6F47] text-white border-[#3D1409] shadow-md'
          : isOver && canDrop
            ? 'bg-[#D4C4A8] border-[#8B6F47] scale-105'
            : isBeingDraggedOver
              ? 'bg-[#CDB89D] border-[#3D1409]'
              : 'bg-[#F5EFE0] border-[#8B6F47]/50 text-[#3D1409]')
      }
    >
      <div
        className={
          (isAnyDragging ? 'w-8 h-8 ' : 'w-6 h-6 ') +
          'rounded-full flex items-center justify-center shrink-0 transition-all ' +
          (isSelected ? 'bg-white/20' : 'bg-[#D9C7AA]')
        }
      >
        <Package className={(isAnyDragging ? 'w-4 h-4 ' : 'w-3 h-3 ') + (isSelected ? 'text-white/80' : 'text-[#8B6F47]')} />
      </div>
      <span className={(isAnyDragging ? 'text-sm ' : 'text-xs ') + 'font-semibold'}>Shared</span>
      <span className={(isAnyDragging ? 'text-xs ' : 'text-[10px] ') + (isSelected ? 'text-white/60' : 'text-[#8B6F47]')}>
        ({itemCount})
      </span>
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#B8860B]/20 rounded-full pointer-events-none animate-pulse" />
      )}
    </button>
  );
}

/*  Full slot for desktop sidebar  */
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
  onDrop: (itemIds: string[], fromId: string) => void;
  isBeingDraggedOver: boolean;
}) {
  const currentWeight = calcTotalWeight(player.inventory, player.currency);
  const weightPercentage = (currentWeight / player.maxWeight) * 100;

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'INVENTORY_ITEM',
      drop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => {
        onDrop(dragItem.ids && dragItem.ids.length > 0 ? dragItem.ids : [dragItem.id], dragItem.ownerId);
      },
      canDrop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => dragItem.ownerId !== player.id,
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
        <PlayerAvatar
          avatar={player.avatar}
          isSelected={isSelected}
          sizeClass="w-8 h-8"
          iconClass="w-4 h-4"
          textClass={'text-sm font-semibold leading-none ' + (isSelected ? 'text-white/90' : 'text-[#5C1A1A]')}
        />
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
  onDrop: (itemIds: string[], fromId: string) => void;
  itemCount: number;
  isBeingDraggedOver: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'INVENTORY_ITEM',
      drop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => {
        onDrop(dragItem.ids && dragItem.ids.length > 0 ? dragItem.ids : [dragItem.id], dragItem.ownerId);
      },
      canDrop: (dragItem: { id: string; ids?: string[]; ownerId: string }) => dragItem.ownerId !== 'shared',
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
            {itemCount} {itemCount === 1 ? 'item' : 'items'} &middot; No weight limit
          </div>
        </div>
      </div>
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#B8860B]/20 rounded-lg pointer-events-none animate-pulse" />
      )}
    </button>
  );
}

/*  Main Sidebar Component  */
export function PlayerSidebar({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onMoveItem,
  dragOverPlayerId,
  onDragOverChange,
  sharedLootCount,
  campaignName,
  campaignId,
  campaignPassword,
  isGM,
  totalSlots,
  onUpdateCampaignSettings,
  currentUserId,
  onUpdateMyCharacterProfile,
}: PlayerSidebarProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const desktopListRef = useRef<HTMLDivElement>(null);
  const { isDragging: isAnyDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));
  const currentPlayer = currentUserId ? players.find((player) => player.id === currentUserId) : undefined;

  const handleDrop = useCallback(
    (toId: string | 'shared') => (itemIds: string[], fromId: string) => {
      onMoveItem(itemIds, fromId, toId);
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

  const {
    showScrollbar: showDesktopListScrollbar,
    thumbTop: desktopListThumbTop,
    thumbHeight: desktopListThumbHeight,
    trackRef: desktopListTrackRef,
    handleTrackClick: handleDesktopListTrackClick,
    handleThumbMouseDown: handleDesktopListThumbMouseDown,
  } = useCustomScrollbar(desktopListRef);

  return (
    <>
      {/*  Mobile: horizontal bar on top  */}
      <div
        ref={sidebarDrop as any}
        data-tutorial="sidebar"
        className="sm:hidden relative bg-[#D9C7AA] border-b-4 border-[#3D1409] px-3 py-2 shrink-0"
        style={{ boxShadow: '0 4px 8px rgba(61, 20, 9, 0.15)' }}
      >
        {/* Gear icon — absolute top-right corner (GM settings or player character name) */}
        {isGM && campaignId && onUpdateCampaignSettings && (
          <button
            data-tutorial="vault-settings"
            onClick={() => setShowSettingsModal(true)}
            title="Vault settings"
            className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-white/60 text-[#5C1A1A] transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
        {!isGM && currentPlayer && onUpdateMyCharacterProfile && (
          <button
            data-tutorial="character-settings"
            onClick={() => setShowCharacterModal(true)}
            title="Change your character settings"
            className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-white/60 text-[#5C1A1A] transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* Campaign name */}
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-[#3D1409] text-sm font-bold truncate flex-1 pr-8">{campaignName}</h2>
        </div>

        {/* Wrapping player pills */}
        <div className="flex flex-wrap items-center gap-2">
          {players.map((player) => (
            <PlayerPill
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              onClick={() => onSelectPlayer(player.id)}
              onDrop={handleDrop(player.id)}
              isBeingDraggedOver={dragOverPlayerId === player.id}
              isAnyDragging={isAnyDragging}
            />
          ))}
          <SharedPill
            isSelected={selectedPlayerId === 'shared'}
            onClick={() => onSelectPlayer('shared')}
            onDrop={handleDrop('shared')}
            itemCount={sharedLootCount}
            isBeingDraggedOver={dragOverPlayerId === 'shared'}
            isAnyDragging={isAnyDragging}
          />
        </div>
      </div>

      {/*  Desktop: vertical sidebar on left  */}
      <div
        data-tutorial="sidebar"
        className="hidden sm:flex w-52 bg-[#D9C7AA] border-r-4 border-[#3D1409] p-3 flex-col shrink-0 overflow-hidden"
        style={{ boxShadow: '4px 0 8px rgba(61, 20, 9, 0.15)' }}
      >
        {/* Campaign name header */}
        <div className="mb-3 pb-2 border-b-2 border-[#8B6F47]/50">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[#3D1409] text-sm font-bold truncate leading-tight flex-1">
              {campaignName}
            </h2>
            {!isGM && currentPlayer && onUpdateMyCharacterProfile && (
              <button
                data-tutorial="character-settings"
                onClick={() => setShowCharacterModal(true)}
                title="Change your character settings"
                className="p-1.5 rounded-lg hover:bg-white/60 text-[#5C1A1A] transition-all shrink-0"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            {isGM && campaignId && onUpdateCampaignSettings && (
              <button
                data-tutorial="vault-settings"
                onClick={() => setShowSettingsModal(true)}
                title="Vault settings"
                className="p-1.5 rounded-lg hover:bg-white/60 text-[#5C1A1A] transition-all shrink-0"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Party Members */}
        <div className="relative flex-1 min-h-0">
          <div ref={desktopListRef} className="h-full overflow-y-auto space-y-2 min-h-0 custom-scrollbar">
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
              {Array.from({ length: Math.max(0, totalSlots - players.length) }).map((_, i) => (
                <EmptySlot key={'empty-' + i} index={players.length + i} />
              ))}
            </div>

            {/* Shared Loot */}
            <div data-tutorial="shared-loot" className="mt-3 pt-2 border-t-2 border-[#8B6F47]/30">
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

          {showDesktopListScrollbar && (
            <div
              ref={desktopListTrackRef}
              onClick={handleDesktopListTrackClick}
              className="hidden md:flex absolute top-2 right-0.5 bottom-2 w-3.5 items-stretch cursor-pointer z-10"
            >
              <div
                onMouseDown={handleDesktopListThumbMouseDown}
                className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
                style={{
                  top: `${desktopListThumbTop}px`,
                  height: `${desktopListThumbHeight}px`,
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t-2 border-[#8B6F47]/30">
          <div className="text-[9px] text-[#8B6F47] text-center leading-tight">
            Drag items between inventories
          </div>
        </div>
      </div>

      {showSettingsModal && isGM && campaignId && onUpdateCampaignSettings && (
        <VaultSettingsModal
          campaignId={campaignId}
          initialName={campaignName}
          initialPassword={campaignPassword || ''}
          onClose={() => setShowSettingsModal(false)}
          onSave={onUpdateCampaignSettings}
        />
      )}

      {showCharacterModal && !isGM && currentPlayer && onUpdateMyCharacterProfile && (
        <CharacterNameModal
          initialName={currentPlayer.name}
          initialAvatar={currentPlayer.avatar}
          onClose={() => setShowCharacterModal(false)}
          onSave={onUpdateMyCharacterProfile}
        />
      )}
    </>
  );
}
