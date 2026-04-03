"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MouseTransition, TouchTransition } from 'dnd-multi-backend';
import { usePreview } from 'react-dnd-multi-backend';
import { useVaultAuth } from '../VaultAuthProvider';
import { PlayerSidebar } from '@/app/components/PlayerSidebar';
import { InventoryView } from '@/app/components/InventoryView';
import { AddItemModal } from '@/app/components/AddItemModal';
import { ItemDetailsModal } from '@/app/components/ItemDetailsModal';
import { TransferRequestModal, TransferSentToast, TransferExpiredToast, RemoveItemUndoToast } from '@/app/components/TransferRequestModal';
import { VaultDetailSkeleton } from '@/app/components/skeletons/SkeletonLoader';
import { VaultTutorial, useVaultTutorial } from '@/app/components/VaultTutorial';
import type { Item, Player, Currency } from '@/app/types';
import {
  getCampaign,
  subscribeToCampaign,
  subscribeToPlayerInventories,
  moveItemBetweenInventories,
  updatePlayerInventory,
  updatePlayerProfileInCampaign,
  updateSharedLoot,
  createTransferRequest,
  cancelTransferRequest,
  acceptTransferRequest,
  rejectTransferRequest,
  subscribeToTransferRequests,
  subscribeToRejectedTransfers,
  restoreRejectedTransfer,
  subscribeToPendingTransfersFromMe,
  checkAndExpirePendingTransfers,
  deletePlayerInventoryDoc,
  updateCampaignSettings,
  createUserHomebrewItem,
  updateCampaignCustomItemPool,
  updateUserHomebrewItem,
  deleteUserHomebrewItem,
  updateSharedCurrency,
  kickPlayer,
} from '@/src/firebaseService';
import type { CampaignDoc, PlayerInventoryDoc, TransferRequest } from '@/src/firebaseService';

/* ── Multi-backend DnD configuration ─────────────────────────────────── */
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: false, delayTouchStart: 300 },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

/* ── Item stack signature (identical items stack by quantity) ────────── */
type StackComparableItem = Pick<Item, 'name' | 'category' | 'rarity' | 'weight'> &
  Partial<Pick<Item, 'description' | 'value' | 'valueUnit' | 'valueUnknown' | 'notes' | 'attunement' | 'attuned' | 'sourcebook'>>;

function getItemStackSignature(item: StackComparableItem): string {
  return JSON.stringify({
    name: item.name.trim().toLowerCase(),
    category: item.category,
    rarity: item.rarity,
    description: item.description ?? '',
    weight: Number.isFinite(item.weight) ? item.weight : 0,
    value: item.value ?? null,
    valueUnit: item.valueUnit ?? null,
    valueUnknown: Boolean(item.valueUnknown),
    notes: item.notes ?? '',
    attunement: Boolean(item.attunement),
    attuned: Boolean(item.attuned),
    sourcebook: (item.sourcebook ?? '').trim().toLowerCase(),
  });
}

/* ── Touch drag preview ──────────────────────────────────────────────── */
function TouchDragPreview() {
  const preview = usePreview();
  if (!preview.display) return null;

  const { item, monitor } = preview;
  const offset = monitor.getClientOffset();
  if (!offset) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: offset.x,
        top: offset.y - 50,
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%) scale(1.05)',
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 bg-white/95 border-[#3D1409] shadow-2xl backdrop-blur-sm max-w-[200px]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#8B6F47] shrink-0" />
        <span className="text-sm text-[#3D1409] font-semibold truncate">
          {(item as any)?.name || 'Item'}
        </span>
      </div>
    </div>
  );
}

