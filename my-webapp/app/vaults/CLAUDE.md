# Vaults (`app/vaults/`)

The core app section. Requires authentication.

## Files

### `VaultAuthProvider.tsx`
Context provider wrapping all vault routes. Import hook with `useVaultAuth()`.

**`useVaultAuth()` returns:**
```ts
userId: string
userName: string
userRole: 'gm' | 'player'
setUserRole: (role) => void
userHomebrew: Item[]                  // user's personal homebrew items
setUserHomebrew: Dispatch<SetStateAction<Item[]>>
isAuthenticated: boolean
isLoading: boolean
pendingWriteCount: number             // >0 means save in progress → syncStatus='saving'
trackWrite: <T>(fn: () => Promise<T>) => Promise<T>   // wraps any Firestore write; increments pendingWriteCount
showActionError: (title, error, onRetry?, retryLabel?) => void  // shows ActionErrorToast
setActionError: (error: VaultActionError | null) => void
```

**Pattern — every handler uses `trackWrite` + `showActionError`:**
```ts
const handleSomething = async () => {
  try {
    await trackWrite(() => someFirebaseFunction(...));
  } catch (error) {
    showActionError('Could not do thing', error, () => handleSomething());
  }
};
```

`getFirebaseErrorMessage(error, fallback)` — exported helper that maps Firebase error codes to user-friendly strings (permission-denied, network errors, etc.)

### `layout.tsx`
Wraps vault routes with `VaultAuthProvider`; redirects unauthenticated users to `/login`.

### `page.tsx` (Lobby — `/vaults`)
Lists all campaigns for the current user. GM can create/delete vaults. Player can join/leave.
Shows `VaultsTutorial` on first visit (localStorage flag).
Uses `getUserCampaigns(uid, role)` from firebaseService — no real-time subscription, refetches on action.

## Subfolders
- `[campaignId]/` — Individual campaign view. Full inventory management screen. See `[id]/CLAUDE.md` for detailed structure (state, handlers, JSX layout, line ranges).
