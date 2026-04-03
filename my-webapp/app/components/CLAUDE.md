# Components (`app/components/`)

All React client components. Import with `@/app/components/ComponentName`.

## Main Feature Components
- `AddItemModal.tsx` — Modal for adding items to a player's inventory. Searches `2024master.json` SRD catalog via fuse.js, allows custom items, handles quantity/weight/value/attunement. Shows last-added item notification.
- `ItemDetailsModal.tsx` — Modal showing full item details; GM can edit/delete, player can view. Integrates 2024 SRD item data.
- `InventoryView.tsx` — Main inventory grid/list for a campaign. Renders ItemCards, handles drag-and-drop between players.
- `ItemCard.tsx` — Single item card; shows name, rarity, quantity, category icon. Draggable.
- `PlayerSidebar.tsx` — Sidebar showing all players in a campaign, currency totals, weight.
- `VaultLobby.tsx` — Campaign lobby UI: list of vaults, create/join/delete/leave actions.
- `CategoryFilter.tsx` — Filter bar for item categories.
- `Navigation.tsx` — Top nav bar with role switcher and user menu.
- `LayoutContent.tsx` — Root layout wrapper (wraps pages with nav + sidebar).

## Modal Components
- `CampaignIdModal.tsx` — Shows the shareable campaign ID after creation.
- `ConfirmDeleteModal.tsx` — Generic confirmation dialog for destructive actions.
- `TransferRequestModal.tsx` — Player requests item transfer to another player; GM approves.

## Tutorial Components
- `VaultTutorial.tsx` — Step-by-step tutorial overlay for the campaign inventory view.
- `VaultsTutorial.tsx` — Tutorial for the vaults lobby page.

## Utility Components
- `ActionErrorToast.tsx` — Error toast with retry button; used for Firebase action failures.

## Subfolders
- `skeletons/` — Skeleton loaders (e.g. `SkeletonLoader.tsx` with `VaultListSkeleton`)
- `ui/` — Radix/shadcn primitives (button, dialog, card, badge, input, etc.) — do not modify these unless fixing a bug