/* ── Vault detail page ───────────────────────────────────────────────── */
export default function VaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const {
    userId, userName, userRole,
    userHomebrew, setUserHomebrew,
    isLoading, isAuthenticated,
    trackWrite, showActionError, pendingWriteCount,
  } = useVaultAuth();

  /* ── Campaign-level state ── */
  const [currentCampaign, setCurrentCampaign] = useState<CampaignDoc | null>(null);
  const [playerInventories, setPlayerInventories] = useState<PlayerInventoryDoc[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | 'shared'>('shared');
  const [isCampaignLoading, setIsCampaignLoading] = useState(true);

  /* ── UI state ── */
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | 'shared' | null>(null);

  /* ── Transfer state ── */
  const [pendingTransferRequests, setPendingTransferRequests] = useState<TransferRequest[]>([]);
  const [transferSentInfo, setTransferSentInfo] = useState<{ requestIds: string[]; playerName: string; itemLabel: string; expiresAt: Date } | null>(null);
  const [expiredTransferInfo, setExpiredTransferInfo] = useState<{ playerName: string; itemName: string; isReceiver: boolean } | null>(null);
  const [undoRemoveInfo, setUndoRemoveInfo] = useState<{ itemName: string; restore: () => Promise<void> } | null>(null);

  /* ── Refs for stable access inside effects ── */
  const userRoleRef = useRef(userRole);
  const userIdRef = useRef(userId);
  userRoleRef.current = userRole;
  userIdRef.current = userId;

  /* ═══════════════════════════════════════════════════════════════════ *
   *  EFFECTS                                                          *
   * ═══════════════════════════════════════════════════════════════════ */

  // 1. Initial campaign load + access check
  useEffect(() => {
    if (isLoading || !userId || !campaignId) return;

    let cancelled = false;

    getCampaign(campaignId)
      .then((campaign) => {
        if (cancelled) return;
        if (!campaign || (campaign.gmId !== userId && !campaign.playerIds.includes(userId))) {
          router.replace('/vaults');
          return;
        }
        setCurrentCampaign(campaign);
        setSelectedPlayerId(userRole === 'player' ? userId : 'shared');
        setIsCampaignLoading(false);
      })
      .catch(() => {
        if (!cancelled) router.replace('/vaults');
      });

    return () => { cancelled = true; };
  }, [isLoading, userId, campaignId, router, userRole]);

  // 2. Real-time subscriptions (after initial load validates access)
  useEffect(() => {
    if (isCampaignLoading || !campaignId) return;

    const unsubCampaign = subscribeToCampaign(campaignId, (campaign) => {
      if (!campaign || (campaign.gmId !== userIdRef.current && !campaign.playerIds.includes(userIdRef.current))) {
        router.replace('/vaults');
        return;
      }
      setCurrentCampaign(campaign);
    });

    const unsubInventories = subscribeToPlayerInventories(campaignId, (inventories) => {
      setPlayerInventories(inventories);
    });

    return () => { unsubCampaign(); unsubInventories(); };
  }, [isCampaignLoading, campaignId, router]);

  // 3. Transfer requests (incoming, player only)
  useEffect(() => {
    if (!campaignId || !userId || userRole === 'gm') {
      setPendingTransferRequests([]);
      return;
    }

    const unsubscribe = subscribeToTransferRequests(campaignId, userId, (requests) => {
      setPendingTransferRequests(prevRequests => {
        const newRequestIds = requests.map(r => r.id);
        const missingRequests = prevRequests.filter(prevReq =>
          !newRequestIds.includes(prevReq.id) &&
          Date.now() > prevReq.expiresAt.toMillis()
        );

        if (missingRequests.length > 0) {
          const expiredReq = missingRequests[0];
          setExpiredTransferInfo({
            playerName: expiredReq.fromPlayerName,
            itemName: expiredReq.itemName,
            isReceiver: true,
          });
          setTimeout(() => setExpiredTransferInfo(null), 8000);
        }

        return requests;
      });
    });

    return () => unsubscribe();
  }, [campaignId, userId, userRole]);

  // 4. Rejected/expired transfers (as sender) — auto-restore items
  useEffect(() => {
    if (!campaignId || !userId || userRole === 'gm') return;

    const unsubscribe = subscribeToRejectedTransfers(campaignId, userId, async (rejectedOrExpiredRequests) => {
      for (const request of rejectedOrExpiredRequests) {
        try {
          await restoreRejectedTransfer(campaignId, request.id, userId);

          if (request.status === 'expired') {
            setExpiredTransferInfo({
              playerName: request.toPlayerName,
              itemName: request.itemName,
              isReceiver: false,
            });
            setTimeout(() => setExpiredTransferInfo(null), 8000);
          }
        } catch (error) {
          console.error('Failed to restore rejected/expired transfer:', error);
          showActionError('Could not restore transfer', error, () =>
            restoreRejectedTransfer(campaignId, request.id, userId)
          );
        }
      }
    });

    return () => unsubscribe();
  }, [campaignId, userId, userRole, showActionError]);

  // 5. Pending transfers from me — triggers expiration check
  useEffect(() => {
    if (!campaignId || !userId || userRole === 'gm') return;

    const unsubscribe = subscribeToPendingTransfersFromMe(campaignId, userId, () => {
      // Subscription itself handles marking expired requests
    });

    return () => unsubscribe();
  }, [campaignId, userId, userRole]);

  // 6. Periodic expiration check
  useEffect(() => {
    if (!campaignId || !userId || userRole === 'gm') return;

    const runExpirationCheck = async () => {
      try {
        await checkAndExpirePendingTransfers(campaignId, userId);
      } catch (error) {
        console.error('Failed to expire pending transfers:', error);
        showActionError('Could not sync pending transfers', error, () => runExpirationCheck());
      }
    };

    void runExpirationCheck();
    const interval = setInterval(() => { void runExpirationCheck(); }, 2000);

    return () => clearInterval(interval);
  }, [campaignId, userId, userRole, showActionError]);

  // 7. GM cleanup: remove stale inventory docs
  useEffect(() => {
    if (!campaignId || userRole !== 'gm' || !currentCampaign) return;

    const staleInventories = playerInventories.filter(
      (inventoryDoc) => !currentCampaign.playerIds.includes(inventoryDoc.playerId)
    );

    if (staleInventories.length === 0) return;

    staleInventories.forEach((inventoryDoc) => {
      void trackWrite(() => deletePlayerInventoryDoc(campaignId, inventoryDoc.playerId)).catch((error) => {
        console.error('Failed to clean stale player inventory:', error);
      });
    });
  }, [campaignId, currentCampaign, playerInventories, userRole, trackWrite]);

  // 8. Auto-select player when current selection becomes invalid
  const activePlayerInventories = currentCampaign
    ? playerInventories.filter((inventoryDoc) => currentCampaign.playerIds.includes(inventoryDoc.playerId))
    : playerInventories;

  const players: Player[] = activePlayerInventories.map((inv) => ({
    id: inv.playerId,
    name: inv.playerName,
    color: inv.color,
    avatar: inv.avatar,
    maxWeight: inv.maxWeight,
    inventory: inv.inventory,
    currency: inv.currency,
  })).sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (selectedPlayerId === 'shared' || players.length === 0) return;
    const stillExists = players.some((player) => player.id === selectedPlayerId);
    if (!stillExists) {
      const myUserId = userIdRef.current;
      const myRole = userRoleRef.current;
      const myInventoryExists = players.some((player) => player.id === myUserId);
      if (myRole === 'player' && myUserId && myInventoryExists) {
        setSelectedPlayerId(myUserId);
      } else {
        setSelectedPlayerId('shared');
      }
    }
  }, [selectedPlayerId, players]);

  /* ═══════════════════════════════════════════════════════════════════ *
   *  HANDLERS                                                         *
   * ═══════════════════════════════════════════════════════════════════ */

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const isShared = selectedPlayerId === 'shared';
  const isGM = userRole === 'gm';
  const { showTutorial, startTutorial, completeTutorial } = useVaultTutorial(isGM);
  const canPlayerEditSelectedItem = !isGM && !!selectedItem && (selectedItem.sourcebook || '').trim().toUpperCase() === 'PLAYER CUSTOM';
  const vaultCustomItems = currentCampaign?.customItemPool ?? [];
  const syncStatus: 'saving' | 'saved' = pendingWriteCount > 0 ? 'saving' : 'saved';

  // Item movement
  const handleMoveItem = async (itemIds: string[], fromId: string | 'shared', toId: string | 'shared') => {
    if (!campaignId) return;
    if (itemIds.length === 0) return;

    const isPlayerToPlayer = !isGM && fromId !== 'shared' && toId !== 'shared' && fromId === userId && toId !== userId;

    if (isPlayerToPlayer) {
      try {
        const sourceInventory = playerInventories.find((inv) => inv.playerId === fromId);
        if (!sourceInventory) {
          console.error('Source inventory not found');
          return;
        }

        const recipientInventory = playerInventories.find((inv) => inv.playerId === toId);
        const recipientName = recipientInventory?.playerName || 'Unknown Player';
        const senderName = sourceInventory?.playerName || userName;

        const requestIds: string[] = [];
        const movedNames: string[] = [];
        for (const itemId of itemIds) {
          const item = sourceInventory.inventory.find((inventoryItem) => inventoryItem.id === itemId);
          if (!item) continue;

          const requestId = await trackWrite(() => createTransferRequest(
            campaignId,
            item,
            fromId,
            senderName,
            toId,
            recipientName
          ));
          requestIds.push(requestId);
          movedNames.push(item.name);
        }

        if (requestIds.length === 0) {
          console.error('No items could be prepared for transfer');
          return;
        }

        const itemLabel = movedNames.length === 1
          ? movedNames[0]
          : `${movedNames.length} items`;

        const expiresAt = new Date(Date.now() + 10 * 1000);
        setTransferSentInfo({ requestIds, playerName: recipientName, itemLabel, expiresAt });
        setTimeout(() => setTransferSentInfo(null), 13000);
      } catch (error) {
        console.error('Failed to create transfer request:', error);
        showActionError('Could not send transfer request', error, () => handleMoveItem(itemIds, fromId, toId));
      }
    } else {
      try {
        for (const itemId of itemIds) {
          await trackWrite(() => moveItemBetweenInventories(
            campaignId,
            itemId,
            fromId,
            toId,
            userId,
            isGM
          ));
        }
      } catch (error) {
        console.error('Failed to move item:', error);
        showActionError('Could not move item', error, () => handleMoveItem(itemIds, fromId, toId));
      }
    }
  };

  // Transfer accept/reject/cancel
  const handleAcceptTransfer = async (request: TransferRequest) => {
    if (!campaignId || !userId) return;
    try {
      await trackWrite(() => acceptTransferRequest(campaignId, request.id, userId));
    } catch (error) {
      console.error('Failed to accept transfer:', error);
      showActionError('Could not accept transfer', error, () => handleAcceptTransfer(request));
      throw error;
    }
  };

  const handleRejectTransfer = async (request: TransferRequest) => {
    if (!campaignId) return;
    try {
      await trackWrite(() => rejectTransferRequest(campaignId, request.id));
    } catch (error) {
      console.error('Failed to reject transfer:', error);
      showActionError('Could not reject transfer', error, () => handleRejectTransfer(request));
      throw error;
    }
  };

  const handleCancelSentTransfer = async (requestIds: string[]) => {
    if (!campaignId || !userId) return;
    try {
      for (const requestId of requestIds) {
        await trackWrite(() => cancelTransferRequest(campaignId, requestId, userId));
      }
    } catch (error) {
      console.error('Failed to cancel transfer:', error);
      showActionError('Could not cancel transfer', error, () => handleCancelSentTransfer(requestIds), 'Try cancelling again');
      throw error;
    }
  };

  // Currency
  const handleCurrencyChange = async (playerId: string, currency: Currency) => {
    if (!campaignId) return;

    try {
      const playerInv = playerInventories.find((p) => p.playerId === playerId);
      if (playerInv) {
        await trackWrite(() => updatePlayerInventory(campaignId, playerId, playerInv.inventory, currency));
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
      showActionError('Could not update currency', error, () => handleCurrencyChange(playerId, currency));
    }
  };

  const handleSharedCoinTransfer = async (amounts: Currency) => {
    if (!campaignId || !currentCampaign) return;
    const myInv = playerInventories.find((p) => p.playerId === userId);
    if (!myInv) return;

    const shared = currentCampaign.sharedCurrency ?? { pp: 0, gp: 0, sp: 0, cp: 0 };

    const clamp = (amount: number, playerHas: number, sharedHas: number) =>
      amount >= 0 ? Math.min(amount, playerHas) : Math.max(amount, -sharedHas);

    const actual: Currency = {
      pp: clamp(amounts.pp, myInv.currency.pp, shared.pp),
      gp: clamp(amounts.gp, myInv.currency.gp, shared.gp),
      sp: clamp(amounts.sp, myInv.currency.sp, shared.sp),
      cp: clamp(amounts.cp, myInv.currency.cp, shared.cp),
    };

    const newShared: Currency = {
      pp: shared.pp + actual.pp,
      gp: shared.gp + actual.gp,
      sp: shared.sp + actual.sp,
      cp: shared.cp + actual.cp,
    };
    const newPlayerCurrency: Currency = {
      pp: myInv.currency.pp - actual.pp,
      gp: myInv.currency.gp - actual.gp,
      sp: myInv.currency.sp - actual.sp,
      cp: myInv.currency.cp - actual.cp,
    };

    try {
      await Promise.all([
        trackWrite(() => updateSharedCurrency(campaignId, newShared)),
        trackWrite(() => updatePlayerInventory(campaignId, userId, myInv.inventory, newPlayerCurrency)),
      ]);
    } catch (error) {
      console.error('Failed to transfer coins:', error);
      showActionError('Could not transfer coins', error, () => handleSharedCoinTransfer(amounts));
    }
  };

  // Weight
  const handleMaxWeightChange = async (playerId: string, newMax: number) => {
    if (!campaignId) return;

    try {
      const playerInv = playerInventories.find((p) => p.playerId === playerId);
      if (playerInv) {
        await trackWrite(() => updatePlayerInventory(campaignId, playerId, playerInv.inventory, playerInv.currency, newMax));
      }
    } catch (error) {
      console.error('Failed to update max weight:', error);
      showActionError('Could not update carry limit', error, () => handleMaxWeightChange(playerId, newMax));
    }
  };

  // Add item
  const handleAddItem = async (item: Omit<Item, 'id'>) => {
    if (!campaignId || !currentCampaign) return;

    try {
      if (isShared) {
        const existingIndex = currentCampaign.sharedLoot.findIndex(
          (i) => getItemStackSignature(i) === getItemStackSignature(item)
        );

        let updatedShared: Item[];
        if (existingIndex >= 0) {
          updatedShared = [...currentCampaign.sharedLoot];
          updatedShared[existingIndex].quantity += item.quantity;
        } else {
          const newItem: Item = {
            ...item,
            sourcebook: item.sourcebook || 'unknown',
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          updatedShared = [...currentCampaign.sharedLoot, newItem];
        }
        await trackWrite(() => updateSharedLoot(campaignId, updatedShared));
      } else if (selectedPlayer) {
        const existingIndex = selectedPlayer.inventory.findIndex(
          (i) => getItemStackSignature(i) === getItemStackSignature(item)
        );

        let updatedInventory: Item[];
        if (existingIndex >= 0) {
          updatedInventory = [...selectedPlayer.inventory];
          updatedInventory[existingIndex].quantity += item.quantity;
        } else {
          const newItem: Item = {
            ...item,
            sourcebook: item.sourcebook || 'unknown',
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          updatedInventory = [...selectedPlayer.inventory, newItem];
        }
        await trackWrite(() => updatePlayerInventory(campaignId, selectedPlayerId as string, updatedInventory, selectedPlayer.currency));
      }

    } catch (error) {
      console.error('Failed to add item:', error);
      showActionError('Could not add item', error, () => handleAddItem(item));
    }
  };

  // Homebrew CRUD
  const handleCreateHomebrew = async (item: Omit<Item, 'id'>) => {
    if (!userId) return;

    try {
      const createdItem = await trackWrite(() => createUserHomebrewItem(userId, item));
      setUserHomebrew((prev) => [...prev, createdItem]);
    } catch (error) {
      console.error('Failed to create homebrew item:', error);
      showActionError('Could not save homebrew item', error, () => handleCreateHomebrew(item));
    }
  };

  const handleSaveCustomItemPool = async (items: Item[]) => {
    if (!campaignId || !currentCampaign || !userId) return;

    try {
      await trackWrite(() => updateCampaignCustomItemPool(campaignId, userId, items));
      setCurrentCampaign((prev) => (prev ? { ...prev, customItemPool: items } : prev));
    } catch (error) {
      console.error('Failed to update custom item pool:', error);
      showActionError('Could not update custom item pool', error, () => handleSaveCustomItemPool(items));
    }
  };

  const handleUpdateHomebrewItem = async (updatedItem: Item) => {
    if (!userId) return;

    try {
      await trackWrite(() => updateUserHomebrewItem(userId, updatedItem));
      setUserHomebrew((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      setCurrentCampaign((prev) => prev
        ? { ...prev, customItemPool: (prev.customItemPool ?? []).map((item) => (item.id === updatedItem.id ? updatedItem : item)) }
        : prev);
    } catch (error) {
      console.error('Failed to update homebrew item:', error);
      showActionError('Could not update homebrew item', error, () => handleUpdateHomebrewItem(updatedItem));
    }
  };

  const handleDeleteHomebrewItem = async (itemId: string) => {
    if (!userId) return;

    try {
      await trackWrite(() => deleteUserHomebrewItem(userId, itemId));
      setUserHomebrew((prev) => prev.filter((item) => item.id !== itemId));
      setCurrentCampaign((prev) => prev
        ? { ...prev, customItemPool: (prev.customItemPool ?? []).filter((item) => item.id !== itemId) }
        : prev);
    } catch (error) {
      console.error('Failed to delete homebrew item:', error);
      showActionError('Could not delete homebrew item', error, () => handleDeleteHomebrewItem(itemId));
    }
  };

  // Item editing
  const handleUpdateSelectedItem = async (baseItem: Item, updates: Partial<Item>) => {
    if (!campaignId || !currentCampaign) return;

    const isPlayerCustomItem = (baseItem.sourcebook || '').trim().toUpperCase() === 'PLAYER CUSTOM';
    const isHiddenToggleOnly = Object.keys(updates).length === 1 && 'hiddenFromOthers' in updates;
    const isAttunementToggleOnly = Object.keys(updates).length === 1 && 'attuned' in updates;
    if (!isGM && !isPlayerCustomItem && !isHiddenToggleOnly && !isAttunementToggleOnly) {
      return;
    }

    const sanitizedUpdates = (!isGM && !isHiddenToggleOnly && !isAttunementToggleOnly)
      ? {
          ...updates,
          sourcebook: 'PLAYER CUSTOM',
          rarity: 'common' as const,
        }
      : updates;

    const updatedItem = { ...baseItem, ...sanitizedUpdates };

    try {
      if (selectedPlayerId === 'shared') {
        const sharedIndex = currentCampaign.sharedLoot.findIndex((i) => i.id === baseItem.id);
        if (sharedIndex >= 0) {
          const updatedShared = [...currentCampaign.sharedLoot];
          updatedShared[sharedIndex] = updatedItem;
          await trackWrite(() => updateSharedLoot(campaignId, updatedShared));
          setSelectedItem(updatedItem);
        }
      } else {
        const player = playerInventories.find((p) => p.playerId === selectedPlayerId);
        if (player) {
          const itemIndex = player.inventory.findIndex((i) => i.id === baseItem.id);
          if (itemIndex >= 0) {
            const updatedInventory = [...player.inventory];
            updatedInventory[itemIndex] = updatedItem;
            await trackWrite(() => updatePlayerInventory(campaignId, selectedPlayerId, updatedInventory, player.currency, player.maxWeight));
            setSelectedItem(updatedItem);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      showActionError('Could not update item', error, () => handleUpdateSelectedItem(baseItem, updates));
    }
  };

  const handleDeleteSelectedItem = async (baseItem: Item) => {
    if (!campaignId || !currentCampaign) return;

    try {
      if (selectedPlayerId === 'shared') {
        const sharedIndex = currentCampaign.sharedLoot.findIndex((i) => i.id === baseItem.id);
        if (sharedIndex < 0) {
          setSelectedItem(null);
          return;
        }
        const previousShared = [...currentCampaign.sharedLoot];
        const updatedShared = [...currentCampaign.sharedLoot];
        if (updatedShared[sharedIndex].quantity > 1) {
          updatedShared[sharedIndex] = { ...updatedShared[sharedIndex], quantity: updatedShared[sharedIndex].quantity - 1 };
        } else {
          updatedShared.splice(sharedIndex, 1);
        }
        await trackWrite(() => updateSharedLoot(campaignId, updatedShared));
        setUndoRemoveInfo({
          itemName: baseItem.name,
          restore: () => trackWrite(() => updateSharedLoot(campaignId, previousShared)),
        });
      } else {
        const player = playerInventories.find((p) => p.playerId === selectedPlayerId);
        if (!player) {
          setSelectedItem(null);
          return;
        }
        const itemIndex = player.inventory.findIndex((i) => i.id === baseItem.id);
        if (itemIndex < 0) {
          setSelectedItem(null);
          return;
        }
        const previousInventory = [...player.inventory];
        const updatedInventory = [...player.inventory];
        if (updatedInventory[itemIndex].quantity > 1) {
          updatedInventory[itemIndex] = { ...updatedInventory[itemIndex], quantity: updatedInventory[itemIndex].quantity - 1 };
        } else {
          updatedInventory.splice(itemIndex, 1);
        }
        await trackWrite(() => updatePlayerInventory(campaignId, selectedPlayerId, updatedInventory, player.currency, player.maxWeight));
        setUndoRemoveInfo({
          itemName: baseItem.name,
          restore: () => trackWrite(() => updatePlayerInventory(campaignId, selectedPlayerId, previousInventory, player.currency, player.maxWeight)),
        });
      }

      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      showActionError('Could not delete item', error, () => handleDeleteSelectedItem(baseItem));
    }
  };

  // Campaign settings
  const handleUpdateCampaignSettings = async (updates: { name: string; password: string }) => {
    if (!campaignId || !userId || !currentCampaign) return;

    try {
      await trackWrite(() => updateCampaignSettings(campaignId, userId, updates));
      setCurrentCampaign({
        ...currentCampaign,
        name: updates.name,
        password: updates.password,
      });
    } catch (error) {
      console.error('Failed to update vault settings:', error);
      showActionError('Could not update vault settings', error, () => handleUpdateCampaignSettings(updates));
      throw error;
    }
  };

  const handleKickPlayer = async (playerId: string): Promise<void> => {
    if (!campaignId || !userId) return;
    try {
      await trackWrite(() => kickPlayer(campaignId, userId, playerId));
      if (selectedPlayerId === playerId) {
        setSelectedPlayerId('shared');
      }
    } catch (error) {
      console.error('Failed to kick player:', error);
      showActionError('Could not kick player', error, () => handleKickPlayer(playerId));
    }
  };

  const handleUpdateMyCharacterProfile = async (updates: { name: string; avatar: string }): Promise<void> => {
    if (!campaignId || !userId) {
      throw new Error('Campaign is not ready.');
    }
    await trackWrite(() => updatePlayerProfileInCampaign(campaignId, userId, updates));
  };

  /* ═══════════════════════════════════════════════════════════════════ *
   *  RENDER                                                           *
   * ═══════════════════════════════════════════════════════════════════ */

  if (isLoading || isCampaignLoading) {
    return <VaultDetailSkeleton />;
  }

  if (!isAuthenticated || !currentCampaign) return null;

  return (
    <DndProvider options={HTML5toTouch}>
      <TouchDragPreview />
      <div className="h-full bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden sm:flex-row">
          <PlayerSidebar
            players={players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            onMoveItem={handleMoveItem}
            dragOverPlayerId={dragOverPlayerId}
            onDragOverChange={setDragOverPlayerId}
            sharedLootCount={currentCampaign?.sharedLoot.length || 0}
            campaignName={currentCampaign?.name ?? 'Campaign'}
            campaignId={campaignId}
            campaignPassword={currentCampaign?.password || ''}
            isGM={isGM}
            totalSlots={currentCampaign?.playerIds.length || players.length}
            onUpdateCampaignSettings={isGM ? handleUpdateCampaignSettings : undefined}
            currentUserId={userId}
            onUpdateMyCharacterProfile={!isGM ? handleUpdateMyCharacterProfile : undefined}
          />
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
            <InventoryView
              inventory={isShared
                ? (currentCampaign?.sharedLoot ?? [])
                : (() => {
                    const inv = selectedPlayer?.inventory ?? [];
                    const isOwnerViewing = isGM || selectedPlayerId === userId;
                    return isOwnerViewing ? inv : inv.filter((i) => !i.hiddenFromOthers);
                  })()
              }
              owner={
                isShared
                  ? { name: 'Shared Loot', id: 'shared' }
                  : selectedPlayer ? { name: selectedPlayer.name, id: selectedPlayer.id } : null
              }
              ownerId={selectedPlayerId}
              isGM={isGM}
              onAddItem={() => setShowAddItemModal(true)}
              onItemClick={setSelectedItem}
              onMoveItem={handleMoveItem}
              maxWeight={isShared ? undefined : selectedPlayer?.maxWeight}
              onMaxWeightChange={isShared ? undefined : (newMax: number) => handleMaxWeightChange(selectedPlayerId, newMax)}
              currency={isShared ? (currentCampaign?.sharedCurrency ?? { pp: 0, gp: 0, sp: 0, cp: 0 }) : selectedPlayer?.currency}
              onCurrencyChange={isShared ? undefined : (c: Currency) => handleCurrencyChange(selectedPlayerId, c)}
              onCoinTransfer={isShared && !isGM ? handleSharedCoinTransfer : undefined}
              isShared={isShared}
              syncStatus={syncStatus}
              onTutorialStart={startTutorial}
              onKickPlayer={isGM && !isShared && selectedPlayerId !== userId ? () => handleKickPlayer(selectedPlayerId) : undefined}
            />
          </div>
        </div>

        {showAddItemModal && (
          <AddItemModal
            onClose={() => setShowAddItemModal(false)}
            targetName={isShared ? 'Shared Loot' : (selectedPlayer?.name ?? 'Unknown')}
            isGM={isGM}
            customItems={vaultCustomItems}
            userHomebrew={userHomebrew}
            customItemPool={vaultCustomItems}
            onSaveCustomItemPool={handleSaveCustomItemPool}
            onCreateHomebrew={handleCreateHomebrew}
            onUpdateHomebrewItem={handleUpdateHomebrewItem}
            onDeleteHomebrewItem={handleDeleteHomebrewItem}
            onAdd={handleAddItem}
          />
        )}

        {selectedItem && (
          <ItemDetailsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={isGM || canPlayerEditSelectedItem || (!isShared && selectedPlayerId === userId)
              ? (updates: Partial<Item>) => handleUpdateSelectedItem(selectedItem, updates)
              : undefined}
            onDelete={() => handleDeleteSelectedItem(selectedItem)}
            canEdit={isGM || canPlayerEditSelectedItem}
            canToggleHidden={!isShared && (isGM || selectedPlayerId === userId)}
            canToggleAttunement={!isShared && selectedPlayerId === userId}
          />
        )}

        {/* Transfer Request Modal */}
        {pendingTransferRequests.length > 0 && (
          <TransferRequestModal
            request={pendingTransferRequests[0]}
            onAccept={() => handleAcceptTransfer(pendingTransferRequests[0])}
            onReject={() => handleRejectTransfer(pendingTransferRequests[0])}
          />
        )}

        {/* Transfer Sent Toast */}
        {transferSentInfo && (
          <TransferSentToast
            playerName={transferSentInfo.playerName}
            itemLabel={transferSentInfo.itemLabel}
            expiresAt={transferSentInfo.expiresAt}
            onCancel={() => handleCancelSentTransfer(transferSentInfo.requestIds)}
            onDismiss={() => setTransferSentInfo(null)}
          />
        )}

        {/* Transfer Expired Toast */}
        {expiredTransferInfo && (
          <TransferExpiredToast
            playerName={expiredTransferInfo.playerName}
            itemName={expiredTransferInfo.itemName}
            isReceiver={expiredTransferInfo.isReceiver}
            onDismiss={() => setExpiredTransferInfo(null)}
          />
        )}

        {/* Remove Item Undo Toast */}
        {undoRemoveInfo && (
          <RemoveItemUndoToast
            itemName={undoRemoveInfo.itemName}
            onUndo={undoRemoveInfo.restore}
            onDismiss={() => setUndoRemoveInfo(null)}
          />
        )}

        {showTutorial && (
          <VaultTutorial isGM={isGM} onComplete={completeTutorial} />
        )}
      </div>
    </DndProvider>
  );
}
