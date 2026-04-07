import React from 'react';

interface SkeletonProps {
  className?: string;
  pulse?: boolean;
}

export function Skeleton({ className = '', pulse = true }: SkeletonProps) {
  return (
    <div
      className={`bg-[#5C1A1A]/40 rounded ${pulse ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

function SkeletonLight({ className = '', pulse = true }: SkeletonProps) {
  return (
    <div
      className={`bg-[#F5EDE0]/15 rounded ${pulse ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

export function VaultListSkeleton() {
  return (
    <main
      className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center overflow-hidden relative"
      style={{
        background: 'linear-gradient(to bottom, #3D1409 0%, #5C1A1A 40%, #7A2424 70%, #5C1A1A 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Diamond pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='%23F5EDE0' fill-opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundSize: '40px 40px',
        }}
      />

      {/* Role Tabs Skeleton */}
      <div className="relative z-10 w-full px-6 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex w-full gap-3">
            <SkeletonLight className="h-11 flex-1 rounded-xl" />
            <SkeletonLight className="h-11 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Create/Join Button Skeleton */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4">
        <div className="border-2 border-dashed border-[#F5EDE0]/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <SkeletonLight className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <SkeletonLight className="h-4 w-48" />
              <SkeletonLight className="h-3 w-36" />
            </div>
          </div>
        </div>

        {/* Vaults List/Grid Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SkeletonLight className="h-5 w-5 rounded" />
            <SkeletonLight className="h-5 w-40" />
            <SkeletonLight className="h-4 w-8" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#F5EFE0] rounded-xl p-4" style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}>
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="w-3.5 h-3.5 rounded" />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-3.5 h-3.5 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-3.5 h-3.5 rounded" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="pt-2 border-t border-[#D9C7AA]">
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export function VaultDetailSkeleton() {
  return (
    <div
      className="h-full overflow-hidden flex flex-col sm:flex-row relative"
      style={{
        background: 'linear-gradient(to bottom, #3D1409 0%, #5C1A1A 40%, #7A2424 70%, #5C1A1A 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Diamond pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='%23F5EDE0' fill-opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundSize: '40px 40px',
        }}
      />

      {/* Mobile tab bar (sm:hidden) */}
      <div className="relative z-10 sm:hidden shrink-0 bg-[#3D1409]/80 backdrop-blur-sm border-b-4 border-[#5C1A1A]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#F5EDE0]/10">
          <SkeletonLight className="h-4 w-40" />
          <SkeletonLight className="h-6 w-20 rounded-md" />
        </div>
        <div className="flex gap-2 px-3 py-2 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLight key={i} className={`h-9 rounded-full shrink-0 ${i === 1 ? 'w-24' : 'w-20'}`} />
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="relative z-10 hidden sm:flex w-52 bg-[#3D1409]/80 backdrop-blur-sm border-r-4 border-[#5C1A1A] p-3 flex-col shrink-0">
        <div className="mb-3 space-y-2">
          <SkeletonLight className="h-5 w-3/4" />
          <SkeletonLight className="h-4 w-1/2" />
        </div>
        <div className="space-y-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLight key={i} className="h-11 w-full rounded-full" />
          ))}
        </div>
      </div>

      {/* InventoryView area */}
      <div className="relative z-10 flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-5 pt-4 pb-2 flex items-start justify-between">
          <div className="space-y-1.5">
            <SkeletonLight className="h-5 w-28 rounded-lg" />
            <SkeletonLight className="h-3.5 w-16 rounded-lg" />
          </div>
          <SkeletonLight className="h-5 w-16 rounded-full" />
        </div>

        {/* Coins row */}
        <div className="shrink-0 mx-4 sm:mx-5 mb-3">
          <div className="bg-[#F5EFE0] rounded-xl px-4 py-3 flex items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(61, 20, 9, 0.25)' }}>
            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-6 rounded" />
                <Skeleton className="h-3.5 w-6 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Weight bar */}
        <div className="shrink-0 mx-4 sm:mx-5 mb-3">
          <div className="bg-[#F5EFE0] rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ boxShadow: '0 4px 20px rgba(61, 20, 9, 0.25)' }}>
            <Skeleton className="w-4 h-4 rounded shrink-0" />
            <Skeleton className="flex-1 h-2 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
        </div>

        {/* Search + filter buttons */}
        <div className="shrink-0 px-4 sm:px-5 mb-2 flex gap-2">
          <div className="flex-1 bg-[#F5EFE0] rounded-xl h-10" style={{ boxShadow: '0 4px 20px rgba(61, 20, 9, 0.25)' }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-10 h-10 bg-[#F5EFE0] rounded-xl shrink-0" style={{ boxShadow: '0 4px 20px rgba(61, 20, 9, 0.25)' }} />
          ))}
        </div>

        {/* Item list */}
        <div className="flex-1 min-h-0 px-4 sm:px-5 py-2 space-y-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#F5EFE0] rounded-xl px-3 py-2.5 flex items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(61, 20, 9, 0.25)' }}>
              <Skeleton className="w-4 h-4 rounded shrink-0" />
              <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <Skeleton className="h-3.5 w-12 rounded shrink-0" />
            </div>
          ))}
        </div>

        {/* Add Item button */}
        <div className="shrink-0 px-4 sm:px-5 pb-3 pt-2">
          <div className="border-2 border-dashed border-[#F5EDE0]/30 rounded-xl h-11" />
        </div>
      </div>
    </div>
  );
}
