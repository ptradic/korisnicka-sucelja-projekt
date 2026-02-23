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
import type { Item, Player, VaultData, Currency } from '@/app/types';

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

//  Template items (placeholder until database) 
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
    quantity: 3,
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

function buildInitialData(playerCount: number): VaultData {
  const names = ['Thordak', 'Elara', 'Grimjaw', 'Lyria', 'Kael', 'Selene', 'Drogar', 'Zephyr'];
  const colors = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600', 'bg-rose-600', 'bg-indigo-600'];
  const avatars = ['\u2694\uFE0F', '\u2728', '\uD83D\uDEE1\uFE0F', '\uD83C\uDFF9', '\uD83D\uDD25', '\uD83C\uDF19', '\uD83D\uDD28', '\uD83C\uDF0A'];
  const emptyCurrency: Currency = { pp: 0, gp: 0, sp: 0, cp: 0 };

  const players: Player[] = [];
  const usedTemplates: Item[] = [];
  for (let i = 0; i < Math.min(playerCount, names.length); i++) {
    // Give first player some template items, rest get empty
    const inv: Item[] = [];
    if (i === 0 && TEMPLATE_ITEMS.length > 0) {
      inv.push(
        { ...TEMPLATE_ITEMS[0], id: `item-${Date.now()}-${i}-0` },
        { ...TEMPLATE_ITEMS[2], id: `item-${Date.now()}-${i}-1` },
      );
    }
    players.push({
      id: `player-${i + 1}`,
      name: names[i],
      color: colors[i],
      avatar: avatars[i],
      maxWeight: 150,
      inventory: inv,
      currency: { ...emptyCurrency, gp: i === 0 ? 50 : 0 },
    });
  }

  // Put some loot in shared
  const sharedLoot: Item[] = [
    { ...TEMPLATE_ITEMS[5], id: `item-shared-0` },
    { ...TEMPLATE_ITEMS[4], id: `item-shared-1` },
  ];

  return { isDM: true, players, sharedLoot };
}

