"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ActionErrorToast } from '@/app/components/ActionErrorToast';
import type { Item } from '@/app/types';
import { onAuthChange, getUserDoc } from '@/src/firebaseService';

export type VaultActionError = {
  title: string;
  description: string;
  onRetry?: () => Promise<void> | void;
  retryLabel?: string;
};

export function getFirebaseErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : '';

  if (code.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
    return "You don't have permission to complete this action. Check your role or campaign ownership, then retry.";
  }

  if (
    code.includes('unavailable') ||
    code.includes('deadline-exceeded') ||
    code.includes('network-request-failed') ||
    /network|offline|timeout/i.test(message)
  ) {
    return 'Firebase could not be reached. Check your connection and retry the action.';
  }

  return message ? `${fallback} ${message}` : fallback;
}

interface VaultAuthContextType {
  userId: string;
  userName: string;
  userRole: 'gm' | 'player';
  setUserRole: (role: 'gm' | 'player') => void;
  userHomebrew: Item[];
  setUserHomebrew: React.Dispatch<React.SetStateAction<Item[]>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  trackWrite: <T>(writeOperation: () => Promise<T>) => Promise<T>;
  pendingWriteCount: number;
  showActionError: (title: string, error: unknown, onRetry?: () => Promise<void> | void, retryLabel?: string) => void;
  setActionError: (error: VaultActionError | null) => void;
}

const VaultAuthContext = createContext<VaultAuthContextType | null>(null);

export function useVaultAuth() {
  const ctx = useContext(VaultAuthContext);
  if (!ctx) throw new Error('useVaultAuth must be used within VaultAuthProvider');
  return ctx;
}

export function VaultAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'gm' | 'player'>('player');
  const [userHomebrew, setUserHomebrew] = useState<Item[]>([]);
  const [pendingWriteCount, setPendingWriteCount] = useState(0);
  const [actionError, setActionError] = useState<VaultActionError | null>(null);
  const [isRetryingAction, setIsRetryingAction] = useState(false);

  const trackWrite = useCallback(async <T,>(writeOperation: () => Promise<T>): Promise<T> => {
    setPendingWriteCount((count) => count + 1);
    try {
      return await writeOperation();
    } finally {
      setPendingWriteCount((count) => Math.max(0, count - 1));
    }
  }, []);

  const showActionError = useCallback((
    title: string,
    error: unknown,
    onRetry?: () => Promise<void> | void,
    retryLabel = 'Retry'
  ) => {
    setActionError({
      title,
      description: getFirebaseErrorMessage(error, 'The change was not saved.'),
      onRetry,
      retryLabel,
    });
  }, []);

  const handleRetryAction = async () => {
    if (!actionError?.onRetry) return;
    const retry = actionError.onRetry;
    setIsRetryingAction(true);
    setActionError(null);
    try {
      await retry();
    } finally {
      setIsRetryingAction(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getUserDoc(firebaseUser.uid);
        if (userDoc) {
          setIsAuthenticated(true);
          setUserId(firebaseUser.uid);
          setUserName(userDoc.name);
          setUserRole(userDoc.role);
          setUserHomebrew(userDoc.userHomebrew ?? []);
          setIsLoading(false);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <VaultAuthContext.Provider value={{
      userId, userName, userRole, setUserRole,
      userHomebrew, setUserHomebrew,
      isAuthenticated, isLoading,
      trackWrite, pendingWriteCount,
      showActionError, setActionError,
    }}>
      {children}
      {actionError && (
        <ActionErrorToast
          title={actionError.title}
          description={actionError.description}
          onDismiss={() => setActionError(null)}
          onRetry={actionError.onRetry ? () => void handleRetryAction() : undefined}
          retryLabel={actionError.retryLabel}
          retrying={isRetryingAction}
        />
      )}
    </VaultAuthContext.Provider>
  );
}
