import { Suspense } from 'react';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      {/* Minimal fallback - the page component will show its own skeleton very quickly */}
    </div>
  );
}

export default function VaultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}
