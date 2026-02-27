"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { DndProvider } from 'react-dnd';
// @ts-ignore
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HomePage } from '@/app/components/HomePage';
import { PlayerSidebar } from '@/app/components/PlayerSidebar';
import { InventoryView } from '@/app/components/InventoryView';
import { AddItemModal } from '@/app/components/AddItemModal';
import { ItemDetailsModal } from '@/app/components/ItemDetailsModal';
import { CampaignIdModal } from '@/app/components/CampaignIdModal';
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
  updateSharedLoot,
  subscribeToCampaign,
  subscribeToPlayerInventories,
  generateCampaignId,
} from '@/src/firebaseService';
import type { CampaignDoc, PlayerInventoryDoc } from '@/src/firebaseService';

//  Template items (for adding new items) 
const TEMPLATE_ITEMS: Item[] = [
  {
    id: 'tpl-1',
    name: 'Flaming Longsword',
    description: 'A masterwork longsword wreathed in magical fire. Deals an extra 1d6 fire damage on hit.',
    category: 'weapon',
    rarity: 'rare',
    quantity: 1,
    weight: 3,
    value: 5000,
    attunement: true,
  },
  {
    id: 'tpl-2',
    name: 'Shield of Faith',
    description: 'A heavy steel shield blessed by a cleric. Grants +2 AC.',
    category: 'armor',
    rarity: 'uncommon',
    quantity: 1,
    weight: 6,
    value: 1200,
    attunement: false,
  },
  {
    id: 'tpl-3',
    name: 'Potion of Healing',
    description: 'A vial of red liquid that restores 2d4+2 hit points when consumed.',
    category: 'potion',
    rarity: 'common',
    quantity: 1,
    weight: 0.5,
    value: 50,
    attunement: false,
  },
  {
    id: 'tpl-4',
    name: 'Wand of Magic Missiles',
    description: 'Has 7 charges. Expend 1 charge to cast Magic Missile at 1st level.',
    category: 'magic',
    rarity: 'uncommon',
    quantity: 1,
    weight: 1,
    value: 8000,
    attunement: true,
  },
  {
    id: 'tpl-5',
    name: 'Bag of Holding',
    description: 'This bag has an interior space considerably larger than its outside dimensions.',
    category: 'magic',
    rarity: 'uncommon',
    quantity: 1,
    weight: 15,
    value: 4000,
    attunement: false,
  },
  {
    id: 'tpl-6',
    name: 'Golden Crown',
    description: 'An ornate crown studded with rubies, taken from a forgotten king.',
    category: 'treasure',
    rarity: 'legendary',
    quantity: 1,
    weight: 2,
    value: 25000,
    attunement: false,
  },
  {
    id: 'tpl-7',
    name: 'Rope of Climbing',
    description: '60 feet of silk rope that obeys your commands.',
    category: 'misc',
    rarity: 'uncommon',
    quantity: 1,
    weight: 3,
    value: 2000,
    attunement: false,
  },
  {
    id: 'tpl-8',
    name: 'Staff of the Archmage',
    description: 'A powerful staff granting +2 to spell attack rolls and spell save DC.',
    category: 'magic',
    rarity: 'legendary',
    quantity: 1,
    weight: 4,
    value: 60000,
    attunement: true,
  },
];

