'use client';

import { useRef, useEffect } from 'react';
import { useCustomScrollbar } from '../hooks/useCustomScrollbar';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pageScrollRef = useRef<HTMLDivElement | null>(null);

  const {
    showScrollbar,
    thumbTop,
    thumbHeight,
    trackRef,
    handleTrackClick,
    handleThumbMouseDown,
  } = useCustomScrollbar(pageScrollRef);

  // Use window.innerHeight to set a CSS variable that reflects the true
  // visible viewport on all platforms (browser, PWA, Android nav bar, etc.)
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  return (
    <div className="relative mt-16 md:mt-14 h-[calc(var(--app-height,100dvh)-4rem)] md:h-[calc(var(--app-height,100dvh)-3.5rem)]">
      <div id="page-scroll" ref={pageScrollRef} className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        {children}
      </div>

      {showScrollbar && (
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="hidden md:flex absolute top-2 right-0.5 bottom-2 w-3.5 items-stretch cursor-pointer z-20"
        >
          <div
            onMouseDown={handleThumbMouseDown}
            className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
            style={{
              top: `${thumbTop}px`,
              height: `${thumbHeight}px`,
            }}
          />
        </div>
      )}
    </div>
  );
}
