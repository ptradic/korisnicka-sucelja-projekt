import React from 'react';

interface SkeletonProps {
  className?: string;
  pulse?: boolean;
}

export function Skeleton({ className = '', pulse = true }: SkeletonProps) {
  return (
    <div
      className={`bg-[#8B6F47]/25 rounded ${pulse ? 'animate-pulse' : ''} ${className}`}
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
      className="flex min-h-screen flex-col items-center overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #3D1409 0vh, #5C1A1A 20vh, #7A2424 40vh, #C8A97A 60vh, #E8D5B7 75vh, #DCC8A8 100vh)',
      }}
    >
      {/* Role Tabs Skeleton */}
      <div className="w-full px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex w-full border-b-2 border-[#F5EDE0]/15 bg-white/5 backdrop-blur-sm overflow-hidden rounded-xl">
            <SkeletonLight className="h-11 flex-1" />
            <SkeletonLight className="h-11 flex-1" />
          </div>
        </div>
      </div>

      {/* Create/Join Button Skeleton */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-md mx-auto mb-8">
          <div className="border-2 border-dashed border-[#F5EDE0]/20 rounded-xl p-6 sm:p-8 bg-white/5 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <SkeletonLight className="w-12 h-12 rounded-full" />
              <SkeletonLight className="h-4 w-36 mx-auto" />
              <SkeletonLight className="h-3 w-48 mx-auto" />
            </div>
          </div>
        </div>

        {/* Vaults List/Grid Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 sm:h-7 w-28 sm:w-32" />
            <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
          </div>

          <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#F5EFE0] border-4 border-[#8B6F47]/30 rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
                      <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
                    </div>
                    <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded" />
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded" />
                      <Skeleton className="h-3.5 sm:h-4 w-7 sm:w-8" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded" />
                      <Skeleton className="h-3.5 sm:h-4 w-14 sm:w-16" />
                    </div>
                  </div>
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
    <div className="h-full bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden flex flex-col sm:flex-row">

      {/* ── Mobile: horizontal tab bar / Desktop: sidebar ── */}

      {/* Mobile tab bar (sm:hidden) */}
      <div className="sm:hidden shrink-0 bg-[#D9C7AA] border-b-4 border-[#3D1409]">
        {/* Campaign name row */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#8B6F47]/30">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        {/* Player tab pills */}
        <div className="flex gap-2 px-3 py-2 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className={`h-9 rounded-full shrink-0 ${i === 1 ? 'w-24' : 'w-20'}`} />
          ))}
        </div>
      </div>

      {/* Desktop sidebar (hidden on mobile) */}
      <div className="hidden sm:flex w-52 bg-[#D9C7AA] border-r-4 border-[#3D1409] p-3 flex-col shrink-0">
        <div className="mb-3 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-full" />
          ))}
        </div>
      </div>

      {/* ── InventoryView area ── */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {/* Header: name + saved */}
        <div className="shrink-0 px-4 sm:px-5 pt-4 pb-2 flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28 rounded-lg" />
            <Skeleton className="h-3.5 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Coins row */}
        <div className="shrink-0 mx-4 sm:mx-5 mb-3">
          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8]/50 rounded-xl px-4 py-3 flex items-center gap-3">
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
          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8]/50 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded shrink-0" />
            <Skeleton className="flex-1 h-2 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
        </div>

        {/* Search + filter buttons */}
        <div className="shrink-0 px-4 sm:px-5 mb-2 flex gap-2">
          <div className="flex-1 bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8]/50 rounded-xl h-10" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-10 h-10 bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8]/50 rounded-xl shrink-0" />
          ))}
        </div>

        {/* Item list */}
        <div className="flex-1 min-h-0 px-4 sm:px-5 py-2 space-y-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8]/50 rounded-xl px-3 py-2.5 flex items-center gap-3">
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
          <div className="bg-white/40 backdrop-blur-sm border-2 border-dashed border-[#DCC8A8]/70 rounded-xl h-11" />
        </div>
      </div>
    </div>
  );
}