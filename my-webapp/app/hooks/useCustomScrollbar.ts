import { useCallback, useEffect, useRef, useState } from 'react';

type UseCustomScrollbarResult = {
  showScrollbar: boolean;
  thumbTop: number;
  thumbHeight: number;
  trackRef: React.MutableRefObject<HTMLDivElement | null>;
  handleTrackClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleThumbMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export function useCustomScrollbar<T extends HTMLElement>(
  containerRef: React.MutableRefObject<T | null>
): UseCustomScrollbarResult {
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);

  const updateScrollbar = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasScroll = scrollHeight > clientHeight;
    setShowScrollbar(hasScroll);
    if (!hasScroll) {
      setThumbTop(0);
      setThumbHeight(0);
      return;
    }

    const trackH = Math.max(1, trackRef.current?.clientHeight ?? clientHeight);
    const ratio = clientHeight / scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const denom = Math.max(1, scrollHeight - clientHeight);
    const tTop = maxTop * (scrollTop / denom);

    setThumbHeight(tHeight);
    setThumbTop(tTop);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = () => updateScrollbar();
    const contentEl = el.firstElementChild;

    el.addEventListener('scroll', handler);
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
    const resizeObserver = new ResizeObserver(handler);
    resizeObserver.observe(el);
    if (contentEl instanceof Element) {
      resizeObserver.observe(contentEl);
    }

    const mutationObserver = new MutationObserver(handler);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    window.addEventListener('resize', handler);

    const timer = setTimeout(handler, 50);
    const raf1 = requestAnimationFrame(handler);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(handler));

    return () => {
      el.removeEventListener('scroll', handler);
      el.removeEventListener('input', handler);
      el.removeEventListener('change', handler);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', handler);
      clearTimeout(timer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [containerRef, updateScrollbar]);

  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const el = containerRef.current;
      if (!el) return;

      isDragging.current = true;
      dragStartY.current = e.clientY;
      dragStartTop.current = thumbTop;

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const curr = containerRef.current;
        const trackH = Math.max(1, trackRef.current?.clientHeight ?? curr.clientHeight);
        const ratio = curr.clientHeight / curr.scrollHeight;
        const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
        const maxTop = Math.max(0, trackH - tHeight);

        const delta = ev.clientY - dragStartY.current;
        const newTop = Math.min(maxTop, Math.max(0, dragStartTop.current + delta));
        const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
        curr.scrollTop = scrollRatio * Math.max(0, curr.scrollHeight - curr.clientHeight);
      };

      const onUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [containerRef, thumbTop]
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      const track = trackRef.current;
      if (!el || !track) return;

      const rect = track.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const trackH = Math.max(1, rect.height);
      const ratio = el.clientHeight / el.scrollHeight;
      const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
      const maxTop = Math.max(0, trackH - tHeight);
      const newTop = Math.min(maxTop, Math.max(0, clickY - tHeight / 2));
      const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
      el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
    },
    [containerRef]
  );

  return {
    showScrollbar,
    thumbTop,
    thumbHeight,
    trackRef,
    handleTrackClick,
    handleThumbMouseDown,
  };
}
