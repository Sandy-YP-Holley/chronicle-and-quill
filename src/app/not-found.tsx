import React from "react";
import Link from "next/link";
import { Feather, BookOpen, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-xl border border-[#E5E7EB] shadow-md relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F5F0E8] border border-[#D97706]/50 flex items-center justify-center text-[#7C2D12] mb-6 shadow-xs">
          <Feather className="w-8 h-8 text-[#D97706]" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-[#7C2D12] uppercase bg-[#F5F0E8] px-3 py-1 rounded-full border border-[#D97706]/40">
          Folio 404 &bull; Missing Record
        </span>

        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1C1917] mt-4 mb-3">
          Lost in the Archives
        </h1>

        <p className="text-xs sm:text-sm text-[#44403C] font-serif leading-relaxed mb-8">
          The requested historical folio or manuscript does not exist in our stacks. It may have been retired to deep preservation or cataloged under a different accession number.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/books"
            className="flex items-center justify-center gap-2 bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider hover:bg-[#9A3412] transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            <span>The Stacks</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 bg-[#F5F0E8] text-[#1C1917] border border-[#E5E7EB] hover:border-[#D97706] px-5 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <Search className="w-4 h-4 text-stone-500" />
            <span>Search Catalog</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#F5F0E8] text-[#1C1917] border border-[#E5E7EB] hover:border-[#D97706] px-5 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
