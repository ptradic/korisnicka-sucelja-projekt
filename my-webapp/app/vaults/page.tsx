"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MouseTransition, TouchTransition } from 'dnd-multi-backend';
import { usePreview } from 'react-dnd-multi-backend';
import { HomePage } from '@/app/components/HomePage';
import { PlayerSidebar } from '@/app/components/PlayerSidebar';
import { InventoryView } from '@/app/components/InventoryView';
import { AddItemModal } from '@/app/components/AddItemModal';
import { ItemDetailsModal } from '@/app/components/ItemDetailsModal';
import { CampaignIdModal } from '@/app/components/CampaignIdModal';
import { TransferRequestModal, TransferSentToast, TransferExpiredToast } from '@/app/components/TransferRequestModal';
import { ActionErrorToast } from '@/app/components/ActionErrorToast';
import { VaultListSkeleton, VaultDetailSkeleton } from '@/app/components/skeletons/SkeletonLoader';
import type { Item, Player, Currency, Campaign } from '@/app/types';
import {
  onAuthChange,
  getUserDoc,
  updateUserRole,
  getCampaign,
  createCampaign,
  joinCampaign,
  getUserCampaigns,
  getAllPlayerInventories,
  moveItemBetweenInventories,
  updatePlayerInventory,
  updatePlayerNameInCampaign,
  updateSharedLoot,
  subscribeToCampaign,
  subscribeToPlayerInventories,
  generateCampaignId,
  createTransferRequest,
  cancelTransferRequest,
  acceptTransferRequest,
  rejectTransferRequest,
  subscribeToTransferRequests,
  subscribeToRejectedTransfers,
  restoreRejectedTransfer,
  subscribeToPendingTransfersFromMe,
  checkAndExpirePendingTransfers,
  getPlayerInventory,
  deleteCampaign,
  leaveCampaign,
  deletePlayerInventoryDoc,
  updateCampaignSettings,
  createUserHomebrewItem,
  updateCampaignCustomItemPool,
  updateUserHomebrewItem,
  deleteUserHomebrewItem,
  updateSharedCurrency,
} from '@/src/firebaseService';
import type { CampaignDoc, PlayerInventoryDoc, TransferRequest } from '@/src/firebaseService';

// Multi-backend configuration for desktop and mobile
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
      // delayTouchStart: 400ms — a quick swipe scrolls the list, a deliberate
      // hold starts the drag. Browser scroll works because ItemCard uses
      // touch-action:pan-y instead of touch-action:none.
      options: { enableMouseEvents: false, delayTouchStart: 400 },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

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

