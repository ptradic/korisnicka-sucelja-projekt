'use client';

import { useRef } from 'react';
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

  return (
    <div className="relative mt-20 h-[calc(100vh-5rem)]">
      <div ref={pageScrollRef} className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        {children}
      </div>

      {showScrollbar && (
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="absolute top-2 right-0.5 bottom-2 w-3.5 flex items-stretch cursor-pointer z-20"
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
