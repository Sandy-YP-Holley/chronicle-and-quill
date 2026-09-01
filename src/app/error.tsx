"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-xl border border-red-200 shadow-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 border border-red-300 flex items-center justify-center text-red-700 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-red-800 uppercase bg-red-50 px-3 py-1 rounded-full border border-red-200">
          Archival System Anomaly
        </span>

        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1C1917] mt-4 mb-3">
          Preservation Error
        </h1>

        <p className="text-xs sm:text-sm text-[#44403C] font-serif leading-relaxed mb-8">
          An unexpected error occurred while fetching or rendering the archive. You can try refreshing the connection to the stacks or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider hover:bg-[#9A3412] transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-[#D97706]" />
            <span>Retry Connection</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#F5F0E8] text-[#1C1917] border border-[#E5E7EB] hover:border-[#D97706] px-5 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
