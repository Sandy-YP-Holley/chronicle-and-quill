import React from "react";

export function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden flex flex-col animate-pulse">
      <div className="h-64 sm:h-72 w-full bg-stone-200" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-1/3 bg-stone-200 rounded" />
          <div className="h-5 w-3/4 bg-stone-200 rounded" />
          <div className="h-3 w-full bg-stone-200 rounded" />
          <div className="h-3 w-5/6 bg-stone-200 rounded" />
        </div>
        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="h-6 w-16 bg-stone-200 rounded" />
          <div className="h-8 w-24 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}
