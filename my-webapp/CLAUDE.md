# Project: The Black Vault (TBV)

D&D 5.5e (2024 SRD) campaign inventory manager. GMs manage player inventories and currencies; players view their own vault. Runs on Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Firebase Auth + Firestore.

## Stack
- Framework: Next.js 15 App Router — pages in `app/`
- Styling: Tailwind CSS 4 + CSS variables in `app/globals.css` (parchment/warm-brown theme)
- UI primitives: Radix UI + shadcn components in `app/components/`
- Icons: lucide-react, react-icons
- Drag & drop: react-dnd (multi-backend: mouse + touch)
- Fuzzy search: fuse.js
- Firebase: Auth + Firestore via `src/firebase.ts` and `src/firebaseService.ts`

## Key Types (`app/types.ts`)
- `Item` — id, name, category, rarity, quantity, weight, description?, value?, valueUnit?, valueUnknown?, notes?, attunement?, attuned?, hiddenFromOthers?, createdAt?, sourcebook?
- `Player` — id, name, color, avatar, maxWeight, inventory: Item[], currency: Currency
- `Currency` — pp, gp, sp, cp (all numbers, never undefined — default to 0)
- `ValueUnit` — 'gp' | 'sp' | 'cp'
- `Category` — weapons | armor | consumables | magic-gear | adventuring-gear | wealth-valuables | hidden
  - Legacy aliases (old saved data): weapon→weapons, potion→consumables, magic→magic-gear, treasure→wealth-valuables, misc→adventuring-gear
- `Rarity` — common | uncommon | rare | very rare | legendary | artifact
- `normalizeCategory(str)` — maps any legacy/unknown category string to a valid Category; unmapped → 'hidden'

## App Routes
- `/` — landing/home (`app/page.tsx`)
- `/login` — auth page (`app/login/`)
- `/vaults` — campaign lobby; GM creates/manages vaults, players join (`app/vaults/page.tsx`)
- `/vaults/[campaignId]` — campaign inventory view (main app screen); see `app/vaults/[id]/CLAUDE.md`
- `/guides` — guides page (`app/guides/page.tsx`)
- `/support` — support page (`app/support/page.tsx`)

## Roles
- `gm` — Game Master: full control, sees all items including hidden
- `player` — Player: sees own inventory only
- Role stored in Firestore `UserDoc.role`; switchable via `updateUserRole()`

## Data Model (Firestore)
- `users/{uid}` — UserDoc: uid, email, name, role, createdAt, updatedAt, gmCampaigns[], userHomebrew[]
- `campaigns/{campaignId}` — CampaignDoc: id, name, gmId, gmName, playerIds[], createdAt, sharedLoot[], sharedCurrency, sharedLootName, password, customItemPool[]
- `campaigns/{campaignId}/players/{playerId}` — PlayerInventoryDoc: playerId, playerName, color, avatar, inventory[], currency, maxWeight
- `campaigns/{campaignId}/transferRequests/{requestId}` — TransferRequest (items) or CoinTransferRequest (type:'coin')

## Conventions
- `@/` alias = project root
- `cn()` from `lib/utils.ts` for Tailwind class merging
- Firebase writes go through `firebaseService.ts` only — never write to Firestore directly from components
- All Firestore writes wrapped in `trackWrite()` from `useVaultAuth()` — tracks pending count for sync indicator
- Errors shown via `showActionError(title, error, onRetry?)` from `useVaultAuth()`
- Items must be cleaned with `cleanItem()` before Firestore writes (removes undefined)
- Item stacking uses `getItemStackSignature()` for dedup
- New Firestore subcollections require security rule updates in Firebase console (no local rules file)

## Large Data Files (do NOT read — use description only)
- `2024master.json` — Full D&D 2024 SRD item database. Array of objects with: key, name, desc, category, rarity, weight, value, valueUnit, attunement, sourcebook. Used as the searchable item catalog in AddItemModal.
- `itemstorage-cd026-firebase-adminsdk-fbsvc-*.json` — Firebase Admin SDK service account credentials. Do not read or modify.

## Subdirectory Guides
- `app/components/` → see `CLAUDE.md` there
- `src/` → see `CLAUDE.md` there
- `app/hooks/` → see `CLAUDE.md` there
- `app/vaults/` → see `CLAUDE.md` there (includes VaultAuthProvider, lobby page, [id] subdir)
- `app/vaults/[id]/` → see `CLAUDE.md` there (line ranges, all state/handlers/JSX for main page)
