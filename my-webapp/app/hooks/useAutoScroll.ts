import { useEffect, useRef, useState } from 'react';
import { useDragLayer } from 'react-dnd';

interface UseAutoScrollOptions {
  scrollThreshold?: number; // pixels from top to trigger scroll (default: 100)
  scrollSpeed?: number; // pixels to scroll per frame (default: 10)
  enabled?: boolean; // whether auto-scroll is active (default: true)
  scrollTarget?: 'container' | 'window'; // where to scroll (default: auto-detect based on screen size)
}

/**
 * Hook that automatically scrolls the page when dragging items near the top
 * Uses react-dnd's useDragLayer to track drag position on desktop
 * Also listens to touch events for mobile support
 * On mobile, scrolls the entire window; on desktop, scrolls the container
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAutoScrollOptions = {}
) {
  const { scrollThreshold = 100, scrollSpeed = 10, enabled = true, scrollTarget = 'auto' } = options;
  const [isMobile, setIsMobile] = useState(false);

  const { isDragging, clientOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchPositionRef = useRef<{ y: number } | null>(null);
  const isTouchDraggingRef = useRef(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch event handlers for mobile support
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const handleTouchStart = () => {
      isTouchDraggingRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTouchDraggingRef.current && e.touches.length > 0) {
        touchPositionRef.current = { y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      isTouchDraggingRef.current = false;
      touchPositionRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled]);

  // Main scroll logic
  useEffect(() => {
    // Clear any existing scroll interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (!enabled || !containerRef.current) {
      return;
    }

    // Use clientOffset from react-dnd (desktop) or touchPosition (mobile)
    const dragPosition = clientOffset || touchPositionRef.current;

    if (!isDragging || !dragPosition) {
      return;
    }

    const shouldScrollWindow = scrollTarget === 'window' || (scrollTarget === 'auto' && isMobile);
    const { y: dragY } = dragPosition;

    if (shouldScrollWindow) {
      // Scroll the entire window on mobile
      if (dragY < scrollThreshold) {
        scrollIntervalRef.current = setInterval(() => {
          window.scrollBy(0, -scrollSpeed);
        }, 16); // ~60fps
      }
    } else {
      // Scroll the container on desktop
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Check if cursor is near the top of the container
      const distanceFromTop = dragY - rect.top;

      if (distanceFromTop >= 0 && distanceFromTop < scrollThreshold) {
        scrollIntervalRef.current = setInterval(() => {
          if (container) {
            container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
          }
        }, 16); // ~60fps
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [isDragging, clientOffset, scrollThreshold, scrollSpeed, enabled, containerRef, isMobile, scrollTarget]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);
}
