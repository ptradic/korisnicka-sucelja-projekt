import { Suspense } from 'react';

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      <div className="text-xl font-semibold text-[#5C1A1A]">Loading...</div>
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
