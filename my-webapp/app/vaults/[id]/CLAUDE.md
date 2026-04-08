# Campaign Detail Page (`app/vaults/[id]/page.tsx`)

The main app screen. One large file (~1200 lines). **Read it in targeted sections using offset/limit — never read the whole file at once.**

## File Layout (approximate line ranges)
- 1–53: Imports
- 54–122: DnD config, stack signature helper, TouchDragPreview
- 124–160: Component start, state variables
- 162–375: Effects (subscriptions, expiration, cleanup)
- 376–990: Handlers
- 992–1138: Render/JSX

## State Variables (lines ~138–154)
```
currentCampaign: CampaignDoc | null
playerInventories: PlayerInventoryDoc[]
selectedPlayerId: string | 'shared'
isCampaignLoading: boolean
showAddItemModal: boolean
selectedItem: Item | null
dragOverPlayerId: string | 'shared' | null
pendingTransferRequests: TransferRequest[]
pendingCoinTransferRequests: CoinTransferRequest[]
coinTransferSentInfo: { requestId, playerName, expiresAt } | null
transferSentInfo: { requestIds, playerName, itemLabel, expiresAt } | null
expiredTransferInfo: { playerName, itemName, isReceiver } | null
undoRemoveInfo: { itemName, restore: () => Promise<void> } | null
```

## Effects (lines ~162–375)
1. Initial campaign load + access check
2. Real-time subscriptions (campaign + player inventories)
3. Incoming item transfer requests (player only)
4. Rejected/expired item transfers — auto-restore sender
5. Pending transfers from me — expiration check
6. Periodic expiration check (every 2s)
6b. Incoming coin transfer requests (player only)
6c. Rejected/expired coin transfers — auto-restore sender
7. GM cleanup: remove stale inventory docs
8. Auto-select player when selection becomes invalid

## Key Derived Values (lines ~378–384)
```
selectedPlayer = players.find(p => p.id === selectedPlayerId)
isShared = selectedPlayerId === 'shared'
isGM = userRole === 'gm'
syncStatus: 'saving' | 'saved'
sharedLootEnabled = currentCampaign?.sharedLootEnabled !== false   // undefined/true = shown
```

## Handlers (lines ~386–990)
- `handleMoveItem(itemIds, fromId, toId)` — drag/drop; player-to-player triggers TransferRequest
- `handleAcceptTransfer(request)` / `handleRejectTransfer(request)` / `handleCancelSentTransfer(requestIds[])`
- `handleSendCoins(amounts)` — creates CoinTransferRequest; only available when `!isGM && !isShared && selectedPlayerId !== userId`
- `handleAcceptCoinTransfer(request)` / `handleRejectCoinTransfer(request)`
- `handleCurrencyChange(playerId, currency)`
- `handleSharedCoinTransfer(amounts)` — deposit/withdraw from shared loot
- `handleMaxWeightChange(playerId, newMax)`
- `handleAddItem(item)` — stacks if same signature
- `handleCreateHomebrew` / `handleImportHomebrew` / `handleSaveCustomItemPool` / `handleUpdateHomebrewItem` / `handleDeleteHomebrewItem`
- `handleRenameSharedLoot(name)`
- `handleUpdateSelectedItem(baseItem, updates)` — players can only edit PLAYER CUSTOM items
- `handleReorderInventory(newInventory)`
- `handleDeleteSelectedItem(baseItem)` — single item delete with undo toast
- `handleBulkRemoveItems(itemIdsWithCounts[])` — bulk delete with undo toast
- `handleSellItems(itemIdsWithCounts[], earnings)` — removes items, adds earnings to currency, undo toast
- `handleToggleSharedLoot(enabled)` — calls `updateSharedLootEnabled`, updates `currentCampaign` state locally
- `handleUpdateCampaignSettings(updates)` / `handleKickPlayer(playerId)` / `handleUpdateMyCharacterProfile(updates)`

## JSX Structure (lines ~1002–1138)
```
<DndProvider>
  <TouchDragPreview />
  <div> (bg gradient)
    <PlayerSidebar ... />
    <InventoryView ... />

    {showAddItemModal && <AddItemModal />}
    {selectedItem && <ItemDetailsModal />}
    {pendingTransferRequests.length > 0 && <TransferRequestModal />}
    {pendingCoinTransferRequests.length > 0 && <CoinTransferRequestModal />}
    {transferSentInfo && <TransferSentToast />}
    {expiredTransferInfo && <TransferExpiredToast />}
    {undoRemoveInfo && <RemoveItemUndoToast />}
    {showTutorial && <VaultTutorial />}
  </div>
</DndProvider>
```

## Adding a New Feature — Checklist
1. Add state variable in the state block (~line 138)
2. Add effect in the effects block (~line 162) if it needs a subscription
3. Add handler function in the handlers block (~line 386)
4. Pass props to InventoryView or render modal in JSX (~line 1002)
5. If it needs a new Firestore collection: use `transferRequests` with a `type` field — **do NOT create new subcollections** (they won't have security rules)

## Firestore Security — CRITICAL
- Only `transferRequests` subcollection is allowed for player-to-player transfers
- CoinTransferRequest is stored in `transferRequests` with `type: 'coin'`
- Item transfer subscriptions skip docs where `type === 'coin'`; coin subscriptions skip docs without it
- Never write to a new subcollection without first adding it to Firestore rules in the Firebase console