// Touch drag preview that follows the finger on mobile
function TouchDragPreview() {
  const preview = usePreview();
  if (!preview.display) return null;

  const { item, style } = preview;
  return (
    <div
      style={{
        ...style,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.85,
        transform: `${style.transform || ''} scale(1.05)`,
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white/90 border-[#8B6F47] shadow-xl backdrop-blur-sm max-w-[200px]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#8B6F47] shrink-0" />
        <span className="text-sm text-[#3D1409] font-medium truncate">
          {(item as any)?.name || 'Item'}
        </span>
      </div>
    </div>
  );
}

export default function VaultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCampaignId = searchParams.get('c');
  type VaultActionError = {
    title: string;
    description: string;
    onRetry?: () => Promise<void> | void;
    retryLabel?: string;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'dm' | 'player'>('player');
  const [userHomebrew, setUserHomebrew] = useState<Item[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignDoc[]>([]);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [currentCampaign, setCurrentCampaign] = useState<CampaignDoc | null>(null);
  const [playerInventories, setPlayerInventories] = useState<PlayerInventoryDoc[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | 'shared'>('shared');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | 'shared' | null>(null);
  const [newCampaignId, setNewCampaignId] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState<string>('');
  const [pendingTransferRequests, setPendingTransferRequests] = useState<TransferRequest[]>([]);
  const [transferSentInfo, setTransferSentInfo] = useState<{ requestIds: string[]; playerName: string; itemLabel: string; expiresAt: Date } | null>(null);
  const [expiredTransferInfo, setExpiredTransferInfo] = useState<{ playerName: string; itemName: string; isReceiver: boolean } | null>(null);
  const [actionError, setActionError] = useState<VaultActionError | null>(null);
  const [isRetryingAction, setIsRetryingAction] = useState(false);
  const [pendingWriteCount, setPendingWriteCount] = useState(0);

  const trackWrite = useCallback(async <T,>(writeOperation: () => Promise<T>): Promise<T> => {
    setPendingWriteCount((count) => count + 1);
    try {
      return await writeOperation();
    } finally {
      setPendingWriteCount((count) => Math.max(0, count - 1));
    }
  }, []);

  const getFirebaseErrorMessage = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : String(error ?? '');
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';

    if (code.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
      return "You don't have permission to complete this action. Check your role or campaign ownership, then retry.";
    }

    if (
      code.includes('unavailable') ||
      code.includes('deadline-exceeded') ||
      code.includes('network-request-failed') ||
      /network|offline|timeout/i.test(message)
    ) {
      return 'Firebase could not be reached. Check your connection and retry the action.';
    }

    return message ? `${fallback} ${message}` : fallback;
  };

  const showActionError = (
    title: string,
    error: unknown,
    onRetry?: () => Promise<void> | void,
    retryLabel = 'Retry'
  ) => {
    setActionError({
      title,
      description: getFirebaseErrorMessage(error, 'The change was not saved.'),
      onRetry,
      retryLabel,
    });
  };

  const handleRetryAction = async () => {
    if (!actionError?.onRetry) return;

    const retry = actionError.onRetry;
    setIsRetryingAction(true);
    setActionError(null);

    try {
      await retry();
    } finally {
      setIsRetryingAction(false);
    }
  };

  // Auth check and user data loading
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getUserDoc(firebaseUser.uid);
        if (userDoc) {
          setIsAuthenticated(true);
          setUserId(firebaseUser.uid);
          setUserName(userDoc.name);
          setUserRole(userDoc.role);
          setUserHomebrew(userDoc.userHomebrew ?? []);
          setIsLoading(false);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load campaigns for current role
  useEffect(() => {
    if (!userId) return;

    const loadCampaigns = async () => {
      setIsCampaignsLoading(true);
      try {
        const userCampaigns = await getUserCampaigns(userId, userRole);
        setCampaigns(userCampaigns);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        showActionError('Could not load vaults', error, () => loadCampaigns());
      } finally {
        setIsCampaignsLoading(false);
      }
    };

    void loadCampaigns();
  }, [userId, userRole]);

  // Subscribe to current campaign updates
  useEffect(() => {
    if (!currentCampaignId) return;

    const unsubscribeCampaign = subscribeToCampaign(currentCampaignId, (campaign) => {
      setCurrentCampaign(campaign);
    });

    const unsubscribeInventories = subscribeToPlayerInventories(currentCampaignId, (inventories) => {
      setPlayerInventories(inventories);
      // Auto-select first player if none selected
      if (inventories.length > 0 && !selectedPlayerId) {
        setSelectedPlayerId(inventories[0].playerId);
      }
    });

    return () => {
      unsubscribeCampaign();
      unsubscribeInventories();
    };
  }, [currentCampaignId]);

  // Subscribe to transfer requests for current user (only for players, not DM)
  useEffect(() => {
    if (!currentCampaignId || !userId || userRole === 'dm') {
      setPendingTransferRequests([]);
      return;
    }

    const unsubscribe = subscribeToTransferRequests(currentCampaignId, userId, (requests) => {
      setPendingTransferRequests(prevRequests => {
        // Check for newly expired transfers (as receiver) before setting state
        const currentRequestIds = prevRequests.map(r => r.id);
        const newRequestIds = requests.map(r => r.id);
        
        // If we had a request that's no longer pending and we haven't seen it before,
        // it might have expired while we were the intended receiver
        const missingRequests = prevRequests.filter(prevReq => 
          !newRequestIds.includes(prevReq.id) && 
          Date.now() > prevReq.expiresAt.toMillis()
        );
        
        // Show notification for expired transfers we were meant to receive
        if (missingRequests.length > 0) {
          const expiredReq = missingRequests[0]; // Show first expired request
          setExpiredTransferInfo({ 
            playerName: expiredReq.fromPlayerName, 
            itemName: expiredReq.itemName, 
            isReceiver: true 
          });
          setTimeout(() => setExpiredTransferInfo(null), 8000);
        }
        
        return requests;
      });
    });

    return () => unsubscribe();
  }, [currentCampaignId, userId, userRole]);

  // Subscribe to rejected/expired transfers (as sender) and auto-restore items
  useEffect(() => {
    if (!currentCampaignId || !userId || userRole === 'dm') return;

    const unsubscribe = subscribeToRejectedTransfers(currentCampaignId, userId, async (rejectedOrExpiredRequests) => {
      // Process each request to handle rejected vs expired differently
      for (const request of rejectedOrExpiredRequests) {
        try {
          await restoreRejectedTransfer(currentCampaignId, request.id, userId);
          
          // Show appropriate notification
          if (request.status === 'expired') {
            setExpiredTransferInfo({ 
              playerName: request.toPlayerName, 
              itemName: request.itemName, 
              isReceiver: false 
            });
            setTimeout(() => setExpiredTransferInfo(null), 8000);
          }
          // Note: rejected transfers don't show notification as they're user-initiated
        } catch (error) {
          console.error('Failed to restore rejected/expired transfer:', error);
          showActionError('Could not restore transfer', error, () =>
            restoreRejectedTransfer(currentCampaignId, request.id, userId)
          );
        }
      }
    });

    return () => unsubscribe();
  }, [currentCampaignId, userId, userRole]);

  // Subscribe to pending transfers from me (sender) to check for expired ones
  // This ensures expiration works even if recipient is offline
  useEffect(() => {
    if (!currentCampaignId || !userId || userRole === 'dm') return;

    const unsubscribe = subscribeToPendingTransfersFromMe(currentCampaignId, userId, () => {
      // The callback doesn't need to do anything - the subscription itself
      // handles marking expired requests (which then triggers the rejected/expired subscription)
    });

    return () => unsubscribe();
  }, [currentCampaignId, userId, userRole]);

  // Periodically check for expired transfers (since Firestore subscriptions don't trigger on time)
  useEffect(() => {
    if (!currentCampaignId || !userId || userRole === 'dm') return;

    const runExpirationCheck = async () => {
      try {
        await checkAndExpirePendingTransfers(currentCampaignId, userId);
      } catch (error) {
        console.error('Failed to expire pending transfers:', error);
        showActionError('Could not sync pending transfers', error, () => runExpirationCheck());
      }
    };

    // Check immediately on mount
    void runExpirationCheck();

    // Then check every 2 seconds
    const interval = setInterval(() => {
      void runExpirationCheck();
    }, 2000);

    return () => clearInterval(interval);
  }, [currentCampaignId, userId, userRole]);

  // DM cleanup: remove stale inventory docs for users no longer in campaign.playerIds.
  useEffect(() => {
    if (!currentCampaignId || userRole !== 'dm' || !currentCampaign) return;

    const staleInventories = playerInventories.filter(
      (inventoryDoc) => !currentCampaign.playerIds.includes(inventoryDoc.playerId)
    );

    if (staleInventories.length === 0) return;

    staleInventories.forEach((inventoryDoc) => {
      void trackWrite(() => deletePlayerInventoryDoc(currentCampaignId, inventoryDoc.playerId)).catch((error) => {
        console.error('Failed to clean stale player inventory:', error);
      });
    });
  }, [currentCampaignId, currentCampaign, playerInventories, userRole, trackWrite]);

  // Handle role switch from vault page tabs
  const handleRoleSwitch = async (nextRole: 'dm' | 'player') => {
    if (!userId || nextRole === userRole) return;

    try {
      await trackWrite(() => updateUserRole(userId, nextRole));
      setUserRole(nextRole);
      setCampaigns([]);
      setCurrentCampaignId(null);
      setCurrentCampaign(null);
      setPlayerInventories([]);
      setSelectedPlayerId('shared');
      router.push('/vaults', { scroll: false });
    } catch (error) {
      console.error('Failed to update role:', error);
      showActionError('Could not switch role', error, () => handleRoleSwitch(nextRole));
    }
  };

  // Campaign CRUD
  const handleSelectCampaign = (campaignId: string) => {
    setCurrentCampaignId(campaignId);
    setSelectedPlayerId(userRole === 'player' && userId ? userId : 'shared');
    // Update URL with campaign ID for persistence and browser history
    router.push(`/vaults?c=${campaignId}`, { scroll: false });
  };

  const handleCreateCampaign = async (info: { name: string; description: string; password: string }) => {
    if (!userId) return;
    
    try {
      const campaignId = await trackWrite(() => createCampaign(userId, userName, info.name, info.description, info.password));
      const newCampaign = await getCampaign(campaignId);
      if (newCampaign) {
        setCampaigns([...campaigns, newCampaign]);
        // Show campaign ID modal
        setNewCampaignId(campaignId);
        setNewCampaignName(info.name);
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      showActionError('Could not create vault', error, () => handleCreateCampaign(info));
    }
  };

  const handleJoinCampaign = async (campaignId: string, password: string, characterName: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      await trackWrite(() => joinCampaign(campaignId, userId, characterName, password));
      const campaign = await getCampaign(campaignId);
      if (campaign) {
        setCampaigns([...campaigns, campaign]);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Failed to join campaign:', error);
      showActionError('Could not join vault', error, async () => { await handleJoinCampaign(campaignId, password, characterName); });
      return false;
    }
  };

  const handleUpdateMyCharacterName = async (newName: string): Promise<void> => {
    if (!currentCampaignId || !userId) {
      throw new Error('Campaign is not ready.');
    }

    await trackWrite(() => updatePlayerNameInCampaign(currentCampaignId, userId, newName));
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!userId) return;
    try {
      await trackWrite(() => deleteCampaign(campaignId, userId));
      setCampaigns(campaigns.filter((c) => c.id !== campaignId));
      if (currentCampaignId === campaignId) {
        setCurrentCampaignId(null);
        setCurrentCampaign(null);
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      showActionError('Could not delete vault', error, () => handleDeleteCampaign(campaignId));
    }
  };

  const handleLeaveCampaign = async (campaignId: string) => {
    if (!userId) return;

    try {
      await trackWrite(() => leaveCampaign(campaignId, userId));
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== campaignId));

      if (currentCampaignId === campaignId) {
        setCurrentCampaignId(null);
        setCurrentCampaign(null);
        setPlayerInventories([]);
        setSelectedPlayerId('shared');
        router.push('/vaults', { scroll: false });
      }
    } catch (error) {
      console.error('Failed to leave campaign:', error);
      showActionError('Could not leave vault', error, () => handleLeaveCampaign(campaignId), 'Try leaving again');
    }
  };

  const handleUpdateCampaignSettings = async (updates: { name: string; password: string }) => {
    if (!currentCampaignId || !userId || !currentCampaign) return;

    try {
      await trackWrite(() => updateCampaignSettings(currentCampaignId, userId, updates));

      setCurrentCampaign({
        ...currentCampaign,
        name: updates.name,
        password: updates.password,
      });

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === currentCampaignId
            ? { ...campaign, name: updates.name, password: updates.password }
            : campaign
        )
      );
    } catch (error) {
      console.error('Failed to update vault settings:', error);
      showActionError('Could not update vault settings', error, () => handleUpdateCampaignSettings(updates));
      throw error;
    }
  };

  const handleBackToHome = () => {
    setCurrentCampaignId(null);
    setCurrentCampaign(null);
    setPlayerInventories([]);
    setSelectedPlayerId('shared');
    // Clear campaign ID from URL
    router.push('/vaults', { scroll: false });
  };

  // Listen for "go back to vault list" event from Navigation
  useEffect(() => {
    const handler = () => handleBackToHome();
    window.addEventListener('vaults-go-home', handler);
    return () => window.removeEventListener('vaults-go-home', handler);
  });

  // Sync state with URL changes (handles page load, refresh, browser back/forward)
  useEffect(() => {
    if (campaigns.length === 0) return; // Wait for campaigns to load
    
    const campaignIdFromUrl = requestedCampaignId;
    
    if (!campaignIdFromUrl && currentCampaignId) {
      // URL has no campaign but state does - user navigated back
      setCurrentCampaignId(null);
      setCurrentCampaign(null);
      setPlayerInventories([]);
      setSelectedPlayerId('shared');
    } else if (campaignIdFromUrl && campaignIdFromUrl !== currentCampaignId) {
      // URL has campaign - either page load/refresh or navigation
      const campaignExists = campaigns.some(c => c.id === campaignIdFromUrl);
      if (campaignExists) {
        setCurrentCampaignId(campaignIdFromUrl);
        setSelectedPlayerId(userRole === 'player' && userId ? userId : 'shared');
      } else {
        // Campaign not found, clear invalid URL param
        router.replace('/vaults', { scroll: false });
      }
    }
  }, [requestedCampaignId, campaigns, currentCampaignId, router, userRole, userId]);

  // Item movement with Firebase
  const handleMoveItem = async (itemIds: string[], fromId: string | 'shared', toId: string | 'shared') => {
    if (!currentCampaignId) return;
    if (itemIds.length === 0) return;

    // Check if this is a player-to-player transfer (not DM, not involving shared loot)
    const isDM = userRole === 'dm';
    const isPlayerToPlayer = !isDM && fromId !== 'shared' && toId !== 'shared' && fromId === userId && toId !== userId;

    if (isPlayerToPlayer) {
      // Create a transfer request instead of moving directly
      try {
        // Get the item details from the source inventory
        const sourceInventory = playerInventories.find((inv) => inv.playerId === fromId);
        if (!sourceInventory) {
          console.error('Source inventory not found');
          return;
        }

        // Get the recipient player name
        const recipientInventory = playerInventories.find((inv) => inv.playerId === toId);
        const recipientName = recipientInventory?.playerName || 'Unknown Player';
        const senderName = sourceInventory?.playerName || userName;

        const requestIds: string[] = [];
        const movedNames: string[] = [];
        for (const itemId of itemIds) {
          const item = sourceInventory.inventory.find((inventoryItem) => inventoryItem.id === itemId);
          if (!item) continue;

          const requestId = await trackWrite(() => createTransferRequest(
            currentCampaignId,
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

        // Show toast notification with expiration time
        const expiresAt = new Date(Date.now() + 10 * 1000); // 10 seconds from now
        setTransferSentInfo({ requestIds, playerName: recipientName, itemLabel, expiresAt });
        // Auto-dismiss after expiration + extra time for mobile interaction
        setTimeout(() => setTransferSentInfo(null), 13000);
      } catch (error) {
        console.error('Failed to create transfer request:', error);
        showActionError('Could not send transfer request', error, () => handleMoveItem(itemIds, fromId, toId));
      }
    } else {
      // Direct move (DM, or to/from shared loot, or to own inventory)
      try {
        for (const itemId of itemIds) {
          await trackWrite(() => moveItemBetweenInventories(
            currentCampaignId,
            itemId,
            fromId,
            toId,
            userId,
            isDM
          ));
        }
      } catch (error) {
        console.error('Failed to move item:', error);
        showActionError('Could not move item', error, () => handleMoveItem(itemIds, fromId, toId));
      }
    }
  };

  // Handle accepting a transfer request
  const handleAcceptTransfer = async (request: TransferRequest) => {
    if (!currentCampaignId || !userId) return;
    try {
      await trackWrite(() => acceptTransferRequest(currentCampaignId, request.id, userId));
    } catch (error) {
      console.error('Failed to accept transfer:', error);
      showActionError('Could not accept transfer', error, () => handleAcceptTransfer(request));
      throw error;
    }
  };

  // Handle rejecting a transfer request
  const handleRejectTransfer = async (request: TransferRequest) => {
    if (!currentCampaignId) return;
    try {
      await trackWrite(() => rejectTransferRequest(currentCampaignId, request.id));
    } catch (error) {
      console.error('Failed to reject transfer:', error);
      showActionError('Could not reject transfer', error, () => handleRejectTransfer(request));
      throw error;
    }
  };

  const handleCancelSentTransfer = async (requestIds: string[]) => {
    if (!currentCampaignId || !userId) return;
    try {
      for (const requestId of requestIds) {
        await trackWrite(() => cancelTransferRequest(currentCampaignId, requestId, userId));
      }
    } catch (error) {
      console.error('Failed to cancel transfer:', error);
      showActionError('Could not cancel transfer', error, () => handleCancelSentTransfer(requestIds), 'Try cancelling again');
      throw error;
    }
  };

  // Currency change
  const handleCurrencyChange = async (playerId: string, currency: Currency) => {
    if (!currentCampaignId) return;

    try {
      const playerInv = playerInventories.find((p) => p.playerId === playerId);
      if (playerInv) {
        await trackWrite(() => updatePlayerInventory(currentCampaignId, playerId, playerInv.inventory, currency));
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
      showActionError('Could not update currency', error, () => handleCurrencyChange(playerId, currency));
    }
  };

  const handleSharedCoinTransfer = async (amounts: Currency) => {
    if (!currentCampaignId || !currentCampaign) return;
    const myInv = playerInventories.find((p) => p.playerId === userId);
    if (!myInv) return;

    const shared = currentCampaign.sharedCurrency ?? { pp: 0, gp: 0, sp: 0, cp: 0 };

    // Clamp each coin: deposits limited by player's wallet, withdrawals limited by shared loot
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
        trackWrite(() => updateSharedCurrency(currentCampaignId, newShared)),
        trackWrite(() => updatePlayerInventory(currentCampaignId, userId, myInv.inventory, newPlayerCurrency)),
      ]);
    } catch (error) {
      console.error('Failed to transfer coins:', error);
      showActionError('Could not transfer coins', error, () => handleSharedCoinTransfer(amounts));
    }
  };

  // Max weight change
  const handleMaxWeightChange = async (playerId: string, newMax: number) => {
    if (!currentCampaignId) return;

    try {
      const playerInv = playerInventories.find((p) => p.playerId === playerId);
      if (playerInv) {
        await trackWrite(() => updatePlayerInventory(currentCampaignId, playerId, playerInv.inventory, playerInv.currency, newMax));
      }
    } catch (error) {
      console.error('Failed to update max weight:', error);
      showActionError('Could not update carry limit', error, () => handleMaxWeightChange(playerId, newMax));
    }
  };

  const handleAddItem = async (item: Omit<Item, 'id'>) => {
    if (!currentCampaignId || !currentCampaign) return;

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
        await trackWrite(() => updateSharedLoot(currentCampaignId, updatedShared));
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
        await trackWrite(() => updatePlayerInventory(currentCampaignId, selectedPlayerId as string, updatedInventory, selectedPlayer.currency));
      }

      setShowAddItemModal(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      showActionError('Could not add item', error, () => handleAddItem(item));
    }
  };

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
    if (!currentCampaignId || !currentCampaign || !userId) return;

    try {
      await trackWrite(() => updateCampaignCustomItemPool(currentCampaignId, userId, items));
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
      setCampaigns((prev) => prev.map((campaign) => ({
        ...campaign,
        customItemPool: (campaign.customItemPool ?? []).map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      })));
      setCurrentCampaign((prev) => prev
        ? {
            ...prev,
            customItemPool: (prev.customItemPool ?? []).map((item) => (item.id === updatedItem.id ? updatedItem : item)),
          }
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
      setCampaigns((prev) => prev.map((campaign) => ({
        ...campaign,
        customItemPool: (campaign.customItemPool ?? []).filter((item) => item.id !== itemId),
      })));
      setCurrentCampaign((prev) => prev
        ? {
            ...prev,
            customItemPool: (prev.customItemPool ?? []).filter((item) => item.id !== itemId),
          }
        : prev);
    } catch (error) {
      console.error('Failed to delete homebrew item:', error);
      showActionError('Could not delete homebrew item', error, () => handleDeleteHomebrewItem(itemId));
    }
  };

  const handleUpdateSelectedItem = async (baseItem: Item, updates: Partial<Item>) => {
    if (!currentCampaignId || !currentCampaign) return;

    const isPlayerCustomItem = (baseItem.sourcebook || '').trim().toUpperCase() === 'PLAYER CUSTOM';
    if (!isDM && !isPlayerCustomItem) {
      return;
    }

    const sanitizedUpdates = !isDM
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
          await trackWrite(() => updateSharedLoot(currentCampaignId, updatedShared));
          setSelectedItem(updatedItem);
        }
      } else {
        const player = playerInventories.find((p) => p.playerId === selectedPlayerId);
        if (player) {
          const itemIndex = player.inventory.findIndex((i) => i.id === baseItem.id);
          if (itemIndex >= 0) {
            const updatedInventory = [...player.inventory];
            updatedInventory[itemIndex] = updatedItem;
            await trackWrite(() => updatePlayerInventory(currentCampaignId, selectedPlayerId, updatedInventory, player.currency, player.maxWeight));
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
    if (!currentCampaignId || !currentCampaign) return;

    try {
      if (selectedPlayerId === 'shared') {
        const sharedIndex = currentCampaign.sharedLoot.findIndex((i) => i.id === baseItem.id);
        if (sharedIndex < 0) {
          setSelectedItem(null);
          return;
        }
        const updatedShared = [...currentCampaign.sharedLoot];
        if (updatedShared[sharedIndex].quantity > 1) {
          updatedShared[sharedIndex] = { ...updatedShared[sharedIndex], quantity: updatedShared[sharedIndex].quantity - 1 };
        } else {
          updatedShared.splice(sharedIndex, 1);
        }
        await trackWrite(() => updateSharedLoot(currentCampaignId, updatedShared));
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
        const updatedInventory = [...player.inventory];
        if (updatedInventory[itemIndex].quantity > 1) {
          updatedInventory[itemIndex] = { ...updatedInventory[itemIndex], quantity: updatedInventory[itemIndex].quantity - 1 };
        } else {
          updatedInventory.splice(itemIndex, 1);
        }
        await trackWrite(() => updatePlayerInventory(currentCampaignId, selectedPlayerId, updatedInventory, player.currency, player.maxWeight));
      }

      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      showActionError('Could not delete item', error, () => handleDeleteSelectedItem(baseItem));
    }
  };

  const activePlayerInventories = currentCampaign
    ? playerInventories.filter((inventoryDoc) => currentCampaign.playerIds.includes(inventoryDoc.playerId))
    : playerInventories;

  // Convert PlayerInventoryDoc to Player for UI components
  const players: Player[] = activePlayerInventories.map((inv) => ({
    id: inv.playerId,
    name: inv.playerName,
    color: inv.color,
    avatar: inv.avatar,
    maxWeight: inv.maxWeight,
    inventory: inv.inventory,
    currency: inv.currency,
  }));

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const isShared = selectedPlayerId === 'shared';
  const isDM = userRole === 'dm';
  const canPlayerEditSelectedItem = !isDM && !!selectedItem && (selectedItem.sourcebook || '').trim().toUpperCase() === 'PLAYER CUSTOM';
  const vaultCustomItems = currentCampaign?.customItemPool ?? [];
  const syncStatus: 'saving' | 'saved' = pendingWriteCount > 0 ? 'saving' : 'saved';
  const userRoleRef = useRef(userRole);
  const userIdRef = useRef(userId);

  userRoleRef.current = userRole;
  userIdRef.current = userId;

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
  const isRestoringCampaign = Boolean(
    requestedCampaignId &&
    !currentCampaignId &&
    (isCampaignsLoading || campaigns.some((campaign) => campaign.id === requestedCampaignId))
  );

  // Convert campaigns to vault format for HomePage component
  const vaults = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    playerCount: c.playerIds.length,
    password: c.password || '',
    lastAccessed: c.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    createdAt: c.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
  }));

  // Keep a single loading screen while auth or campaign restoration is in progress.
  if (isLoading || isCampaignsLoading || isRestoringCampaign) {
    // Show vault detail skeleton if we have a campaign ID in URL, are restoring a campaign, 
    // or already have a current campaign (to prevent flicker on refresh)
    if (requestedCampaignId || isRestoringCampaign || currentCampaignId) {
      return <VaultDetailSkeleton />;
    }
    // Otherwise show vault list skeleton
    return <VaultListSkeleton />;
  }

  if (!isAuthenticated) return null;

  if (!currentCampaignId) {
    const tabBaseClass = 'flex-1 text-sm py-3 font-bold border-0 shadow-none transition-colors duration-200 rounded-b-lg first:rounded-bl-xl last:rounded-br-xl';
    const tabActiveClass = 'bg-linear-to-r from-[#5C1A1A] to-[#7A2424] text-white';
    const tabInactiveClass = 'bg-[#E8D5B7] text-[#5C4A2F] hover:bg-[#F5EFE0]/70 hover:text-[#3D1409]';

    return (
      <>
        <HomePage
          vaults={vaults}
          userType={userRole === 'dm' ? 'dm' : 'player'}
          onSelectVault={handleSelectCampaign}
          onCreateVault={handleCreateCampaign}
          onJoinVault={handleJoinCampaign}
          onDeleteVault={handleDeleteCampaign}
          onLeaveVault={handleLeaveCampaign}
          topContent={(
            <div className="px-6 pt-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex w-full border-b-3 border-[#8B6F47]/40 bg-[#E8D5B7] overflow-hidden rounded-xl">
                  <button
                    onClick={() => void handleRoleSwitch('player')}
                    className={
                      tabBaseClass + ' ' + (userRole === 'player' ? tabActiveClass : tabInactiveClass)
                    }
                  >
                    Player
                  </button>
                  <button
                    onClick={() => void handleRoleSwitch('dm')}
                    className={
                      tabBaseClass + ' ' + (userRole === 'dm' ? tabActiveClass : tabInactiveClass)
                    }
                  >
                    GM
                  </button>
                </div>
              </div>
            </div>
          )}
        />
        {actionError && (
          <ActionErrorToast
            title={actionError.title}
            description={actionError.description}
            onDismiss={() => setActionError(null)}
            onRetry={actionError.onRetry ? () => void handleRetryAction() : undefined}
            retryLabel={actionError.retryLabel}
            retrying={isRetryingAction}
          />
        )}
      </>
    );
  }

  return (
    <DndProvider options={HTML5toTouch}>
      <TouchDragPreview />
      <div className="h-full bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-x-hidden">
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
            campaignId={currentCampaignId ?? undefined}
            campaignPassword={currentCampaign?.password || ''}
            isDM={isDM}
            totalSlots={currentCampaign?.playerIds.length || players.length}
            onUpdateCampaignSettings={isDM ? handleUpdateCampaignSettings : undefined}
            currentUserId={userId}
            onUpdateMyCharacterName={!isDM ? handleUpdateMyCharacterName : undefined}
          />
          <div className="flex-1 min-w-0 min-h-0">
            <InventoryView
              inventory={isShared
                ? (currentCampaign?.sharedLoot ?? [])
                : (() => {
                    const inv = selectedPlayer?.inventory ?? [];
                    const isOwnerViewing = isDM || selectedPlayerId === userId;
                    return isOwnerViewing ? inv : inv.filter((i) => !i.hiddenFromOthers);
                  })()
              }
              owner={
                isShared
                  ? { name: 'Shared Loot', id: 'shared' }
                  : selectedPlayer ? { name: selectedPlayer.name, id: selectedPlayer.id } : null
              }
              ownerId={selectedPlayerId}
              isDM={isDM}
              onAddItem={() => setShowAddItemModal(true)}
              onItemClick={setSelectedItem}
              onMoveItem={handleMoveItem}
              maxWeight={isShared ? undefined : selectedPlayer?.maxWeight}
              onMaxWeightChange={isShared ? undefined : (newMax: number) => handleMaxWeightChange(selectedPlayerId, newMax)}
              currency={isShared ? (currentCampaign?.sharedCurrency ?? { pp: 0, gp: 0, sp: 0, cp: 0 }) : selectedPlayer?.currency}
              onCurrencyChange={isShared ? undefined : (c: Currency) => handleCurrencyChange(selectedPlayerId, c)}
              onCoinTransfer={isShared && !isDM ? handleSharedCoinTransfer : undefined}
              isShared={isShared}
              syncStatus={syncStatus}
            />
          </div>
        </div>

        {showAddItemModal && (
          <AddItemModal
            onClose={() => setShowAddItemModal(false)}
            targetName={isShared ? 'Shared Loot' : (selectedPlayer?.name ?? 'Unknown')}
            isDM={isDM}
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
            onUpdate={isDM || canPlayerEditSelectedItem || (!isShared && selectedPlayerId === userId)
              ? (updates: Partial<Item>) => handleUpdateSelectedItem(selectedItem, updates)
              : undefined}
            onDelete={() => handleDeleteSelectedItem(selectedItem)}
            canEdit={isDM || canPlayerEditSelectedItem}
            canToggleHidden={!isShared && (isDM || selectedPlayerId === userId)}
          />
        )}

        {/* Campaign ID Modal */}
        {newCampaignId && (
          <CampaignIdModal
            campaignId={newCampaignId}
            campaignName={newCampaignName}
            onClose={() => {
              setNewCampaignId(null);
              setNewCampaignName('');
            }}
          />
        )}

        {actionError && (
          <ActionErrorToast
            title={actionError.title}
            description={actionError.description}
            onDismiss={() => setActionError(null)}
            onRetry={actionError.onRetry ? () => void handleRetryAction() : undefined}
            retryLabel={actionError.retryLabel}
            retrying={isRetryingAction}
          />
        )}

        {/* Transfer Request Modal - show the first pending request */}
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
      </div>
    </DndProvider>
  );
}
