import React from 'react';

interface SkeletonProps {
  className?: string;
  pulse?: boolean;
}

export function Skeleton({ className = '', pulse = true }: SkeletonProps) {
  return (
    <div
      className={`bg-[#DCC8A8]/40 rounded ${pulse ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

export function VaultListSkeleton() {
  return (
    <div className="min-h-full bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      <div className="max-w-7xl mx-auto px-6 py-8 pt-8">
        {/* Create/Join Vault Section Skeleton */}
        <div className="mb-8">
          <div className="w-full bg-[#F5EFE0]/50 border-4 border-[#8B6F47]/30 border-dashed rounded-xl p-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="text-center space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>

        {/* Vaults Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/40 backdrop-blur rounded-xl border-2 border-[#DCC8A8]/50 p-6 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VaultDetailSkeleton() {
  return (
    <div className="h-full bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:h-full sm:overflow-hidden">
        {/* PlayerSidebar Skeleton */}
        <div className="w-full sm:w-80 bg-white/30 backdrop-blur border-r-4 border-[#8B6F47]/50 p-6 flex flex-col">
          {/* Campaign Header */}
          <div className="mb-6 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Shared Loot */}
          <div className="mb-4">
            <div className="bg-[#F5EFE0]/50 border-2 border-[#8B6F47]/40 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-8 ml-auto" />
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-3 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#F5EFE0]/50 border-2 border-[#8B6F47]/40 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* InventoryView Skeleton */}
        <div className="flex-1 min-w-0 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-24 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/40 backdrop-blur border-2 border-[#DCC8A8]/50 rounded-xl p-4 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="w-4 h-4 rounded" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}