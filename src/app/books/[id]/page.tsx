"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  ShoppingBag,
  Star,
  ShieldCheck,
  Calendar,
  Barcode,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency, getPeriodBadge } from "@/lib/formatters";
import { BookCard, BookCardData } from "@/components/books/book-card";

interface BookDetailData extends BookCardData {
  isbn: string;
  pages?: number;
  publisher?: string;
  language?: string;
  dimensions?: string;
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { addToCart, toggleWishlist, wishlistIds, isLoadingCart } = useStore();
  const [book, setBook] = useState<BookDetailData | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<BookCardData[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isSaved = book ? wishlistIds.includes(book.id) : false;

  useEffect(() => {
    async function fetchBookDetail() {
      try {
        setIsLoading(true);
        setErrorMsg("");
        const res = await fetch(`/api/books/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data.book);

          if (data.book?.period) {
            const relRes = await fetch(`/api/books?period=${encodeURIComponent(data.book.period)}&limit=4`);
            if (relRes.ok) {
              const relData = await relRes.json();
              setRelatedBooks((relData.items || []).filter((b: BookCardData) => b.id !== id).slice(0, 3));
            }
          }
        } else {
          setErrorMsg("Folio not found in archival stacks.");
        }
      } catch {
        setErrorMsg("Failed to retrieve manuscript from archive.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Retrieving Archival Folio...
        </p>
      </div>
    );
  }

  if (!book || errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <h1 className="font-cinzel text-2xl font-bold text-[#1C1917] mb-3">Folio Not Found</h1>
        <p className="text-xs text-stone-500 font-serif mb-6">{errorMsg || "This item is not present in our archive."}</p>
        <Link
          href="/books"
          className="bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider shadow-xs"
        >
          Return to The Stacks
        </Link>
      </div>
    );
  }

  const badge = getPeriodBadge(book.period);
  const isOutOfStock = book.stock <= 0;
  const isLowStock = book.stock > 0 && book.stock <= 5;

  async function handleAddToCart() {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(book!.id, quantity, book!.title);
    setIsAdding(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full animate-fadeIn">
      <nav className="flex items-center gap-2 text-xs font-serif text-stone-500 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#7C2D12] transition-colors">
          Archive Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <Link href="/books" className="hover:text-[#7C2D12] transition-colors">
          The Stacks
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <Link href={`/books?period=${encodeURIComponent(book.period)}`} className="hover:text-[#7C2D12] transition-colors">
          {book.period}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span className="text-[#1C1917] font-semibold truncate max-w-xs">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:max-w-none rounded-xl overflow-hidden bg-[#F5F0E8] border border-[#E5E7EB] shadow-lg sticky top-24">
            <Image
              src={book.imageUrl}
              alt={book.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
              className="object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className={`text-xs font-cinzel font-bold px-3 py-1 rounded shadow-xs ${badge.bgClass} ${badge.textClass}`}>
                {book.period}
              </span>
              <span className="text-[11px] font-cinzel font-bold bg-[#FBF9F5]/95 border border-[#D97706] text-[#7C2D12] px-2.5 py-0.5 rounded shadow-xs uppercase">
                {book.format}
              </span>
            </div>
            {book.rating && (
              <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-xs text-amber-400 text-xs px-2.5 py-1 rounded font-sans flex items-center gap-1 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{book.rating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <div className="border-b border-[#E5E7EB] pb-6 mb-6">
            <span className="text-xs font-cinzel uppercase text-[#7C2D12] tracking-widest block font-bold mb-2">
              {book.authors.join(", ")}
            </span>
            <h1 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] leading-tight mb-4">
              {book.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Composition: {book.publicationYear ? `${Math.abs(book.publicationYear)} ${book.publicationYear < 0 ? "BCE" : "CE"}` : "Circa Antiqua"}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5 text-[#D97706]" />
                <span>ISBN: {book.isbn}</span>
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-2xl sm:text-3xl font-cinzel font-bold text-[#1C1917]">
                {formatCurrency(book.price)}
              </span>
              <span className="text-xs font-serif text-stone-500">
                Guaranteed Archival Price &bull; Verified Provenance
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-red-950 text-red-300 border border-red-800 px-2.5 py-1 rounded">
                  Out of Stock &mdash; Awaiting Preservation Reprints
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-1 rounded">
                  Limited Vault Stock: Only {book.stock} copies remain
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded">
                  In Stock ({book.stock} copies preserved in climate-controlled vault)
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#F5F0E8] border border-[#D97706]/40 rounded-lg p-4 mb-8 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-cinzel font-bold text-[#1C1917] uppercase tracking-wider mb-0.5">
                Server-Authoritative Price Guarantee
              </h4>
              <p className="text-xs text-[#44403C] font-serif leading-relaxed">
                Book pricing, inventory limits, and edition metadata are cryptographically validated against live MongoDB Atlas records upon cart addition and checkout. Any client-side DOM alterations are strictly rejected.
              </p>
            </div>
          </div>

          <div className="prose text-sm text-[#44403C] font-serif leading-relaxed mb-8">
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-[#1C1917] font-bold mb-2">
              Curatorial Overview
            </h3>
            <p className="whitespace-pre-line leading-relaxed">{book.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-white border border-[#E5E7EB] mb-8 text-xs font-serif">
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase">Format</span>
              <span className="font-semibold text-[#1C1917]">{book.format}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase">Publisher</span>
              <span className="font-semibold text-[#1C1917]">{book.publisher || "Archival Press"}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase">Pages</span>
              <span className="font-semibold text-[#1C1917]">{book.pages ? `${book.pages} pp.` : "Historical Folio"}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase">Era</span>
              <span className="font-semibold text-[#1C1917]">{book.period}</span>
            </div>
          </div>

          {book.subjects && book.subjects.length > 0 && (
            <div className="mb-8">
              <span className="text-xs font-cinzel uppercase text-stone-500 tracking-wider block mb-2 font-semibold">
                Historical Disciplines &amp; Themes
              </span>
              <div className="flex flex-wrap gap-2">
                {book.subjects.map((subj, idx) => (
                  <span
                    key={idx}
                    className="bg-[#F5F0E8] border border-[#E5E7EB] text-[#1C1917] text-xs font-serif px-3 py-1 rounded-full"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[#E5E7EB] mt-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                {!isOutOfStock && (
                  <div className="flex items-center border border-[#E5E7EB] rounded-md bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || isLoadingCart}
                      className="p-2.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(book.stock, prev + 1))}
                      disabled={quantity >= book.stock || isLoadingCart}
                      className="p-2.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(book.id, book.title)}
                  className={`p-3 rounded-md border transition-all flex sm:hidden items-center justify-center gap-2 text-xs font-cinzel uppercase tracking-wider cursor-pointer ${
                    isSaved
                      ? "bg-[#7C2D12] text-[#FBF9F5] border-[#7C2D12]"
                      : "bg-white text-stone-700 border-[#E5E7EB] hover:border-[#D97706]"
                  }`}
                  title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding || isLoadingCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-md font-cinzel text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer ${
                  isOutOfStock
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                    : "bg-[#7C2D12] text-[#FBF9F5] hover:bg-[#9A3412] active:scale-98"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#D97706]" />
                <span>{isAdding ? "Adding to Folio..." : isOutOfStock ? "Out of Stock" : "Add to Archival Cart"}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(book.id, book.title)}
                className={`hidden sm:flex p-3.5 rounded-md border transition-all items-center justify-center gap-2 text-xs font-cinzel uppercase tracking-wider cursor-pointer ${
                  isSaved
                    ? "bg-[#7C2D12] text-[#FBF9F5] border-[#7C2D12]"
                    : "bg-white text-stone-700 border-[#E5E7EB] hover:border-[#D97706]"
                }`}
                title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-cinzel text-2xl font-bold text-[#1C1917]">
                Related {book.period} Manuscripts
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-serif mt-1">
                Other rare works from this historical period.
              </p>
            </div>
            <Link
              href={`/books?period=${encodeURIComponent(book.period)}`}
              className="text-xs font-cinzel uppercase text-[#7C2D12] font-bold hover:underline"
            >
              View Era &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
