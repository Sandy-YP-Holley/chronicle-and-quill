"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Database, Lock } from "lucide-react";

export function HeaderBanner() {
  return (
    <aside
      className="bg-[#1C1917] text-[#EDE4D3] text-xs py-2 px-4 border-b border-[#D97706]/40 sticky top-0 z-50 select-none"
      aria-label="Portfolio Demonstration Notice"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D97706] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97706]"></span>
          </span>
          <span className="font-cinzel tracking-wider uppercase font-bold text-[#F59E0B]">
            Portfolio Demonstration Mode
          </span>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="text-stone-300 font-serif text-[11px] sm:text-xs">
            Free-Tier Simulated Historical Store — No real credit cards or payments processed.
          </span>
        </div>

        <div className="hidden md:flex items-center gap-5 text-stone-300 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>MongoDB Atlas Free Tier</span>
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Stateless Jose Auth</span>
          </span>
          <Link
            href="/#foundation"
            className="text-[#D97706] hover:text-[#F59E0B] underline underline-offset-2 transition-colors flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Architecture Specs</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
