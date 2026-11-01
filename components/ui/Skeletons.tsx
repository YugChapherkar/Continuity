import React from 'react';

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="h-5 w-40 bg-slate-200 rounded-md" />
        <div className="h-8 w-24 bg-slate-200 rounded-full" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-2/3 hidden sm:block" />
              <div className="h-4 bg-slate-200 rounded w-1/3 hidden sm:block" />
            </div>
            <div className="w-16 h-6 rounded-full bg-slate-100 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3.5 bg-slate-100 rounded w-16" />
            <div className="h-3.5 bg-slate-200 rounded w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-20" />
            <div className="h-7 bg-slate-300 rounded w-14" />
            <div className="h-3 bg-slate-100 rounded w-28" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
        </div>
      ))}
    </div>
  );
}

