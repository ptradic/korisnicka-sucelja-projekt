# Firebase Layer (`src/`)

All Firebase logic lives here. Components must never import from `firebase` directly — always go through these files.

## `firebase.ts`
Initializes Firebase app, exports: `auth`, `db` (Firestore), `googleProvider`.

## `firebaseService.ts`
All Firestore read/write operations. Key exports:

**Types:**
- `UserDoc` — uid, email, name, role ('gm'|'player'), createdAt, updatedAt
- `CampaignDoc` — id, name, gmId, gmName, playerIds[], createdAt

**Auth:**
- `registerUser(email, password, name)` — creates Firebase Auth user + UserDoc
- `loginUser(email, password)`
- `loginWithGoogle()`
- `logoutUser()`
- `onAuthChange(callback)` — wraps onAuthStateChanged
- `deleteUserAccount(uid)`

**User:**
- `getUser(uid)` → UserDoc
- `updateUserRole(uid, role)` — switch between 'gm' and 'player'

**Campaigns:**
- `createCampaign(gmId, gmName, name)` → campaignId
- `getCampaign(campaignId)` → CampaignDoc
- `getUserCampaigns(uid, role)` → CampaignDoc[]
- `joinCampaign(campaignId, userId, userName)`
- `deleteCampaign(campaignId)` — GM only
- `leaveCampaign(campaignId, userId)` — player leaves

**Players/Inventory:**
- `getPlayers(campaignId)` → Player[]
- `subscribeToPlayers(campaignId, callback)` → unsubscribe fn (real-time)
- `addPlayer(campaignId, player)`
- `updatePlayerInventory(campaignId, playerId, items)` — replaces full inventory array
- `updatePlayerCurrency(campaignId, playerId, currency)`
- `updatePlayerMaxWeight(campaignId, playerId, maxWeight)`
- `removePlayer(campaignId, playerId)`

**Internal helpers (not exported):**
- `cleanItem(item)` — strips undefined fields before Firestore write
- `cleanItems(items)` — maps cleanItem over array
- `getItemStackSignature(item)` — JSON key for item dedup/stacking
- `generateCampaignId()` — 8-char alphanumeric ID
