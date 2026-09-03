"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  SlidersHorizontal,
  X,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { BookCard, BookCardData } from "@/components/books/book-card";
import { BookCardSkeleton } from "@/components/books/book-card-skeleton";

const PERIODS = ["Antiquity", "Medieval", "Early Modern", "20th Century"];
const FORMATS = ["Leather-bound", "Hardcover", "Paperback", "Archival Reprint"];
const SORT_OPTIONS = [
  { label: "Archival Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Chronological: Newest", value: "newest" },
  { label: "Title: A to Z", value: "title" },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [books, setBooks] = useState<BookCardData[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentPeriod = searchParams.get("period") || "";
  const currentFormat = searchParams.get("format") || "";
  const currentSort = searchParams.get("sort") || "relevance";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentPriceMin = searchParams.get("priceMin") || "";
  const currentPriceMax = searchParams.get("priceMax") || "";
  const currentSearch = searchParams.get("search") || "";

  const [tempPriceMin, setTempPriceMin] = useState(currentPriceMin);
  const [tempPriceMax, setTempPriceMax] = useState(currentPriceMax);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set("page", "1");
      router.push(`/books?${params.toString()}`);
    },
    [searchParams, router]
  );

  const clearAllFilters = useCallback(() => {
    setTempPriceMin("");
    setTempPriceMax("");
    router.push("/books");
  }, [router]);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        if (!params.has("limit")) params.set("limit", "12");

        const res = await fetch(`/api/books?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data.items || []);
          setTotalItems(data.pagination?.totalItems || 0);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCatalog();
  }, [searchParams]);

  function handlePriceApply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (tempPriceMin) params.set("priceMin", tempPriceMin);
    else params.delete("priceMin");
    if (tempPriceMax) params.set("priceMax", tempPriceMax);
    else params.delete("priceMax");
    params.set("page", "1");
    router.push(`/books?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/books?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasActiveFilters =
    !!currentPeriod ||
    !!currentFormat ||
    currentInStock ||
    !!currentPriceMin ||
    !!currentPriceMax ||
    !!currentSearch;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#1C1917]">
            The Archival Stacks
          </h1>
          <p className="text-xs sm:text-sm text-[#44403C] font-serif mt-1">
            Explore {totalItems} cataloged manuscripts, classical commentaries, and historical treatises.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 bg-white border border-[#E5E7EB] px-3.5 py-2 rounded-md text-xs font-cinzel tracking-wider uppercase text-stone-700 hover:border-[#D97706] shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <Filter className="w-4 h-4 text-[#7C2D12]" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            )}
          </button>

          <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-md px-3 py-2 sm:py-1.5 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-xs font-cinzel uppercase text-stone-500 hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="bg-transparent text-xs font-serif text-[#1C1917] focus:outline-none cursor-pointer"
              aria-label="Sort catalog"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-[#F5F0E8] rounded-lg border border-[#E5E7EB]">
          <span className="text-xs font-cinzel font-bold text-stone-600 uppercase tracking-wider mr-1">
            Active Filters:
          </span>
          {currentSearch && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D97706]/50 text-[#7C2D12] text-xs px-2.5 py-1 rounded font-serif">
              Query: &ldquo;{currentSearch}&rdquo;
              <button onClick={() => updateParam("search", null)} className="hover:text-red-700 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentPeriod && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D97706]/50 text-[#7C2D12] text-xs px-2.5 py-1 rounded font-serif">
              Epoch: {currentPeriod}
              <button onClick={() => updateParam("period", null)} className="hover:text-red-700 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentFormat && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D97706]/50 text-[#7C2D12] text-xs px-2.5 py-1 rounded font-serif">
              Format: {currentFormat}
              <button onClick={() => updateParam("format", null)} className="hover:text-red-700 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentInStock && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D97706]/50 text-[#7C2D12] text-xs px-2.5 py-1 rounded font-serif">
              In Stock Only
              <button onClick={() => updateParam("inStock", null)} className="hover:text-red-700 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(currentPriceMin || currentPriceMax) && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D97706]/50 text-[#7C2D12] text-xs px-2.5 py-1 rounded font-serif">
              Price: ${currentPriceMin || "0"} - ${currentPriceMax || "∞"}
              <button
                onClick={() => {
                  updateParam("priceMin", null);
                  updateParam("priceMax", null);
                  setTempPriceMin("");
                  setTempPriceMax("");
                }}
                className="hover:text-red-700 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="ml-auto text-xs font-cinzel text-stone-600 hover:text-[#7C2D12] underline uppercase tracking-wider flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="hidden md:block md:col-span-1 space-y-6 sticky top-24 self-start">
          <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#7C2D12]" />
                <h2 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Filter Archive
                </h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-serif text-stone-500 hover:text-[#7C2D12] underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div>
              <h3 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                Historical Epoch
              </h3>
              <div className="space-y-2">
                {PERIODS.map((period) => (
                  <label key={period} className="flex items-center gap-2.5 text-xs font-serif text-stone-700 cursor-pointer hover:text-[#1C1917]">
                    <input
                      type="radio"
                      name="period"
                      checked={currentPeriod === period}
                      onChange={() => updateParam("period", currentPeriod === period ? null : period)}
                      className="accent-[#7C2D12] w-3.5 h-3.5"
                    />
                    <span>{period}</span>
                  </label>
                ))}
                {currentPeriod && (
                  <button
                    onClick={() => updateParam("period", null)}
                    className="text-[11px] text-[#7C2D12] hover:underline pt-1 block"
                  >
                    Clear epoch filter
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <h3 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                Edition Format
              </h3>
              <div className="space-y-2">
                {FORMATS.map((fmt) => (
                  <label key={fmt} className="flex items-center gap-2.5 text-xs font-serif text-stone-700 cursor-pointer hover:text-[#1C1917]">
                    <input
                      type="radio"
                      name="format"
                      checked={currentFormat === fmt}
                      onChange={() => updateParam("format", currentFormat === fmt ? null : fmt)}
                      className="accent-[#7C2D12] w-3.5 h-3.5"
                    />
                    <span>{fmt}</span>
                  </label>
                ))}
                {currentFormat && (
                  <button
                    onClick={() => updateParam("format", null)}
                    className="text-[11px] text-[#7C2D12] hover:underline pt-1 block"
                  >
                    Clear format filter
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <h3 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                Price Range (USD)
              </h3>
              <form onSubmit={handlePriceApply} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={tempPriceMin}
                    onChange={(e) => setTempPriceMin(e.target.value)}
                    className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                  />
                  <span className="text-stone-400 text-xs">&ndash;</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={tempPriceMax}
                    onChange={(e) => setTempPriceMax(e.target.value)}
                    className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#F5F0E8] hover:bg-[#EDE4D3] border border-[#D97706]/70 text-[#1C1917] py-1.5 rounded text-xs font-cinzel uppercase tracking-wider transition-colors"
                >
                  Apply Range
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <label className="flex items-center gap-2.5 text-xs font-serif text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInStock}
                  onChange={(e) => updateParam("inStock", e.target.checked ? "true" : null)}
                  className="accent-[#7C2D12] w-4 h-4 rounded"
                />
                <span className="font-medium text-[#1C1917]">Only In-Stock Volumes</span>
              </label>
            </div>
          </div>
        </aside>

        {isMobileFiltersOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden flex justify-end animate-in fade-in"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            <div
              className="bg-[#FBF9F5] w-full max-w-xs sm:max-w-sm h-full p-5 sm:p-6 shadow-2xl overflow-y-auto space-y-6 animate-in slide-in-from-right pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <h2 className="font-cinzel text-base font-bold text-[#1C1917]">
                  Filter Archive
                </h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                  Historical Epoch
                </h3>
                <div className="space-y-2">
                  {PERIODS.map((period) => (
                    <label key={period} className="flex items-center gap-2.5 text-xs font-serif text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile-period"
                        checked={currentPeriod === period}
                        onChange={() => {
                          updateParam("period", currentPeriod === period ? null : period);
                        }}
                        className="accent-[#7C2D12] w-4 h-4"
                      />
                      <span>{period}</span>
                    </label>
                  ))}
                  {currentPeriod && (
                    <button
                      onClick={() => updateParam("period", null)}
                      className="text-[11px] text-[#7C2D12] hover:underline pt-1 block"
                    >
                      Clear epoch filter
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <h3 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                  Format
                </h3>
                <div className="space-y-2">
                  {FORMATS.map((fmt) => (
                    <label key={fmt} className="flex items-center gap-2.5 text-xs font-serif text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile-format"
                        checked={currentFormat === fmt}
                        onChange={() => {
                          updateParam("format", currentFormat === fmt ? null : fmt);
                        }}
                        className="accent-[#7C2D12] w-4 h-4"
                      />
                      <span>{fmt}</span>
                    </label>
                  ))}
                  {currentFormat && (
                    <button
                      onClick={() => updateParam("format", null)}
                      className="text-[11px] text-[#7C2D12] hover:underline pt-1 block"
                    >
                      Clear format filter
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <h3 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                  Price Range (USD)
                </h3>
                <form onSubmit={(e) => { handlePriceApply(e); setIsMobileFiltersOpen(false); }} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={tempPriceMin}
                      onChange={(e) => setTempPriceMin(e.target.value)}
                      className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                    />
                    <span className="text-stone-400 text-xs">&ndash;</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={tempPriceMax}
                      onChange={(e) => setTempPriceMax(e.target.value)}
                      className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#F5F0E8] hover:bg-[#EDE4D3] border border-[#D97706]/70 text-[#1C1917] py-1.5 rounded text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Apply Price Range
                  </button>
                </form>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <label className="flex items-center gap-2.5 text-xs font-serif text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentInStock}
                    onChange={(e) => {
                      updateParam("inStock", e.target.checked ? "true" : null);
                    }}
                    className="accent-[#7C2D12] w-4 h-4"
                  />
                  <span>In-Stock Only</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full bg-[#7C2D12] text-[#FBF9F5] py-2.5 rounded font-cinzel text-xs uppercase tracking-wider shadow-xs hover:bg-[#9A3412] transition-colors cursor-pointer"
                >
                  Apply &amp; View Folios
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFilters();
                      setIsMobileFiltersOpen(false);
                    }}
                    className="w-full bg-white text-stone-700 border border-stone-300 py-2 rounded font-cinzel text-xs uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
              <BookOpen className="w-14 h-14 mx-auto text-stone-300 mb-4" />
              <h3 className="font-cinzel text-lg font-bold text-[#1C1917] mb-2">
                No Manuscripts Match Your Search
              </h3>
              <p className="text-xs sm:text-sm text-[#44403C] font-serif max-w-sm mx-auto mb-6">
                Try adjusting your historical epoch, price boundaries, or format filters to discover preserved works.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider hover:bg-[#9A3412] transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 pt-6 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 text-xs font-cinzel uppercase tracking-wider text-[#1C1917] hover:text-[#7C2D12] disabled:opacity-30 disabled:hover:text-[#1C1917] transition-colors p-2 shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev<span className="hidden sm:inline"> Folio</span></span>
                  </button>

                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-xs font-cinzel font-bold transition-colors cursor-pointer shrink-0 ${
                            currentPage === pageNum
                              ? "bg-[#7C2D12] text-[#FBF9F5] shadow-xs"
                              : "text-stone-700 hover:bg-[#F5F0E8]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 text-xs font-cinzel uppercase tracking-wider text-[#1C1917] hover:text-[#7C2D12] disabled:opacity-30 disabled:hover:text-[#1C1917] transition-colors p-2 shrink-0 cursor-pointer"
                  >
                    <span>Next<span className="hidden sm:inline"> Folio</span></span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
            Cataloging Manuscripts...
          </p>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
