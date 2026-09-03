"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, BookOpen, Compass, X } from "lucide-react";
import { BookCard, BookCardData } from "@/components/books/book-card";
import { BookCardSkeleton } from "@/components/books/book-card-skeleton";

const SUGGESTED_QUERIES = [
  "Marcus Aurelius",
  "Dante",
  "Roman Empire",
  "Historiography",
  "Homer",
  "Ibn Khaldun",
];

const EPOCHS = [
  { name: "Classical Antiquity", period: "Antiquity" },
  { name: "Medieval Era", period: "Medieval" },
  { name: "Early Modern & Renaissance", period: "Early Modern" },
  { name: "20th Century", period: "20th Century" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<BookCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
    if (!query) {
      setResults([]);
      return;
    }

    async function executeSearch() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/books?search=${encodeURIComponent(query)}&limit=24`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    executeSearch();
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/books");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="font-cinzel text-3xl font-bold text-[#1C1917] mb-3">
          Archival Search Inquiry
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-serif mb-6">
          Query manuscripts across title, author, historical subject, and accession ISBN.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto shadow-xs">
          <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by author, title, era, or theme..."
            className="w-full bg-white border border-[#E5E7EB] rounded-full py-3 pl-12 pr-12 text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                router.push("/search");
              }}
              className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-serif text-stone-500">
          <span>Popular inquiries:</span>
          {SUGGESTED_QUERIES.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => router.push(`/search?q=${encodeURIComponent(sq)}`)}
              className="underline hover:text-[#7C2D12] transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {query && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#E5E7EB] gap-2">
          <p className="text-xs sm:text-sm font-serif text-stone-700">
            Found <strong className="text-[#1C1917] font-mono">{results.length}</strong> historical {results.length === 1 ? "manuscript" : "manuscripts"} matching &ldquo;<span className="text-[#7C2D12] font-semibold break-all">{query}</span>&rdquo;
          </p>
          <Link
            href="/books"
            className="text-xs font-cinzel uppercase text-[#7C2D12] hover:underline font-bold self-start sm:self-auto"
          >
            Explore Complete Stacks &rarr;
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : query && results.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center max-w-xl mx-auto shadow-2xs">
          <BookOpen className="w-14 h-14 mx-auto text-stone-300 mb-4" />
          <h2 className="font-cinzel text-lg font-bold text-[#1C1917] mb-2">
            No Archival Folios Found
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-serif leading-relaxed mb-6">
            We could not find any historical volumes matching &ldquo;{query}&rdquo;. You may browse by historical epoch or inspect the complete stacks.
          </p>

          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto mb-6">
            {EPOCHS.map((epoch, idx) => (
              <Link
                key={idx}
                href={`/books?period=${encodeURIComponent(epoch.period)}`}
                className="p-2.5 rounded bg-[#F5F0E8] hover:bg-[#EDE4D3] text-[#1C1917] text-xs font-cinzel uppercase tracking-wider text-center border border-[#E5E7EB] transition-colors"
              >
                {epoch.name}
              </Link>
            ))}
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-[#7C2D12] text-[#FBF9F5] px-6 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider shadow-xs hover:bg-[#9A3412] transition-colors"
          >
            <Compass className="w-4 h-4 text-[#D97706]" />
            <span>Browse The Full Stacks</span>
          </Link>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 max-w-md mx-auto">
          <p className="text-xs sm:text-sm text-stone-500 font-serif">
            Enter a search term above or choose a historical epoch to begin exploring.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {EPOCHS.map((epoch, idx) => (
              <Link
                key={idx}
                href={`/books?period=${encodeURIComponent(epoch.period)}`}
                className="px-3 py-1.5 rounded-full bg-[#F5F0E8] hover:bg-[#EDE4D3] text-[#1C1917] text-xs font-cinzel uppercase tracking-wider border border-[#E5E7EB] transition-colors"
              >
                {epoch.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
            Searching Archival Indexes...
          </p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
