import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Item, Player, Currency } from '@/app/types';

// Helper function to remove undefined values from objects (Firestore doesn't allow undefined)
function cleanItem(item: Item): Item {
  const cleaned: any = {};
  Object.keys(item).forEach((key) => {
    const value = (item as any)[key];
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned as Item;
}

function cleanItems(items: Item[]): Item[] {
  return items.map(cleanItem);
}

// Generate random campaign ID
export function generateCampaignId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// User Document Structure
export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  role: 'dm' | 'player'; // Current active role
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dmCampaigns: string[]; // Campaign IDs where user is DM
  playerCampaigns: string[]; // Campaign IDs where user is a player
}

// Campaign Document Structure
export interface CampaignDoc {
  id: string;
  name: string;
  description: string;
  dmId: string;
  dmName: string;
  playerIds: string[]; // User IDs of players
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sharedLoot: Item[];
  password?: string; // Optional password for joining
}

// Player Inventory Document Structure (subcollection under campaign)
export interface PlayerInventoryDoc {
  playerId: string; // User ID
  playerName: string;
  campaignId: string;
  color: string;
  avatar: string;
  maxWeight: number;
  inventory: Item[];
  currency: Currency;
  updatedAt: Timestamp;
}

// ==================== Authentication ====================

export async function signUpUser(email: string, password: string, name: string, role: 'dm' | 'player') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document
  const userDoc: UserDoc = {
    uid: user.uid,
    email: email.toLowerCase(),
    name,
    role,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    dmCampaigns: [],
    playerCampaigns: [],
  };

  await setDoc(doc(db, 'users', user.uid), userDoc);
  return user;
}

export async function signInUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ==================== User Management ====================

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDoc;
  }
  return null;
}

export async function updateUserRole(uid: string, role: 'dm' | 'player') {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserName(uid: string, name: string) {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    name,
    updatedAt: serverTimestamp(),
  });
}

// ==================== Campaign Management ====================

export async function createCampaign(
  dmId: string,
  dmName: string,
  name: string,
  description: string,
  password?: string
): Promise<string> {
  const campaignId = generateCampaignId();
  
  const campaignDoc: CampaignDoc = {
    id: campaignId,
    name,
    description,
    dmId,
    dmName,
    playerIds: [],
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    sharedLoot: [],
    password,
  };

  await setDoc(doc(db, 'campaigns', campaignId), campaignDoc);

  // Add to DM's campaign list
  const userRef = doc(db, 'users', dmId);
  await updateDoc(userRef, {
    dmCampaigns: arrayUnion(campaignId),
    updatedAt: serverTimestamp(),
  });

  return campaignId;
}

export async function getCampaign(campaignId: string): Promise<CampaignDoc | null> {
  const docRef = doc(db, 'campaigns', campaignId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as CampaignDoc;
  }
  return null;
}

export async function joinCampaign(
  campaignId: string,
  playerId: string,
  playerName: string,
  password?: string
): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Check password if required
  if (campaign.password && campaign.password !== password) {
    throw new Error('Incorrect password');
  }

  // Check if already joined
  if (campaign.playerIds.includes(playerId)) {
    throw new Error('Already joined this campaign');
  }

  // Add player to campaign
  const campaignRef = doc(db, 'campaigns', campaignId);
  await updateDoc(campaignRef, {
    playerIds: arrayUnion(playerId),
    updatedAt: serverTimestamp(),
  });

  // Add campaign to player's list
  const userRef = doc(db, 'users', playerId);
  await updateDoc(userRef, {
    playerCampaigns: arrayUnion(campaignId),
    updatedAt: serverTimestamp(),
  });

  // Create initial player inventory
  const avatars = ['⚔️', '✨', '🛡️', '🏹', '🔥', '🌙', '🔨', '🌊'];
  const colors = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600', 'bg-rose-600', 'bg-indigo-600'];
  const playerIndex = campaign.playerIds.length;

  const playerInventory: PlayerInventoryDoc = {
    playerId,
    playerName,
    campaignId,
    color: colors[playerIndex % colors.length],
    avatar: avatars[playerIndex % avatars.length],
    maxWeight: 150,
    inventory: [],
    currency: { pp: 0, gp: 0, sp: 0, cp: 0 },
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(doc(db, 'campaigns', campaignId, 'playerInventories', playerId), playerInventory);
}

