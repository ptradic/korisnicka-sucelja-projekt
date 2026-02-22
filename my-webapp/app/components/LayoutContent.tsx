'use client';

import { usePathname } from 'next/navigation';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Add padding on all pages since nav is always visible or completely hidden
  const isHomePage = pathname === '/' || pathname === '/guides' || pathname === '/support';

  return (
    <div className={isHomePage ? 'pt-16' : ''}>
      {children}
    </div>
  );
}
