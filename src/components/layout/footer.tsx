"use client";

import React from "react";
import Link from "next/link";
import { Feather, ShieldCheck, Database, Lock, Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1C1917] text-[#EDE4D3] border-t border-[#D97706]/40 mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-9 h-9 rounded-md bg-[#7C2D12] flex items-center justify-center text-[#FBF9F5] border border-[#D97706]/60">
                <Feather className="w-5 h-5 text-[#D97706]" />
              </div>
              <span className="font-cinzel text-xl font-bold tracking-tight text-[#FBF9F5]">
                Chronicle &amp; Quill
              </span>
            </Link>
            <p className="text-stone-400 font-serif text-xs sm:text-sm leading-relaxed max-w-sm mb-6">
              A curated historical repository and archival press dedicated to preserving foundational manuscripts, classical treatises, and historiographical masterworks from antiquity through modern civilization.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" /> Archival Provenance
              </span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Atlas Resilient
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Anti-IDOR Protected
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-[#D97706] font-bold mb-4">
              Historical Epochs
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-400 font-serif">
              <li>
                <Link href="/books?period=Antiquity" className="hover:text-[#FBF9F5] transition-colors">
                  Classical Antiquity
                </Link>
              </li>
              <li>
                <Link href="/books?period=Medieval" className="hover:text-[#FBF9F5] transition-colors">
                  Medieval &amp; Islamic Golden Age
                </Link>
              </li>
              <li>
                <Link href="/books?period=Early%20Modern" className="hover:text-[#FBF9F5] transition-colors">
                  Renaissance &amp; Enlightenment
                </Link>
              </li>
              <li>
                <Link href="/books?period=20th%20Century" className="hover:text-[#FBF9F5] transition-colors">
                  20th Century Historiography
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-[#D97706] font-bold mb-4">
              The Archive
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-400 font-serif">
              <li>
                <Link href="/books" className="hover:text-[#FBF9F5] transition-colors">
                  The Complete Stacks
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#FBF9F5] transition-colors">
                  Catalog Search
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#FBF9F5] transition-colors">
                  Saved Folios
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#FBF9F5] transition-colors">
                  Current Archival Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-[#D97706] font-bold mb-4">
              Scholar Portal
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-400 font-serif">
              <li>
                <Link href="/account" className="hover:text-[#FBF9F5] transition-colors">
                  Scholar Account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#FBF9F5] transition-colors">
                  Order Inquiries &amp; Status
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#FBF9F5] transition-colors">
                  Scholar Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#FBF9F5] transition-colors">
                  Create Guild Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-serif">
          <p>
            MMXXVI &bull; Chronicle &amp; Quill Historical Bookstore. Engineered with Next.js, Tailwind CSS &amp; MongoDB Atlas.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-stone-400">
            <span className="flex items-center gap-1 text-amber-500/90">
              <Scale className="w-3.5 h-3.5" />
              <span>Simulated Store — No Real Cards Processed</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
