import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

interface UseCountdownResult {
  timeLeft: number; // seconds remaining
  isExpired: boolean;
  formattedTime: string; // "0:05" format
}

export function useCountdown(expiresAt: Timestamp): UseCountdownResult {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const expirationTime = expiresAt.toMillis();
      const remainingMs = expirationTime - now;
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        return;
      }

      setTimeLeft(remainingSeconds);
      setIsExpired(false);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formattedTime = (() => {
    if (timeLeft <= 0) return '0:00';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  })();

  return {
    timeLeft,
    isExpired,
    formattedTime,
  };
}