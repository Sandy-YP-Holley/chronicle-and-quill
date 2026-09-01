"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  ShoppingBag,
  Trash2,
  ArrowRight,
  User,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency, getPeriodBadge } from "@/lib/formatters";
import { BookCardData } from "@/components/books/book-card";

export default function WishlistPage() {
  const { user, isLoadingUser, addToCart, toggleWishlist, wishlistIds } = useStore();
  const [savedBooks, setSavedBooks] = useState<BookCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setSavedBooks(data.wishlist?.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWishlist();
  }, [user, wishlistIds]);

  async function handleMoveToCart(book: BookCardData) {
    const added = await addToCart(book.id, 1, book.title);
    if (added) {
      await toggleWishlist(book.id);
    }
  }

  if (isLoadingUser || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Retrieving Saved Manuscripts...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#F5F0E8] border border-[#E5E7EB] flex items-center justify-center mb-4 text-[#7C2D12]">
          <Bookmark className="w-8 h-8" />
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-[#1C1917] mb-2">
          Scholar Account Required
        </h1>
        <p className="text-xs text-stone-500 font-serif mb-6 leading-relaxed">
          Please sign in to your scholar account to view and curate your personal collection of saved manuscripts.
        </p>
        <Link
          href="/login?redirect=/wishlist"
          className="inline-flex items-center gap-2 bg-[#7C2D12] text-[#FBF9F5] px-6 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider hover:bg-[#9A3412] transition-colors shadow-xs"
        >
          <User className="w-4 h-4 text-[#D97706]" />
          <span>Sign In to Wishlist</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB] gap-2">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Saved Folios &amp; Treatises ({savedBooks.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-serif mt-1">
            Your personal archive of historical manuscripts marked for preservation and acquisition.
          </p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-xs font-cinzel uppercase text-stone-600 hover:text-[#7C2D12] transition-colors self-start sm:self-auto"
        >
          <span>Continue Browsing</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {savedBooks.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center max-w-md mx-auto shadow-2xs">
          <Bookmark className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h2 className="font-cinzel text-base font-bold text-[#1C1917] mb-1">
            No Folios Saved Yet
          </h2>
          <p className="text-xs text-stone-500 font-serif mb-6 leading-relaxed">
            Click the bookmark icon on any historical manuscript in our stacks to add it to your personal reading room.
          </p>
          <Link
            href="/books"
            className="bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider hover:bg-[#9A3412] transition-colors shadow-xs"
          >
            Explore The Stacks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBooks.map((book) => {
            const badge = getPeriodBadge(book.period);
            const isOutOfStock = book.stock <= 0;

            return (
              <div
                key={book.id}
                className="bg-white rounded-lg border border-[#E5E7EB] hover:border-[#D97706] transition-all overflow-hidden flex flex-col shadow-2xs"
              >
                <div className="relative h-60 w-full bg-[#F5F0E8] overflow-hidden border-b border-[#E5E7EB]">
                  <Link href={`/books/${book.id}`} className="block w-full h-full relative">
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </Link>
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-cinzel font-bold px-2 py-0.5 rounded shadow-xs ${badge.bgClass} ${badge.textClass}`}>
                      {book.period}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(book.id, book.title)}
                      className="p-1.5 bg-white/90 rounded-full text-red-700 hover:bg-white transition-colors shadow-xs"
                      title="Remove from saved folios"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] font-cinzel uppercase bg-[#FBF9F5]/90 border border-[#D97706] text-[#7C2D12] px-2 py-0.5 rounded shadow-xs font-semibold">
                      {book.format}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-cinzel uppercase text-[#7C2D12] tracking-wider block font-bold mb-1">
                      {book.authors.join(", ")}
                    </span>
                    <Link href={`/books/${book.id}`}>
                      <h2 className="font-playfair text-base font-bold text-[#1C1917] hover:text-[#7C2D12] transition-colors leading-snug line-clamp-2 mb-2">
                        {book.title}
                      </h2>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-lg font-cinzel font-bold text-[#1C1917]">
                        {formatCurrency(book.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMoveToCart(book)}
                      disabled={isOutOfStock}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-cinzel text-xs uppercase tracking-wider transition-all shadow-xs ${
                        isOutOfStock
                          ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                          : "bg-[#7C2D12] text-[#FBF9F5] hover:bg-[#9A3412]"
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{isOutOfStock ? "Sold" : "Move to Cart"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
