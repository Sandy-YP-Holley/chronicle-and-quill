"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Sparkles,
  Database,
  Lock,
  Layers,
  FileCode2,
  Library,
  ArrowRight,
  Compass,
} from "lucide-react";
import { BookCard, BookCardData } from "@/components/books/book-card";
import { BookCardSkeleton } from "@/components/books/book-card-skeleton";

const HISTORICAL_EPOCHS = [
  { name: "All Stacks", period: "", count: 22 },
  { name: "Classical Antiquity", period: "Antiquity", dates: "c. 800 BCE – 500 CE", count: 6 },
  { name: "Medieval Era", period: "Medieval", dates: "500 – 1500 CE", count: 6 },
  { name: "Renaissance & Enlightenment", period: "Early Modern", dates: "1500 – 1900 CE", count: 5 },
  { name: "20th Century", period: "20th Century", dates: "1900 – 2000 CE", count: 5 },
];

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<BookCardData[]>([]);
  const [selectedEpoch, setSelectedEpoch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      try {
        setIsLoading(true);
        const url = selectedEpoch
          ? `/api/books?period=${encodeURIComponent(selectedEpoch)}&limit=6`
          : `/api/books?limit=6`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setFeaturedBooks(data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooks();
  }, [selectedEpoch]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#7C2D12] selection:text-[#FBF9F5] animate-fadeIn">
      <section className="relative pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#E5E7EB] bg-radial from-[#F5F0E8] via-[#FBF9F5] to-[#FBF9F5] overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D97706]/50 text-[#7C2D12] text-xs font-cinzel tracking-widest uppercase mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Primary Sources &bull; The Renaissance &amp; Antiquity</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cinzel font-bold text-[#1C1917] tracking-tight leading-[1.12] mb-6">
              Literature Preserved Through the Corridors of Time
            </h1>

            <p className="text-base sm:text-lg text-[#44403C] font-serif leading-relaxed mb-8 max-w-2xl mx-auto">
              From philosophical treatises of Classical Rome to monumental Renaissance historiography. Explore authentic archival reprints, leather-bound folios, and timeless historical literature.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/books"
                className="bg-[#7C2D12] text-[#FBF9F5] hover:bg-[#9A3412] px-6 py-3.5 rounded-md font-cinzel text-xs tracking-widest uppercase transition-all shadow-md flex items-center gap-2 border border-[#D97706]/40 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
              >
                <BookOpen className="w-4 h-4 text-[#D97706]" /> Explore the Stacks
              </Link>
              <Link
                href="/search"
                className="bg-[#F5F0E8] text-[#1C1917] hover:bg-[#EDE4D3] border border-[#D97706] px-6 py-3.5 rounded-md font-cinzel text-xs tracking-widest uppercase transition-all shadow-xs flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
              >
                <Search className="w-4 h-4 text-[#7C2D12]" /> Search Archives
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F0E8] border-b border-[#E5E7EB] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {HISTORICAL_EPOCHS.map((epoch, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedEpoch(epoch.period)}
              className={`px-4 py-2 rounded-full text-xs font-cinzel tracking-wider uppercase transition-all flex items-center gap-2 ${
                selectedEpoch === epoch.period
                  ? "bg-[#7C2D12] text-[#FBF9F5] shadow-xs"
                  : "bg-white text-[#44403C] border border-[#E5E7EB] hover:border-[#D97706] hover:text-[#7C2D12]"
              }`}
            >
              <span>{epoch.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedEpoch === epoch.period
                    ? "bg-[#D97706] text-[#1C1917] font-bold"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {epoch.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section id="catalog" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2 text-[#7C2D12] text-xs font-cinzel uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#1C1917]">
              {selectedEpoch ? `${selectedEpoch} Manuscripts` : "Featured Historical Folios"}
            </h2>
            <p className="text-xs sm:text-sm text-[#44403C] font-serif mt-1">
              Hand-curated historical volumes across four epochs with authenticated provenance.
            </p>
          </div>
          <Link
            href={selectedEpoch ? `/books?period=${encodeURIComponent(selectedEpoch)}` : "/books"}
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-cinzel text-[#7C2D12] hover:text-[#9A3412] tracking-wider uppercase font-bold transition-colors"
          >
            <span>View All in Stacks</span>
            <ArrowRight className="w-4 h-4 text-[#D97706]" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-[#E5E7EB] p-8">
            <BookOpen className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="font-cinzel text-base font-bold text-[#1C1917] mb-2">No volumes found</p>
            <p className="text-xs text-stone-500 font-serif mb-4">No books matched this epoch filter.</p>
            <button
              onClick={() => setSelectedEpoch("")}
              className="text-xs font-cinzel uppercase text-[#7C2D12] underline"
            >
              Reset to All Stacks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#1C1917] text-[#EDE4D3] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#D97706]/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-6 h-6 text-[#D97706]" />
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#FBF9F5]">
              Project Foundation &amp; Architecture Baseline
            </h2>
          </div>
          <p className="text-stone-400 font-serif text-xs sm:text-sm max-w-3xl mb-10 leading-relaxed">
            Chronicle &amp; Quill is engineered with full-stack architectural patterns optimized for Vercel Free serverless runtimes and MongoDB Atlas Free Tier with anti-IDOR authorization and atomic inventory locks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-5 flex flex-col justify-between hover:border-[#D97706]/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Database className="w-5 h-5 text-[#D97706]" />
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <h3 className="font-cinzel text-base font-bold text-[#FBF9F5] mb-2">
                  MongoDB Cached Client
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Cached connection pool preserving MongoClient across warm Vercel serverless invocations and Next.js HMR.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] font-mono text-stone-500">
                src/lib/mongodb.ts
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-5 flex flex-col justify-between hover:border-[#D97706]/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Lock className="w-5 h-5 text-[#D97706]" />
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                    Stateless
                  </span>
                </div>
                <h3 className="font-cinzel text-base font-bold text-[#FBF9F5] mb-2">
                  Jose JWT &amp; Anti-IDOR
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Stateless signed HttpOnly SameSite=Lax cookie sessions with strict anti-IDOR/BOLA guards on order resources.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] font-mono text-stone-500">
                src/lib/auth.ts + middleware.ts
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-5 flex flex-col justify-between hover:border-[#D97706]/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FileCode2 className="w-5 h-5 text-[#D97706]" />
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                    58 QA Tests
                  </span>
                </div>
                <h3 className="font-cinzel text-base font-bold text-[#FBF9F5] mb-2">
                  Atomic Checkout Locks
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Conditional inventory deductions with automatic rollback on race conditions, 24h TTL idempotency keys, and PCI guards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] font-mono text-stone-500">
                src/app/api/checkout/
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-5 flex flex-col justify-between hover:border-[#D97706]/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Library className="w-5 h-5 text-[#D97706]" />
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                    22 Books
                  </span>
                </div>
                <h3 className="font-cinzel text-base font-bold text-[#FBF9F5] mb-2">
                  Guest Cart Auto-Merge
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Anonymous session cookie staging automatically merged into authenticated user account upon sign-in or registration.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] font-mono text-stone-500">
                src/lib/cart-helpers.ts
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