export async function getUserCampaigns(uid: string, role: 'dm' | 'player'): Promise<CampaignDoc[]> {
  const userDoc = await getUserDoc(uid);
  if (!userDoc) return [];

  const campaignIds = role === 'dm' ? userDoc.dmCampaigns : userDoc.playerCampaigns;
  if (campaignIds.length === 0) return [];

  const campaigns: CampaignDoc[] = [];
  for (const campaignId of campaignIds) {
    const campaign = await getCampaign(campaignId);
    if (campaign) {
      campaigns.push(campaign);
    }
  }

  return campaigns;
}

// ==================== Inventory Management ====================

export async function getPlayerInventory(
  campaignId: string,
  playerId: string
): Promise<PlayerInventoryDoc | null> {
  const docRef = doc(db, 'campaigns', campaignId, 'playerInventories', playerId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as PlayerInventoryDoc;
  }
  return null;
}

export async function getAllPlayerInventories(campaignId: string): Promise<PlayerInventoryDoc[]> {
  const inventories: PlayerInventoryDoc[] = [];
  const querySnapshot = await getDocs(collection(db, 'campaigns', campaignId, 'playerInventories'));
  querySnapshot.forEach((doc) => {
    inventories.push(doc.data() as PlayerInventoryDoc);
  });
  return inventories;
}

export async function updatePlayerInventory(
  campaignId: string,
  playerId: string,
  inventory: Item[],
  currency?: Currency,
  maxWeight?: number
): Promise<void> {
  const docRef = doc(db, 'campaigns', campaignId, 'playerInventories', playerId);
  const updateData: any = {
    inventory: cleanItems(inventory),
    updatedAt: serverTimestamp(),
  };
  if (currency) {
    updateData.currency = currency;
  }
  if (maxWeight !== undefined) {
    updateData.maxWeight = maxWeight;
  }
  await updateDoc(docRef, updateData);
}

export async function updateSharedLoot(campaignId: string, sharedLoot: Item[]): Promise<void> {
  const docRef = doc(db, 'campaigns', campaignId);
  await updateDoc(docRef, {
    sharedLoot: cleanItems(sharedLoot),
    updatedAt: serverTimestamp(),
  });
}

