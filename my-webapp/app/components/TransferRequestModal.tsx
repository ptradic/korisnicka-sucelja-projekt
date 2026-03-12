"use client";

import { useState, useEffect, useRef } from 'react';
import { Package, ArrowRight, Check, X, AlertCircle, Clock } from 'lucide-react';
import type { TransferRequest } from '@/src/firebaseService';
import { useCountdown } from '@/app/hooks/useCountdown';
import { Timestamp } from 'firebase/firestore';

const AUTO_REJECT_TIMEOUT = 10; // seconds (fallback)

// Helper to calculate remaining time from server expiration
function getRemainingSeconds(expiresAt: any): number {
  if (!expiresAt) return AUTO_REJECT_TIMEOUT;
  const expirationDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
  const remaining = Math.ceil((expirationDate.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}

interface TransferRequestModalProps {
  request: TransferRequest;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  uncommon: 'bg-green-100 text-green-700 border-green-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  'very rare': 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300',
  artifact: 'bg-red-100 text-red-700 border-red-300',
};

export function TransferRequestModal({ request, onAccept, onReject }: TransferRequestModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(() => getRemainingSeconds(request.expiresAt));
  const hasAutoRejected = useRef(false);

  // Reset state and calculate remaining time when request changes
  useEffect(() => {
    setIsProcessing(false);
    setError(null);
    setTimeLeft(getRemainingSeconds(request.expiresAt));
    hasAutoRejected.current = false;
  }, [request.id, request.expiresAt]);

  // Auto-reject timer - synced with server expiration
  useEffect(() => {
    if (isProcessing) return;

    const interval = setInterval(() => {
      const remaining = getRemainingSeconds(request.expiresAt);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, request.id, request.expiresAt]);

  // Auto-reject when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !isProcessing && !hasAutoRejected.current) {
      hasAutoRejected.current = true;
      handleReject();
    }
  }, [timeLeft, isProcessing]);

  const handleAccept = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await onAccept();
    } catch (err: any) {
      setError(err.message || 'Failed to accept transfer');
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await onReject();
    } catch (err: any) {
      setError(err.message || 'Failed to reject transfer');
      setIsProcessing(false);
    }
  };

  const rarityClass = RARITY_COLORS[request.itemRarity] || RARITY_COLORS.common;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleReject} />
      
      {/* Modal */}
      <div className="relative bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Countdown timer */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
          <Clock className="w-4 h-4 text-[#5C1A1A]" />
          <span className={`text-sm font-bold ${timeLeft <= 2 ? 'text-red-600' : 'text-[#5C1A1A]'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#5C1A1A]/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-[#5C1A1A]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#3D1409]">Item Transfer Request</h2>
            <p className="text-sm text-[#8B6F47]">Someone wants to give you an item</p>
          </div>
        </div>

        {/* Transfer details */}
        <div className="bg-white/60 border-2 border-[#8B6F47]/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#5C1A1A] text-white flex items-center justify-center mx-auto mb-1 font-bold">
                {request.fromPlayerName.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-[#3D1409] max-w-20 truncate">{request.fromPlayerName}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-[#8B6F47]" />
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#3D1409] text-white flex items-center justify-center mx-auto mb-1 font-bold">
                {request.toPlayerName.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-[#3D1409] max-w-20 truncate">{request.toPlayerName}</p>
              <p className="text-[10px] text-[#8B6F47]">(You)</p>
            </div>
          </div>

          {/* Item info */}
          <div className="border-t border-[#8B6F47]/20 pt-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${rarityClass}`}>
                {request.itemRarity}
              </span>
              <span className="text-xs text-[#8B6F47] capitalize">{request.itemCategory}</span>
            </div>
            <p className="font-bold text-[#3D1409]">{request.itemName}</p>
            <p className="text-sm text-[#8B6F47]">Quantity: {request.quantity}</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-3 border-[#8B6F47] hover:border-red-500 hover:bg-red-50 text-[#3D1409] font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
            <span>Decline</span>
          </button>
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-semibold rounded-xl transition-all duration-200 border-3 border-[#3D1409] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Accept'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast notification for sent transfer requests
interface TransferSentToastProps {
  playerName: string;
  itemName: string;
  expiresAt: Date;
  onDismiss: () => void;
}

export function TransferSentToast({ playerName, itemName, expiresAt, onDismiss }: TransferSentToastProps) {
  const expiresAtTimestamp = Timestamp.fromDate(expiresAt);
  const { formattedTime, isExpired } = useCountdown(expiresAtTimestamp);

  // Auto-dismiss when expired (without showing expired state)
  useEffect(() => {
    if (isExpired) {
      onDismiss();
    }
  }, [isExpired, onDismiss]);

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
      <div className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl shadow-xl border-2 flex items-start gap-2 sm:gap-3 transition-colors bg-[#5C1A1A] border-[#3D1409] text-white">
        <Package className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold leading-tight">
            Transfer Sent
          </p>
          <p className="text-xs text-white/80 leading-tight">
            To {playerName}: {itemName}
          </p>
        </div>
        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded text-xs font-mono shrink-0">
          <Clock className="w-3 h-3" />
          <span className="hidden sm:inline">{formattedTime}</span>
          <span className="sm:hidden">{formattedTime.split(':')[1]}s</span>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast notification for expired transfer requests
interface TransferExpiredToastProps {
  playerName: string;
  itemName: string;
  isReceiver?: boolean; // true if this user was meant to receive the item
  onDismiss: () => void;
}

export function TransferExpiredToast({ playerName, itemName, isReceiver, onDismiss }: TransferExpiredToastProps) {
  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
      <div className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl shadow-xl border-2 flex items-start gap-2 sm:gap-3 transition-colors bg-[#8B6F47] border-[#6B5535] text-white">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 sm:mt-0 text-orange-300" />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold leading-tight">
            Transfer Expired
          </p>
          <p className="text-xs text-white/80 leading-tight">
            {isReceiver 
              ? `${itemName} from ${playerName} expired`
              : `${itemName} to ${playerName} expired and returned`
            }
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
