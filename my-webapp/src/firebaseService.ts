import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
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

export async function signInWithGoogle(): Promise<{ user: FirebaseUser; isNewUser: boolean }> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Check if user document exists
  const existingUserDoc = await getUserDoc(user.uid);
  
  if (!existingUserDoc) {
    // New user - create user document with 'player' as default role
    const userDoc: UserDoc = {
      uid: user.uid,
      email: user.email?.toLowerCase() || '',
      name: user.displayName || 'Adventurer',
      role: 'player', // Default role for Google sign-in
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      dmCampaigns: [],
      playerCampaigns: [],
    };
    await setDoc(doc(db, 'users', user.uid), userDoc);
    return { user, isNewUser: true };
  }
  
  return { user, isNewUser: false };
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

export async function updateCampaignSettings(
  campaignId: string,
  dmId: string,
  updates: { name: string; password: string }
): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  if (campaign.dmId !== dmId) {
    throw new Error('Only the campaign DM can update vault settings.');
  }

  await updateDoc(doc(db, 'campaigns', campaignId), {
    name: updates.name.trim(),
    password: updates.password,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCampaign(campaignId: string, dmId: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete all playerInventories subcollection docs
  const inventoriesSnap = await getDocs(collection(db, 'campaigns', campaignId, 'playerInventories'));
  inventoriesSnap.forEach((d) => batch.delete(d.ref));

  // Delete all transferRequests subcollection docs
  const transfersSnap = await getDocs(collection(db, 'campaigns', campaignId, 'transferRequests'));
  transfersSnap.forEach((d) => batch.delete(d.ref));

  // Delete the campaign document itself
  batch.delete(doc(db, 'campaigns', campaignId));

  // Remove campaign from DM's own user doc (allowed by rules)
  batch.update(doc(db, 'users', dmId), {
    dmCampaigns: arrayRemove(campaignId),
    updatedAt: serverTimestamp(),
  });

  // Note: We can't remove the campaign from players' user docs because
  // security rules only allow users to update their own doc.
  // getUserCampaigns already handles stale references gracefully —
  // getCampaign returns null for deleted campaigns and they're skipped.

  await batch.commit();
}

export async function leaveCampaign(campaignId: string, playerId: string): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.dmId === playerId) {
    throw new Error('DM cannot leave their own campaign. Delete the vault instead.');
  }

  if (!campaign.playerIds.includes(playerId)) {
    throw new Error('You are not a member of this campaign.');
  }

  const batch = writeBatch(db);

  // Remove player membership from campaign.
  batch.update(doc(db, 'campaigns', campaignId), {
    playerIds: arrayRemove(playerId),
    updatedAt: serverTimestamp(),
  });

  // Remove campaign from the player's user document.
  batch.update(doc(db, 'users', playerId), {
    playerCampaigns: arrayRemove(campaignId),
    updatedAt: serverTimestamp(),
  });

  // Remove the player's inventory document from this campaign.
  batch.delete(doc(db, 'campaigns', campaignId, 'playerInventories', playerId));

  // Remove transfer requests where this player is sender or recipient.
  const transfersSnap = await getDocs(collection(db, 'campaigns', campaignId, 'transferRequests'));
  transfersSnap.forEach((transferDoc) => {
    const transfer = transferDoc.data() as TransferRequest;
    if (transfer.fromPlayerId === playerId || transfer.toPlayerId === playerId) {
      batch.delete(transferDoc.ref);
    }
  });

  await batch.commit();
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

  // Always move exactly 1 unit
  const moveQty = 1;

  // Now try to add to destination (this might fail due to permissions)
  try {
    if (toId === 'shared') {
      // Check if item already exists in shared loot
      const existingIndex = campaign.sharedLoot.findIndex(
        (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity
      );
      
      if (existingIndex >= 0) {
        // Stack items by increasing quantity
        campaign.sharedLoot[existingIndex].quantity += moveQty;
      } else {
        // Add as new item with quantity 1
        campaign.sharedLoot.push({ ...item, quantity: moveQty });
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
          toInventory.inventory[existingIndex].quantity += moveQty;
        } else {
          // Add as new item with quantity 1
          toInventory.inventory.push({ ...item, quantity: moveQty });
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

  // Only now remove/decrement from source (after destination write succeeded)
  if (sourceInventory) {
    const index = sourceInventory.findIndex((i) => i.id === itemId);
    if (index >= 0) {
      if (sourceInventory[index].quantity > 1) {
        // Decrement by 1 instead of removing
        sourceInventory[index].quantity -= moveQty;
      } else {
        sourceInventory.splice(index, 1);
      }
      
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

// ==================== Transfer Requests ====================
// Uses "escrow" approach to work within Firebase security rules:
// - Create: Sender removes item from their inventory, stores full item in request
// - Accept: Recipient adds item to their inventory, deletes request
// - Reject: Recipient sets status to 'rejected', sender restores item and deletes request

const TRANSFER_EXPIRATION_SECONDS = 10;

export interface TransferRequest {
  id: string;
  campaignId: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemRarity: string;
  itemData: Item; // Full item data for restoration
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  toPlayerName: string;
  quantity: number;
  createdAt: Timestamp;
  expiresAt: Timestamp; // Server-side expiration timestamp
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export async function createTransferRequest(
  campaignId: string,
  item: Item,
  fromPlayerId: string,
  fromPlayerName: string,
  toPlayerId: string,
  toPlayerName: string
): Promise<string> {
  const requestId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // First, remove 1 unit of the item from sender's inventory (escrow)
  const senderInventory = await getPlayerInventory(campaignId, fromPlayerId);
  if (!senderInventory) throw new Error('Sender inventory not found');
  
  const itemIndex = senderInventory.inventory.findIndex((i) => i.id === item.id);
  if (itemIndex < 0) throw new Error('Item not found in inventory');
  
  const updatedInventory = [...senderInventory.inventory];
  const itemToTransfer = { ...updatedInventory[itemIndex], quantity: 1 };
  
  if (updatedInventory[itemIndex].quantity > 1) {
    updatedInventory[itemIndex].quantity -= 1;
  } else {
    updatedInventory.splice(itemIndex, 1);
  }
  
  // Update sender's inventory (sender has permission)
  await updatePlayerInventory(campaignId, fromPlayerId, updatedInventory, senderInventory.currency);
  
  // Create the transfer request with full item data
  // Calculate expiration time (TRANSFER_EXPIRATION_SECONDS from now)
  const expirationDate = new Date(Date.now() + TRANSFER_EXPIRATION_SECONDS * 1000);
  const expiresAt = Timestamp.fromDate(expirationDate);

  const transferRequest: TransferRequest = {
    id: requestId,
    campaignId,
    itemId: item.id,
    itemName: item.name,
    itemCategory: item.category,
    itemRarity: item.rarity,
    itemData: cleanItem(itemToTransfer),
    fromPlayerId,
    fromPlayerName,
    toPlayerId,
    toPlayerName,
    quantity: 1,
    createdAt: serverTimestamp() as Timestamp,
    expiresAt,
    status: 'pending',
  };

  await setDoc(doc(db, 'campaigns', campaignId, 'transferRequests', requestId), transferRequest);
  return requestId;
}

export async function acceptTransferRequest(
  campaignId: string,
  requestId: string,
  recipientId: string
): Promise<void> {
  const requestRef = doc(db, 'campaigns', campaignId, 'transferRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Transfer request not found');
  }
  
  const request = requestSnap.data() as TransferRequest;
  
  if (request.status !== 'pending') {
    throw new Error('Transfer request is no longer pending');
  }

  // Add item to recipient's inventory (recipient has permission for their own inventory)
  const recipientInventory = await getPlayerInventory(campaignId, recipientId);
  if (!recipientInventory) throw new Error('Recipient inventory not found');
  
  // Check if item already exists (stack by name, category, rarity)
  const existingIndex = recipientInventory.inventory.findIndex(
    (i) => i.name === request.itemData.name && 
           i.category === request.itemData.category && 
           i.rarity === request.itemData.rarity
  );
  
  const updatedInventory = [...recipientInventory.inventory];
  if (existingIndex >= 0) {
    updatedInventory[existingIndex].quantity += request.quantity;
  } else {
    // Generate new ID for the item in recipient's inventory
    const newItem: Item = {
      ...request.itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quantity: request.quantity,
    };
    updatedInventory.push(newItem);
  }
  
  await updatePlayerInventory(campaignId, recipientId, updatedInventory, recipientInventory.currency);

  // Delete the request after successful transfer
  await deleteDoc(requestRef);
}

export async function rejectTransferRequest(
  campaignId: string,
  requestId: string
): Promise<void> {
  // Recipient sets status to 'rejected' - sender will restore item and delete
  const requestRef = doc(db, 'campaigns', campaignId, 'transferRequests', requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
  });
}

export async function cancelTransferRequest(
  campaignId: string,
  requestId: string,
  senderId: string
): Promise<void> {
  const requestRef = doc(db, 'campaigns', campaignId, 'transferRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) return;
  
  const request = requestSnap.data() as TransferRequest;
  
  // Restore item to sender's inventory
  const senderInventory = await getPlayerInventory(campaignId, senderId);
  if (senderInventory) {
    const existingIndex = senderInventory.inventory.findIndex(
      (i) => i.name === request.itemData.name && 
             i.category === request.itemData.category && 
             i.rarity === request.itemData.rarity
    );
    
    const updatedInventory = [...senderInventory.inventory];
    if (existingIndex >= 0) {
      updatedInventory[existingIndex].quantity += request.quantity;
    } else {
      updatedInventory.push({ ...request.itemData, quantity: request.quantity });
    }
    
    await updatePlayerInventory(campaignId, senderId, updatedInventory, senderInventory.currency);
  }
  
  // Delete the request
  await deleteDoc(requestRef);
}

export async function restoreRejectedTransfer(
  campaignId: string,
  requestId: string,
  senderId: string
): Promise<void> {
  const requestRef = doc(db, 'campaigns', campaignId, 'transferRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) return;
  
  const request = requestSnap.data() as TransferRequest;
  
  // Handle both rejected and expired statuses
  if (request.status !== 'rejected' && request.status !== 'expired') return;
  
  // Restore item to sender's inventory
  const senderInventory = await getPlayerInventory(campaignId, senderId);
  if (senderInventory) {
    const existingIndex = senderInventory.inventory.findIndex(
      (i) => i.name === request.itemData.name && 
             i.category === request.itemData.category && 
             i.rarity === request.itemData.rarity
    );
    
    const updatedInventory = [...senderInventory.inventory];
    if (existingIndex >= 0) {
      updatedInventory[existingIndex].quantity += request.quantity;
    } else {
      updatedInventory.push({ ...request.itemData, quantity: request.quantity });
    }
    
    await updatePlayerInventory(campaignId, senderId, updatedInventory, senderInventory.currency);
  }
  
  // Delete the request
  await deleteDoc(requestRef);
}

// Helper to check if a transfer request has expired
function isTransferExpired(request: TransferRequest): boolean {
  if (!request.expiresAt) return false; // Legacy requests without expiresAt
  const now = new Date();
  const expiresAt = request.expiresAt.toDate();
  return now > expiresAt;
}

// Mark an expired transfer request as expired
async function markTransferAsExpired(campaignId: string, requestId: string): Promise<void> {
  const requestRef = doc(db, 'campaigns', campaignId, 'transferRequests', requestId);
  try {
    await updateDoc(requestRef, { status: 'expired' });
  } catch (error) {
    console.error('Failed to mark transfer as expired:', error);
  }
}

// Actively check for and expire pending transfers from a player
// This should be called periodically since Firestore subscriptions don't trigger on time changes
export async function checkAndExpirePendingTransfers(
  campaignId: string,
  playerId: string
): Promise<void> {
  const collectionRef = collection(db, 'campaigns', campaignId, 'transferRequests');
  const q = query(collectionRef, where('fromPlayerId', '==', playerId), where('status', '==', 'pending'));
  
  const snapshot = await getDocs(q);
  
  for (const docSnap of snapshot.docs) {
    const request = docSnap.data() as TransferRequest;
    if (isTransferExpired(request)) {
      await markTransferAsExpired(campaignId, request.id);
    }
  }
}

export function subscribeToTransferRequests(
  campaignId: string,
  playerId: string,
  callback: (requests: TransferRequest[]) => void
): () => void {
  const collectionRef = collection(db, 'campaigns', campaignId, 'transferRequests');
  const q = query(collectionRef, where('toPlayerId', '==', playerId), where('status', '==', 'pending'));
  
  return onSnapshot(q, async (snapshot) => {
    const requests: TransferRequest[] = [];
    const expiredRequests: TransferRequest[] = [];
    
    snapshot.forEach((docSnap) => {
      const request = docSnap.data() as TransferRequest;
      if (isTransferExpired(request)) {
        expiredRequests.push(request);
      } else {
        requests.push(request);
      }
    });
    
    // Mark expired requests (they will be restored by sender's subscription)
    for (const expired of expiredRequests) {
      await markTransferAsExpired(campaignId, expired.id);
    }
    
    callback(requests);
  });
}

export function subscribeToRejectedOrExpiredTransfers(
  campaignId: string,
  playerId: string,
  callback: (requests: TransferRequest[]) => void
): () => void {
  const collectionRef = collection(db, 'campaigns', campaignId, 'transferRequests');
  // Query for both rejected and expired transfers from this player
  const q = query(collectionRef, where('fromPlayerId', '==', playerId));
  
  return onSnapshot(q, (snapshot) => {
    const requests: TransferRequest[] = [];
    snapshot.forEach((docSnap) => {
      const request = docSnap.data() as TransferRequest;
      // Include both rejected and expired status
      if (request.status === 'rejected' || request.status === 'expired') {
        requests.push(request);
      }
    });
    callback(requests);
  });
}

// Keep backward compatibility alias
export const subscribeToRejectedTransfers = subscribeToRejectedOrExpiredTransfers;

export function subscribeToPendingTransfersFromMe(
  campaignId: string,
  playerId: string,
  callback: (requests: TransferRequest[]) => void
): () => void {
  const collectionRef = collection(db, 'campaigns', campaignId, 'transferRequests');
  const q = query(collectionRef, where('fromPlayerId', '==', playerId), where('status', '==', 'pending'));
  
  return onSnapshot(q, async (snapshot) => {
    const requests: TransferRequest[] = [];
    const expiredRequests: TransferRequest[] = [];
    
    snapshot.forEach((docSnap) => {
      const request = docSnap.data() as TransferRequest;
      if (isTransferExpired(request)) {
        expiredRequests.push(request);
      } else {
        requests.push(request);
      }
    });
    
    // Sender can also mark expired requests (ensures expiration even if recipient is offline)
    for (const expired of expiredRequests) {
      await markTransferAsExpired(campaignId, expired.id);
    }
    
    callback(requests);
  });
}
