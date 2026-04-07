# Firebase Layer (`src/`)

All Firebase logic lives here. Components must never import from `firebase` directly — always go through these files.

## `firebase.ts`
Initializes Firebase app, exports: `auth`, `db` (Firestore), `googleProvider`.

## `firebaseService.ts`
All Firestore read/write operations. **~1450 lines — read targeted sections, never the whole file.**

### Types / Interfaces
- `UserDoc` — uid, email, name, role ('gm'|'player'), createdAt, updatedAt
- `CampaignDoc` — id, name, gmId, gmName, playerIds[], createdAt, sharedLoot, sharedCurrency, sharedLootName, password, customItemPool
- `PlayerInventoryDoc` — playerId, playerName, color, avatar, inventory, currency, maxWeight
- `TransferRequest` — id, campaignId, fromPlayerId, fromPlayerName, toPlayerId, toPlayerName, itemName, itemId, quantity, status ('pending'|'accepted'|'rejected'|'expired'), createdAt, expiresAt
- `CoinTransferRequest` — id, **type:'coin'**, campaignId, fromPlayerId, fromPlayerName, toPlayerId, toPlayerName, amounts: Currency, status, createdAt, expiresAt

### CRITICAL: Firestore Security Rules
**Rules are NOT stored locally — they live in the Firebase console.**
If a new subcollection is needed: ask the user to paste their current rules, then provide the full updated rules block ready to copy-paste.

### CRITICAL: Firestore Collection Rules
- `transferRequests` subcollection is **the only allowed subcollection** for player-to-player transfers
- `CoinTransferRequest` is stored in `transferRequests` with `type: 'coin'` to distinguish from item transfers
- Item transfer subscriptions skip docs where `type === 'coin'`; coin subscriptions skip docs without it
- **Never write to a new subcollection without adding it to Firebase console security rules first**

### Auth
- `registerUser(email, password, name)` — creates Firebase Auth user + UserDoc
- `loginUser(email, password)`
- `loginWithGoogle()`
- `logoutUser()`
- `onAuthChange(callback)` — wraps onAuthStateChanged
- `deleteUserAccount(uid)`

### User
- `getUser(uid)` → UserDoc
- `updateUserRole(uid, role)` — switch between 'gm' and 'player'

### Campaigns
- `createCampaign(gmId, gmName, name)` → campaignId
- `getCampaign(campaignId)` → CampaignDoc
- `subscribeToCampaign(campaignId, callback)` → unsubscribe fn
- `getUserCampaigns(uid, role)` → CampaignDoc[]
- `joinCampaign(campaignId, userId, userName)`
- `deleteCampaign(campaignId, gmId)` — GM only
- `leaveCampaign(campaignId, userId)` — player leaves
- `updateCampaignSettings(campaignId, userId, { name, password })`
- `updateSharedLootName(campaignId, userId, name)`
- `kickPlayer(campaignId, gmId, playerId)`

### Players / Inventory
- `getPlayers(campaignId)` → Player[]
- `getPlayerInventory(campaignId, playerId)` → PlayerInventoryDoc | null
- `subscribeToPlayers(campaignId, callback)` → unsubscribe fn (real-time)
- `subscribeToPlayerInventories(campaignId, callback)` → unsubscribe fn
- `addPlayer(campaignId, player)`
- `updatePlayerInventory(campaignId, playerId, items, currency?, maxWeight?)` — replaces full inventory array
- `updatePlayerProfileInCampaign(campaignId, playerId, { name, avatar })`
- `updatePlayerCurrency(campaignId, playerId, currency)`
- `updatePlayerMaxWeight(campaignId, playerId, maxWeight)`
- `removePlayer(campaignId, playerId)`
- `deletePlayerInventoryDoc(campaignId, playerId)`

### Shared Loot
- `updateSharedLoot(campaignId, items)` — replaces shared loot array
- `updateSharedCurrency(campaignId, currency)`

### Item Transfers (player-to-player, with accept/reject)
Stored in `campaigns/{id}/transferRequests/`
- `createTransferRequest(campaignId, item, fromId, fromName, toId, toName)` → requestId
- `acceptTransferRequest(campaignId, requestId, recipientId)`
- `rejectTransferRequest(campaignId, requestId)`
- `cancelTransferRequest(campaignId, requestId, senderId)`
- `restoreRejectedTransfer(campaignId, requestId, senderId)` — returns item to sender
- `subscribeToTransferRequests(campaignId, playerId, callback)` — incoming pending (skips type:'coin')
- `subscribeToRejectedTransfers(campaignId, playerId, callback)` — rejected/expired sent by me (skips type:'coin')
- `subscribeToPendingTransfersFromMe(campaignId, playerId, callback)` — my pending sends (skips type:'coin')
- `checkAndExpirePendingTransfers(campaignId, playerId)` — marks expired as 'expired'

### Coin Transfers (player-to-player, with accept/reject)
Stored in `campaigns/{id}/transferRequests/` with `type: 'coin'`
- `createCoinTransferRequest(campaignId, fromId, fromName, toId, toName, amounts)` → requestId
  - Validates sender has enough coins FIRST, writes doc FIRST, then deducts (escrow)
- `acceptCoinTransferRequest(campaignId, requestId, recipientId)` — adds coins to recipient, deletes doc
- `rejectCoinTransferRequest(campaignId, requestId)` — sets status:'rejected'
- `cancelCoinTransferRequest(campaignId, requestId, senderId)` — restores coins, deletes doc
- `restoreRejectedCoinTransfer(campaignId, requestId, senderId)` — returns coins to sender
- `subscribeToCoinTransferRequests(campaignId, playerId, callback)` — incoming pending coin transfers
- `subscribeToRejectedOrExpiredCoinTransfers(campaignId, playerId, callback)` — rejected/expired coin sends

### Homebrew Items
- `createUserHomebrewItem(userId, item)` → Item
- `bulkImportHomebrewItems(userId, items)` → Item[]
- `updateUserHomebrewItem(userId, item)`
- `deleteUserHomebrewItem(userId, itemId)`
- `updateCampaignCustomItemPool(campaignId, gmId, items)`

### Internal helpers (not exported)
- `cleanItem(item)` — strips undefined fields before Firestore write
- `cleanItems(items)` — maps cleanItem over array
- `getItemStackSignature(item)` — JSON key for item dedup/stacking
- `generateCampaignId()` — 8-char alphanumeric ID
- `isTransferExpired(request)` — checks expiresAt vs now
- `markTransferAsExpired(campaignId, requestId)` — sets status:'expired'
