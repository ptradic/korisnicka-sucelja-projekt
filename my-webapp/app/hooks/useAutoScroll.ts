import { useEffect, useRef } from 'react';
import { useDragLayer } from 'react-dnd';

interface UseAutoScrollOptions {
  scrollThreshold?: number; // pixels from top to trigger scroll (default: 100)
  scrollSpeed?: number; // pixels to scroll per frame (default: 10)
  enabled?: boolean; // whether auto-scroll is active (default: true)
}

/**
 * Hook that automatically scrolls the page when dragging items near the top
 * Uses react-dnd's useDragLayer to track drag position
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAutoScrollOptions = {}
) {
  const { scrollThreshold = 100, scrollSpeed = 10, enabled = true } = options;
  const { isDragging, clientOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing scroll interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (!isDragging || !clientOffset || !enabled || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const { y: dragY } = clientOffset;

    // Check if cursor is near the top of the container
    // dragY is absolute viewport coordinate, rect.top is container's position in viewport
    const distanceFromTop = dragY - rect.top;

    if (distanceFromTop >= 0 && distanceFromTop < scrollThreshold) {
      // Start scrolling up
      scrollIntervalRef.current = setInterval(() => {
        if (container) {
          container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
        }
      }, 16); // ~60fps
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [isDragging, clientOffset, scrollThreshold, scrollSpeed, enabled, containerRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);
}
