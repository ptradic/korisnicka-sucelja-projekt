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
import type { Item, Player, VaultData } from '@/app/types';

const STORAGE_KEY = 'trailblazers-vault-data';
const VAULTS_KEY = 'trailblazers-vaults';

interface Vault {
  id: string;
  name: string;
  description: string;
  playerCount: number;
  password: string;
  lastAccessed: string;
  createdAt: string;
  data: VaultData;
}

// Sample initial data
const INITIAL_DATA: VaultData = {
  isDM: true,
  players: [
    {
      id: 'player-1',
      name: 'Thordak',
      color: 'bg-red-600',
      avatar: '⚔️',
      maxWeight: 150,
      inventory: [
        {
          id: 'item-1',
          name: 'Flaming Longsword',
          description: 'A masterwork longsword wreathed in harmless flames.',
          category: 'weapon',
          rarity: 'rare',
          quantity: 1,
          weight: 3,
          value: 5000,
          attunement: true,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ],
  sharedLoot: [],
};

export default function VaultsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string>('player');
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [currentVaultId, setCurrentVaultId] = useState<string | null>(null);
  const [vaultData, setVaultData] = useState<VaultData>(INITIAL_DATA);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | 'shared'>('shared');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | 'shared' | null>(null);

  // Check authentication
  useEffect(() => {
    const auth = localStorage.getItem('trailblazers-auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed.isLoggedIn) {
        setIsAuthenticated(true);
        setUserType(parsed.userType || 'player');
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem(VAULTS_KEY);
    if (saved) {
      const parsedVaults = JSON.parse(saved);
      setVaults(parsedVaults);
    }
  }, []);

  useEffect(() => {
    if (vaults.length > 0) {
      localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
    }
  }, [vaults]);

  const handleSelectVault = (vaultId: string) => {
    const vault = vaults.find((v: Vault) => v.id === vaultId);
    if (vault) {
      setCurrentVaultId(vaultId);
      setVaultData(vault.data);
      setVaults(vaults.map((v: Vault) => 
        v.id === vaultId ? { ...v, lastAccessed: new Date().toISOString() } : v
      ));
    }
  };

  const handleCreateVault = (vaultInfo: { name: string; description: string; playerCount: number; password: string }) => {
    const newVault: Vault = {
      ...vaultInfo,
      id: `vault-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      data: INITIAL_DATA,
    };
    setVaults([...vaults, newVault]);
  };

  const handleJoinVault = (vaultName: string, password: string): boolean => {
    // Search all vaults in localStorage (could be from other users)
    const allVaults = localStorage.getItem(VAULTS_KEY);
    if (allVaults) {
      const parsed: Vault[] = JSON.parse(allVaults);
      const found = parsed.find((v: Vault) => v.name.toLowerCase() === vaultName.toLowerCase() && v.password === password);
      if (found) {
        // Check if already joined
        const alreadyJoined = vaults.some((v: Vault) => v.id === found.id);
        if (!alreadyJoined) {
          setVaults([...vaults, { ...found, lastAccessed: new Date().toISOString() }]);
        }
        return true;
      }
    }
    return false;
  };

  const handleDeleteVault = (vaultId: string) => {
    setVaults(vaults.filter((v: Vault) => v.id !== vaultId));
    if (currentVaultId === vaultId) {
      setCurrentVaultId(null);
    }
  };

  const handleBackToHome = () => {
    if (currentVaultId) {
      const vault = vaults.find((v: Vault) => v.id === currentVaultId);
      if (vault) {
        setVaults(vaults.map((v: Vault) =>
          v.id === currentVaultId ? { ...v, data: vaultData } : v
        ));
      }
    }
    setCurrentVaultId(null);
    setSelectedPlayerId('shared');
  };
  const handleMoveItem = (itemId: string, fromId: string | 'shared', toId: string | 'shared') => {
    let item: Item | undefined;
    const updatedPlayers = vaultData.players.map((p: Player) => {
      if (p.id === fromId) {
        const itemIndex = p.inventory.findIndex((i: Item) => i.id === itemId);
        if (itemIndex !== -1) {
          item = p.inventory[itemIndex];
          return { ...p, inventory: p.inventory.filter((i: Item) => i.id !== itemId) };
        }
      }
      return p;
    });

    let updatedSharedLoot = [...vaultData.sharedLoot];
    if (fromId === 'shared') {
      const itemIndex = updatedSharedLoot.findIndex((i: Item) => i.id === itemId);
      if (itemIndex !== -1) {
        item = updatedSharedLoot[itemIndex];
        updatedSharedLoot = updatedSharedLoot.filter((i: Item) => i.id !== itemId);
      }
    }

    if (!item) return;

    const finalPlayers = updatedPlayers.map((p: Player) => {
      if (p.id === toId) {
        return { ...p, inventory: [...p.inventory, item!] };
      }
      return p;
    });

    if (toId === 'shared') {
      updatedSharedLoot = [...updatedSharedLoot, item];
    }

    setVaultData({ ...vaultData, players: finalPlayers, sharedLoot: updatedSharedLoot });
  };

  // Show nothing while checking auth (will redirect if not logged in)
  if (!isAuthenticated) {
    return null;
  }

  if (!currentVaultId) {
    return (
      <HomePage
        vaults={vaults}
        userType={userType}
        onSelectVault={handleSelectVault}
        onCreateVault={handleCreateVault}
        onJoinVault={handleJoinVault}
        onDeleteVault={handleDeleteVault}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] pt-20 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:h-[calc(100vh-5rem)] sm:overflow-hidden">
          <PlayerSidebar
            players={vaultData.players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            onMoveItem={handleMoveItem}
            dragOverPlayerId={dragOverPlayerId}
            onDragOverChange={setDragOverPlayerId}
            sharedLootCount={vaultData.sharedLoot.length}
          />
          <div className="flex-1 min-w-0">
            <InventoryView
              inventory={
                selectedPlayerId === 'shared'
                  ? vaultData.sharedLoot
                  : vaultData.players.find((p: Player) => p.id === selectedPlayerId)?.inventory || []
              }
              owner={
                selectedPlayerId === 'shared'
                  ? { name: 'Shared Loot', id: 'shared' }
                  : vaultData.players.find((p: Player) => p.id === selectedPlayerId) || null
              }
              ownerId={selectedPlayerId}
              isDM={vaultData.isDM}
              onAddItem={() => setShowAddItemModal(true)}
              onItemClick={setSelectedItem}
              onMoveItem={handleMoveItem}
              maxWeight={
                selectedPlayerId !== 'shared'
                  ? vaultData.players.find((p: Player) => p.id === selectedPlayerId)?.maxWeight
                  : undefined
              }
            />
          </div>
        </div>

        {showAddItemModal && (
          <AddItemModal
            onClose={() => setShowAddItemModal(false)}
            targetName={
              selectedPlayerId === 'shared'
                ? 'Shared Loot'
                : vaultData.players.find((p: Player) => p.id === selectedPlayerId)?.name || 'Unknown'
            }
            onAdd={(item: Omit<Item, 'id'>) => {
              const newItem: Item = { ...item, id: `item-${Date.now()}` };
              if (selectedPlayerId === 'shared') {
                setVaultData({
                  ...vaultData,
                  sharedLoot: [...vaultData.sharedLoot, newItem],
                });
              } else {
                setVaultData({
                  ...vaultData,
                  players: vaultData.players.map((p: Player) =>
                    p.id === selectedPlayerId
                      ? { ...p, inventory: [...p.inventory, newItem] }
                      : p
                  ),
                });
              }
              setShowAddItemModal(false);
            }}
          />
        )}

        {selectedItem && (
          <ItemDetailsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={(updates: Partial<Item>) => {
              const updatedItem = { ...selectedItem, ...updates };
              setVaultData({
                ...vaultData,
                players: vaultData.players.map((p: Player) => ({
                  ...p,
                  inventory: p.inventory.map((i: Item) =>
                    i.id === selectedItem.id ? updatedItem : i
                  ),
                })),
                sharedLoot: vaultData.sharedLoot.map((i: Item) =>
                  i.id === selectedItem.id ? updatedItem : i
                ),
              });
              setSelectedItem(null);
            }}
            onDelete={() => {
              setVaultData({
                ...vaultData,
                players: vaultData.players.map((p: Player) => ({
                  ...p,
                  inventory: p.inventory.filter((i: Item) => i.id !== selectedItem.id),
                })),
                sharedLoot: vaultData.sharedLoot.filter((i: Item) => i.id !== selectedItem.id),
              });
              setSelectedItem(null);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
}