export async function addItemToInventory(
  campaignId: string,
  playerId: string,
  item: Item
): Promise<void> {
  const inventory = await getPlayerInventory(campaignId, playerId);
  if (!inventory) throw new Error('Inventory not found');
  
  // Check if item already exists (same name, category, rarity)
  const existingIndex = inventory.inventory.findIndex(
    (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity
  );
  
  if (existingIndex >= 0) {
    // Stack items by increasing quantity
    inventory.inventory[existingIndex].quantity += item.quantity;
  } else {
    // Add as new item
    inventory.inventory.push(cleanItem(item));
  }
  
  await updatePlayerInventory(campaignId, playerId, inventory.inventory);
}

export async function addItemToSharedLoot(campaignId: string, item: Item): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  
  // Check if item already exists (same name, category, rarity)
  const existingIndex = campaign.sharedLoot.findIndex(
    (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity
  );
  
  if (existingIndex >= 0) {
    // Stack items by increasing quantity
    campaign.sharedLoot[existingIndex].quantity += item.quantity;
  } else {
    // Add as new item
    campaign.sharedLoot.push(cleanItem(item));
  }
  
  await updateSharedLoot(campaignId, campaign.sharedLoot);
}

export async function moveItemBetweenInventories(
  campaignId: string,
  itemId: string,
  fromId: string | 'shared',
  toId: string | 'shared',
  currentUserId?: string,
  isDM?: boolean
): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  // Validation: non-DM players can only move items FROM shared loot TO their own inventory
  if (currentUserId && !isDM && fromId === 'shared' && toId !== 'shared' && toId !== currentUserId) {
    throw new Error('You can only move items from shared loot to your own inventory.');
  }

  let item: Item | undefined;
  let sourceInventory: Item[] | undefined;

  // Find item in source (don't remove yet)
  if (fromId === 'shared') {
    const index = campaign.sharedLoot.findIndex((i) => i.id === itemId);
    if (index >= 0) {
      item = { ...campaign.sharedLoot[index] };
      sourceInventory = campaign.sharedLoot;
    }
  } else {
    const fromInventory = await getPlayerInventory(campaignId, fromId);
    if (fromInventory) {
      const index = fromInventory.inventory.findIndex((i) => i.id === itemId);
      if (index >= 0) {
        item = { ...fromInventory.inventory[index] };
        sourceInventory = fromInventory.inventory;
      }
    }
  }

  if (!item) throw new Error('Item not found');

  // Now try to add to destination (this might fail due to permissions)
  try {
    if (toId === 'shared') {
      // Check if item already exists in shared loot
      const existingIndex = campaign.sharedLoot.findIndex(
        (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity
      );
      
      if (existingIndex >= 0) {
        // Stack items by increasing quantity
        campaign.sharedLoot[existingIndex].quantity += item.quantity;
      } else {
        // Add as new item
        campaign.sharedLoot.push(item);
      }
      await updateSharedLoot(campaignId, campaign.sharedLoot);
    } else {
      const toInventory = await getPlayerInventory(campaignId, toId);
      if (toInventory) {
        // Check if item already exists in player inventory
        const existingIndex = toInventory.inventory.findIndex(
          (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity
        );
        
        if (existingIndex >= 0) {
          // Stack items by increasing quantity
          toInventory.inventory[existingIndex].quantity += item.quantity;
        } else {
          // Add as new item
          toInventory.inventory.push(item);
        }
        await updatePlayerInventory(campaignId, toId, toInventory.inventory);
      } else {
        throw new Error('Destination inventory not found');
      }
    }
  } catch (error) {
    // If adding to destination failed, don't remove from source
    throw error;
  }

  // Only now remove from source (after destination write succeeded)
  if (sourceInventory) {
    const index = sourceInventory.findIndex((i) => i.id === itemId);
    if (index >= 0) {
      sourceInventory.splice(index, 1);
      
      if (fromId === 'shared') {
        await updateSharedLoot(campaignId, sourceInventory);
      } else {
        await updatePlayerInventory(campaignId, fromId, sourceInventory);
      }
    }
  }
}

// ==================== Real-time Listeners ====================

export function subscribeToCampaign(
  campaignId: string,
  callback: (campaign: CampaignDoc) => void
): () => void {
  const docRef = doc(db, 'campaigns', campaignId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as CampaignDoc);
    }
  });
}

export function subscribeToPlayerInventories(
  campaignId: string,
  callback: (inventories: PlayerInventoryDoc[]) => void
): () => void {
  const collectionRef = collection(db, 'campaigns', campaignId, 'playerInventories');
  return onSnapshot(collectionRef, (snapshot) => {
    const inventories: PlayerInventoryDoc[] = [];
    snapshot.forEach((doc) => {
      inventories.push(doc.data() as PlayerInventoryDoc);
    });
    callback(inventories);
  });
}

export function subscribeToPlayerInventory(
  campaignId: string,
  playerId: string,
  callback: (inventory: PlayerInventoryDoc | null) => void
): () => void {
  const docRef = doc(db, 'campaigns', campaignId, 'playerInventories', playerId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as PlayerInventoryDoc);
    } else {
      callback(null);
    }
  });
}