export default function VaultsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'dm' | 'player'>('player');
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
  const [showError, setShowError] = useState(false);

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
          
          // Update localStorage for compatibility
          localStorage.setItem('trailblazers-auth', JSON.stringify({
            isLoggedIn: true,
            uid: firebaseUser.uid,
            userType: userDoc.role === 'dm' ? 'gm' : 'player',
            name: userDoc.name,
            email: userDoc.email,
            loginTime: new Date().toISOString(),
          }));
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
      const userCampaigns = await getUserCampaigns(userId, userRole);
      setCampaigns(userCampaigns);
    };

    loadCampaigns();
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

  // Handle role toggle
  const handleRoleToggle = async () => {
    if (!userId) return;
    const newRole = userRole === 'dm' ? 'player' : 'dm';
    await updateUserRole(userId, newRole);
    setUserRole(newRole);
    setCampaigns([]);
    setCurrentCampaignId(null);
    setCurrentCampaign(null);
    setPlayerInventories([]);
    
    // Update localStorage
    const auth = localStorage.getItem('trailblazers-auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      parsed.userType = newRole;
      localStorage.setItem('trailblazers-auth', JSON.stringify(parsed));
    }
  };

  // Campaign CRUD
  const handleSelectCampaign = (campaignId: string) => {
    setCurrentCampaignId(campaignId);
  };

  const handleCreateCampaign = async (info: { name: string; description: string; playerCount: number; password: string }) => {
    if (!userId) return;
    
    try {
      const campaignId = await createCampaign(userId, userName, info.name, info.description, info.password);
      const newCampaign = await getCampaign(campaignId);
      if (newCampaign) {
        setCampaigns([...campaigns, newCampaign]);
        // Show campaign ID modal
        setNewCampaignId(campaignId);
        setNewCampaignName(info.name);
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const handleJoinCampaign = async (campaignId: string, password: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      await joinCampaign(campaignId, userId, userName, password);
      const campaign = await getCampaign(campaignId);
      if (campaign) {
        setCampaigns([...campaigns, campaign]);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Failed to join campaign:', error);
      alert(error.message || 'Failed to join campaign. Please try again.');
      return false;
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    // For now, just remove from local state
    // TODO: Implement actual deletion in Firebase
    setCampaigns(campaigns.filter((c) => c.id !== campaignId));
    if (currentCampaignId === campaignId) {
      setCurrentCampaignId(null);
      setCurrentCampaign(null);
    }
  };

  const handleBackToHome = () => {
    setCurrentCampaignId(null);
    setCurrentCampaign(null);
    setPlayerInventories([]);
    setSelectedPlayerId('shared');
  };

  // Listen for "go back to vault list" event from Navigation
  useEffect(() => {
    const handler = () => handleBackToHome();
    window.addEventListener('vaults-go-home', handler);
    return () => window.removeEventListener('vaults-go-home', handler);
  });

  // Item movement with Firebase
  const handleMoveItem = async (itemId: string, fromId: string | 'shared', toId: string | 'shared') => {
    if (!currentCampaignId) return;

    try {
      await moveItemBetweenInventories(
        currentCampaignId, 
        itemId, 
        fromId, 
        toId,
        userId,
        userRole === 'dm'
      );
    } catch (error) {
      console.error('Failed to move item:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  // Currency change
  const handleCurrencyChange = async (playerId: string, currency: Currency) => {
    if (!currentCampaignId) return;

    try {
      const playerInv = playerInventories.find((p) => p.playerId === playerId);
      if (playerInv) {
        await updatePlayerInventory(currentCampaignId, playerId, playerInv.inventory, currency);
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  // Max weight change
  const handleMaxWeightChange = async (playerId: string, newMax: number) => {
    if (!currentCampaignId) return;

    try {
      const playerInv = playerInventories.find((p) => p.playerId === playerId);
      if (playerInv) {
        await updatePlayerInventory(currentCampaignId, playerId, playerInv.inventory, playerInv.currency, newMax);
      }
    } catch (error) {
      console.error('Failed to update max weight:', error);
    }
  };

  // Convert PlayerInventoryDoc to Player for UI components
  const players: Player[] = playerInventories.map((inv) => ({
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

  if (!isAuthenticated) return null;

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

  if (!currentCampaignId) {
    return (
      <HomePage
        vaults={vaults}
        userType={userRole === 'dm' ? 'dm' : 'player'}
        onSelectVault={handleSelectCampaign}
        onCreateVault={handleCreateCampaign}
        onJoinVault={handleJoinCampaign}
        onDeleteVault={handleDeleteCampaign}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] pt-20 overflow-x-hidden">
        {/* Campaign ID Display for DMs */}
        {isDM && currentCampaign && (
          <div className="fixed top-20 right-4 z-30">
            <div className="bg-[#F5EFE0] border-3 border-[#8B6F47] rounded-xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#5C4A2F] max-sm:hidden">Campaign ID:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentCampaignId);
                    alert('Campaign ID copied to clipboard!');
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border-2 border-[#8B6F47] rounded-lg hover:bg-[#F0E8D5] transition-all group"
                  title="Click to copy"
                >
                  <span className="font-mono text-sm font-bold text-[#3D1409] tracking-wider">{currentCampaignId}</span>
                  <svg className="w-3.5 h-3.5 text-[#5C1A1A] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:h-[calc(100vh-5rem)] sm:overflow-hidden">
          <PlayerSidebar
            players={players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            onMoveItem={handleMoveItem}
            dragOverPlayerId={dragOverPlayerId}
            onDragOverChange={setDragOverPlayerId}
            sharedLootCount={currentCampaign?.sharedLoot.length || 0}
            campaignName={currentCampaign?.name ?? 'Campaign'}
            totalSlots={currentCampaign?.playerIds.length || players.length}
          />
          <div className="flex-1 min-w-0">
            <InventoryView
              inventory={isShared ? (currentCampaign?.sharedLoot ?? []) : (selectedPlayer?.inventory ?? [])}
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
              currency={isShared ? undefined : selectedPlayer?.currency}
              onCurrencyChange={isShared ? undefined : (c: Currency) => handleCurrencyChange(selectedPlayerId, c)}
              isShared={isShared}
            />
          </div>
        </div>

        {showAddItemModal && (
          <AddItemModal
            onClose={() => setShowAddItemModal(false)}
            targetName={isShared ? 'Shared Loot' : (selectedPlayer?.name ?? 'Unknown')}
            isDM={isDM}
            templateItems={TEMPLATE_ITEMS}
            onAdd={async (item: Omit<Item, 'id'>) => {
              if (!currentCampaignId || !currentCampaign) return;

              try {
                if (isShared) {
                  // Check if item already exists in shared loot
                  const existingIndex = currentCampaign.sharedLoot.findIndex(
                    (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity
                  );
                  
                  let updatedShared: Item[];
                  if (existingIndex >= 0) {
                    // Stack items by increasing quantity
                    updatedShared = [...currentCampaign.sharedLoot];
                    updatedShared[existingIndex].quantity += item.quantity;
                  } else {
                    // Add as new item
                    const newItem: Item = {
                      ...item,
                      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    };
                    updatedShared = [...currentCampaign.sharedLoot, newItem];
                  }
                  await updateSharedLoot(currentCampaignId, updatedShared);
                } else if (selectedPlayer) {
                  // Check if item already exists in player inventory
                  const existingIndex = selectedPlayer.inventory.findIndex(
                    (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity
                  );
                  
                  let updatedInventory: Item[];
                  if (existingIndex >= 0) {
                    // Stack items by increasing quantity
                    updatedInventory = [...selectedPlayer.inventory];
                    updatedInventory[existingIndex].quantity += item.quantity;
                  } else {
                    // Add as new item
                    const newItem: Item = {
                      ...item,
                      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    };
                    updatedInventory = [...selectedPlayer.inventory, newItem];
                  }
                  await updatePlayerInventory(currentCampaignId, selectedPlayerId as string, updatedInventory, selectedPlayer.currency);
                }
                setShowAddItemModal(false);
              } catch (error) {
                console.error('Failed to add item:', error);
                alert('Failed to add item. Please try again.');
              }
            }}
          />
        )}

        {selectedItem && (
          <ItemDetailsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={async (updates: Partial<Item>) => {
              if (!currentCampaignId || !currentCampaign) return;

              const updatedItem = { ...selectedItem, ...updates };

              try {
                // Update in shared loot
                const sharedIndex = currentCampaign.sharedLoot.findIndex((i) => i.id === selectedItem.id);
                if (sharedIndex >= 0) {
                  const updatedShared = [...currentCampaign.sharedLoot];
                  updatedShared[sharedIndex] = updatedItem;
                  await updateSharedLoot(currentCampaignId, updatedShared);
                  setSelectedItem(null);
                  return;
                }

                // Update in player inventory
                for (const player of players) {
                  const itemIndex = player.inventory.findIndex((i) => i.id === selectedItem.id);
                  if (itemIndex >= 0) {
                    const updatedInventory = [...player.inventory];
                    updatedInventory[itemIndex] = updatedItem;
                    await updatePlayerInventory(currentCampaignId, player.id, updatedInventory, player.currency);
                    setSelectedItem(null);
                    return;
                  }
                }
              } catch (error) {
                console.error('Failed to update item:', error);
                alert('Failed to update item. Please try again.');
              }
            }}
            onDelete={async () => {
              if (!currentCampaignId || !currentCampaign) return;

              try {
                // Remove from shared loot
                const sharedIndex = currentCampaign.sharedLoot.findIndex((i) => i.id === selectedItem.id);
                if (sharedIndex >= 0) {
                  const updatedShared = currentCampaign.sharedLoot.filter((i) => i.id !== selectedItem.id);
                  await updateSharedLoot(currentCampaignId, updatedShared);
                  setSelectedItem(null);
                  return;
                }

                // Remove from player inventory
                for (const player of players) {
                  const itemIndex = player.inventory.findIndex((i) => i.id === selectedItem.id);
                  if (itemIndex >= 0) {
                    const updatedInventory = player.inventory.filter((i) => i.id !== selectedItem.id);
                    await updatePlayerInventory(currentCampaignId, player.id, updatedInventory);
                    setSelectedItem(null);
                    return;
                  }
                }
              } catch (error) {
                console.error('Failed to delete item:', error);
                alert('Failed to delete item. Please try again.');
              }
            }}
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

        {/* Error Toast Notification */}
        {showError && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in duration-300">
            <div className="bg-[#8B3A3A] text-white px-6 py-3 rounded-lg shadow-lg border border-[#6B2020] flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">You aren't allowed to do that action</span>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
