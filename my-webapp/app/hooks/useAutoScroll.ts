import { useEffect, useRef } from 'react';
import { useDragLayer } from 'react-dnd';

interface UseAutoScrollOptions {
  scrollThreshold?: number; // px from edge to start scrolling (default: 100)
  scrollSpeed?: number;     // px per frame (default: 10)
  enabled?: boolean;
}

/**
 * Scrolls a container when a react-dnd drag nears its top or bottom edge.
 * Works on both desktop (mouse) and mobile (touch) because react-dnd's
 * monitor.getClientOffset() reports position for both input types.
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAutoScrollOptions = {},
) {
  const { scrollThreshold = 100, scrollSpeed = 10, enabled = true } = options;

  const { isDragging, clientOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled || !isDragging || !clientOffset || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const { y } = clientOffset;

    const fromTop = y - rect.top;
    const fromBottom = rect.bottom - y;

    if (fromTop >= 0 && fromTop < scrollThreshold) {
      intervalRef.current = setInterval(() => {
        container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
      }, 16);
    } else if (fromBottom >= 0 && fromBottom < scrollThreshold) {
      intervalRef.current = setInterval(() => {
        container.scrollTop = Math.min(
          container.scrollHeight - container.clientHeight,
          container.scrollTop + scrollSpeed,
        );
      }, 16);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isDragging, clientOffset, scrollThreshold, scrollSpeed, enabled, containerRef]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
