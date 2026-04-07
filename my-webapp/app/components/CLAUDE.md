# Components (`app/components/`)

All React client components. Import with `@/app/components/ComponentName`.

## Main Feature Components

### `InventoryView.tsx`
Main inventory grid for a campaign. **~850 lines.**

Key props:
```ts
inventory: Item[]
owner: { name, id } | null
ownerId: string | 'shared'
isGM: boolean
onAddItem: () => void
onItemClick: (item) => void
onMoveItem: (itemIds, fromId, toId) => void
maxWeight?: number
onMaxWeightChange?: (newMax) => void
currency?: Currency
onCurrencyChange?: (c) => void         // undefined for shared (GM only)
onCoinTransfer?: (amounts) => void     // player deposit/withdraw from shared loot
onSendCoins?: (amounts) => void        // player sends coins to ANOTHER player (not own, not shared)
isShared: boolean
syncStatus: 'saving' | 'saved'
onKickPlayer?: () => void              // GM only, not own player
onRenameShared?: (name) => void        // GM + shared only
onReorderInventory: (items) => void
onBulkRemove: (itemIdsWithCounts[]) => void    // both GM and player
onSellItems: (itemIdsWithCounts[], earnings) => void  // both GM and player
```

Bulk select: single mode used for both Remove and Sell. Info row shows "X selected · Remove · Sell" when items selected.
Sell popup: full-screen fixed modal (not dropdown), default 80% sell price.
`SendCoinsButton`: rendered before `ItemDropZone` when `onSendCoins` is provided.

### `ItemCard.tsx`
Single item card. Draggable via react-dnd.
- Hold state: document-level `touchend`/`touchcancel` listener clears it (react-dnd swallows element-level touch events)
- `onSelectAll?: (item) => void` — appears when `bulkSelectEnabled && selectedCount > 0 && selectedCount < item.quantity`

### `PlayerSidebar.tsx`
Sidebar with player tabs, currency totals, weight bars.

Key props:
```ts
players: Player[]
selectedPlayerId: string | 'shared'
onSelectPlayer: (id: string | 'shared') => void
onMoveItem: (itemIds, fromId, toId) => void     // drag target
dragOverPlayerId: string | 'shared' | null
onDragOverChange: (id) => void
sharedLootCount: number
sharedLootName?: string
campaignName: string
campaignId: string
campaignPassword: string
isGM: boolean
totalSlots: number
onUpdateCampaignSettings?: (updates: { name, password }) => Promise<void>   // GM only
currentUserId: string
onUpdateMyCharacterProfile?: (updates: { name, avatar }) => Promise<void>   // player only
onTutorialStart?: () => void
```

Contains two internal modals (same file):
- `VaultSettingsModal` — GM: rename vault, change password, kick players. Has "Inventory Help & Tutorial" button.
- `CharacterNameModal` — Player: change display name + avatar. Has "Inventory Help & Tutorial" button.
Both modals call `onClose(); onTutorialStart?.()` on tutorial button click.

### `AddItemModal.tsx`
Modal for adding items. Searches `2024master.json` SRD catalog via fuse.js. Shows last-added notification.

### `ItemDetailsModal.tsx`
Full item details. GM can edit/delete. Player can toggle hidden/attunement. Integrates 2024 SRD data.

## Modal Components

### `ConfirmDeleteModal.tsx`
Generic confirm dialog. Message `<p>` has `whitespace-pre-line` — supports multi-line messages with `\n`.
Props: `title, message, onConfirm, onCancel, confirmLabel?, cancelLabel?`

### `TransferRequestModal.tsx`
Exports (all from same file):
- `TransferRequestModal` — incoming item transfer popup (countdown, accept/decline)
- `TransferSentToast` — sender's toast with cancel button
- `TransferExpiredToast` — expired transfer notification
- `RemoveItemUndoToast` — undo toast for remove/sell actions
- `CoinTransferRequestModal` — incoming coin transfer popup (same pattern as TransferRequestModal)

`CoinTransferRequestModal` props: `{ request: CoinTransferRequest, onAccept, onReject }`
Helper `formatCoins(amounts: Currency): string` inside this file.

## Tutorial Components
- `VaultTutorial.tsx` + `useVaultTutorial` hook — step-by-step overlay. `startTutorial` called from PlayerSidebar settings modals.
- `VaultsTutorial.tsx` — lobby page tutorial

## Utility Components
- `ActionErrorToast.tsx` — error toast with retry; used for Firebase action failures

## Subfolders
- `skeletons/` — `SkeletonLoader.tsx` exports `VaultDetailSkeleton`, `VaultListSkeleton`
- `ui/` — Radix/shadcn primitives — do not modify
