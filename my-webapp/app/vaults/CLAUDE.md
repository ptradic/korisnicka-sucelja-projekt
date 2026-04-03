# Vaults (`app/vaults/`)

The core app section. Requires authentication.

## Files
- `VaultAuthProvider.tsx` — Context provider wrapping all vault routes. Exposes: `userId`, `userName`, `userRole`, `setUserRole`, `isAuthenticated`, `isLoading`, `trackWrite`, `showActionError`. Handles Firebase auth state + write rate limiting + error toast triggering.
- `layout.tsx` — Wraps vault routes with `VaultAuthProvider`; redirects unauthenticated users to `/login`.
- `page.tsx` — Vaults lobby (`/vaults`). Lists campaigns, lets GM create/delete, player join/leave. Shows `VaultsTutorial` on first visit.

## Subfolders
- `[campaignId]/` — Individual campaign view. Contains the full inventory management screen: player tabs, item grid, drag-and-drop, GM controls.