export default function VaultsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string>('player');
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [currentVaultId, setCurrentVaultId] = useState<string | null>(null);
  const [vaultData, setVaultData] = useState<VaultData>({ isDM: true, players: [], sharedLoot: [] });
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | 'shared'>('shared');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | 'shared' | null>(null);

  // Auth check
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

  // Load vaults
  useEffect(() => {
    const saved = localStorage.getItem(VAULTS_KEY);
    if (saved) setVaults(JSON.parse(saved));
  }, []);

  // Persist vaults
  useEffect(() => {
    if (vaults.length > 0) localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
  }, [vaults]);

  // Migrate old vault data that might be missing currency field
  function migrateVaultData(data: VaultData): VaultData {
    return {
      ...data,
      players: data.players.map((p) => ({
        ...p,
        currency: p.currency ?? { pp: 0, gp: 0, sp: 0, cp: 0 },
      })),
    };
  }

  //  Vault CRUD 
  const handleSelectVault = (vaultId: string) => {
    const vault = vaults.find((v) => v.id === vaultId);
    if (vault) {
      const migrated = migrateVaultData(vault.data);
      setCurrentVaultId(vaultId);
      setVaultData(migrated);
      setSelectedPlayerId(migrated.players.length > 0 ? migrated.players[0].id : 'shared');
      setVaults(vaults.map((v) => (v.id === vaultId ? { ...v, lastAccessed: new Date().toISOString(), data: migrated } : v)));
    }
  };

  const handleCreateVault = (info: { name: string; description: string; playerCount: number; password: string }) => {
    const newVault: Vault = {
      ...info,
      id: `vault-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      data: buildInitialData(info.playerCount),
    };
    setVaults([...vaults, newVault]);
  };

  const handleJoinVault = (vaultName: string, password: string): boolean => {
    const allVaults = localStorage.getItem(VAULTS_KEY);
    if (allVaults) {
      const parsed: Vault[] = JSON.parse(allVaults);
      const found = parsed.find((v) => v.name.toLowerCase() === vaultName.toLowerCase() && v.password === password);
      if (found) {
        if (!vaults.some((v) => v.id === found.id)) {
          setVaults([...vaults, { ...found, lastAccessed: new Date().toISOString() }]);
        }
        return true;
      }
    }
    return false;
  };

  const handleDeleteVault = (vaultId: string) => {
    setVaults(vaults.filter((v) => v.id !== vaultId));
    if (currentVaultId === vaultId) setCurrentVaultId(null);
  };

  const handleBackToHome = () => {
    if (currentVaultId) {
      setVaults(vaults.map((v) => (v.id === currentVaultId ? { ...v, data: vaultData } : v)));
    }
    setCurrentVaultId(null);
    setSelectedPlayerId('shared');
  };

  //  Item move (drag & drop) — uses functional update to avoid stale closures
  const handleMoveItem = (itemId: string, fromId: string | 'shared', toId: string | 'shared') => {
    setVaultData((prev) => {
      let item: Item | undefined;

      const updatedPlayers = prev.players.map((p) => {
        if (p.id === fromId) {
          const idx = p.inventory.findIndex((i) => i.id === itemId);
          if (idx !== -1) {
            item = p.inventory[idx];
            return { ...p, inventory: p.inventory.filter((i) => i.id !== itemId) };
          }
        }
        return p;
      });

      let updatedShared = [...prev.sharedLoot];
      if (fromId === 'shared') {
        const idx = updatedShared.findIndex((i) => i.id === itemId);
        if (idx !== -1) {
          item = updatedShared[idx];
          updatedShared = updatedShared.filter((i) => i.id !== itemId);
        }
      }

      if (!item) return prev;

      const finalPlayers = updatedPlayers.map((p) =>
        p.id === toId ? { ...p, inventory: [...p.inventory, item!] } : p
      );
      if (toId === 'shared') updatedShared = [...updatedShared, item];

      return { ...prev, players: finalPlayers, sharedLoot: updatedShared };
    });
  };

  //  Currency change — functional update
  const handleCurrencyChange = (playerId: string, currency: Currency) => {
    setVaultData((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, currency } : p)),
    }));
  };

  //  Max weight change — functional update
  const handleMaxWeightChange = (playerId: string, newMax: number) => {
    setVaultData((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, maxWeight: newMax } : p)),
    }));
  };

  //  Derived values 
  const currentVault = vaults.find((v) => v.id === currentVaultId);
  const selectedPlayer = vaultData.players.find((p) => p.id === selectedPlayerId);
  const isShared = selectedPlayerId === 'shared';
  const isDM = userType === 'gm';

  if (!isAuthenticated) return null;

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
            campaignName={currentVault?.name ?? 'Vault'}
            totalSlots={currentVault?.playerCount ?? vaultData.players.length}
            onBack={handleBackToHome}
          />
          <div className="flex-1 min-w-0">
            <InventoryView
              inventory={isShared ? vaultData.sharedLoot : (selectedPlayer?.inventory ?? [])}
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
            onAdd={(item: Omit<Item, 'id'>) => {
              const newItem: Item = { ...item, id: `item-${Date.now()}` };
              setVaultData((prev) => {
                if (isShared) {
                  return { ...prev, sharedLoot: [...prev.sharedLoot, newItem] };
                }
                return {
                  ...prev,
                  players: prev.players.map((p) =>
                    p.id === selectedPlayerId ? { ...p, inventory: [...p.inventory, newItem] } : p
                  ),
                };
              });
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
              setVaultData((prev) => ({
                ...prev,
                players: prev.players.map((p) => ({
                  ...p,
                  inventory: p.inventory.map((i) => (i.id === selectedItem.id ? updatedItem : i)),
                })),
                sharedLoot: prev.sharedLoot.map((i) => (i.id === selectedItem.id ? updatedItem : i)),
              }));
              setSelectedItem(null);
            }}
            onDelete={() => {
              setVaultData((prev) => ({
                ...prev,
                players: prev.players.map((p) => ({
                  ...p,
                  inventory: p.inventory.filter((i) => i.id !== selectedItem.id),
                })),
                sharedLoot: prev.sharedLoot.filter((i) => i.id !== selectedItem.id),
              }));
              setSelectedItem(null);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
}
