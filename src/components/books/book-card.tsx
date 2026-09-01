"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ShoppingBag, Star } from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency, getPeriodBadge } from "@/lib/formatters";

export interface BookCardData {
  id: string;
  title: string;
  authors: string[];
  period: "Antiquity" | "Medieval" | "Early Modern" | "20th Century";
  subjects?: string[];
  format: string;
  publicationYear?: number;
  price: number;
  stock: number;
  rating?: number;
  imageUrl: string;
  description?: string;
}

export function BookCard({ book }: { book: BookCardData }) {
  const { addToCart, toggleWishlist, wishlistIds, isLoadingCart } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  const isSaved = wishlistIds.includes(book.id);
  const badge = getPeriodBadge(book.period);
  const isOutOfStock = book.stock <= 0;
  const isLowStock = book.stock > 0 && book.stock <= 5;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(book.id, 1, book.title);
    setIsAdding(false);
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    await toggleWishlist(book.id, book.title);
  }

  return (
    <article className="group bg-white rounded-lg border border-parchment-300 hover:border-gold-500 archival-card-hover overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-64 sm:h-72 w-full bg-parchment-100 overflow-hidden border-b border-parchment-300">
        <Link href={`/books/${book.id}`} className="block w-full h-full relative">
          <Image
            src={book.imageUrl}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <span
            className={`text-[10px] sm:text-[11px] font-cinzel px-2.5 py-1 rounded shadow-xs font-semibold ${badge.bgClass} ${badge.textClass}`}
          >
            {book.period}
          </span>
          {isOutOfStock ? (
            <span className="text-[10px] font-mono font-bold bg-red-950/90 text-red-300 border border-red-800 px-2 py-0.5 rounded shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-800 px-2 py-0.5 rounded shadow-xs">
              Only {book.stock} Left
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded shadow-xs">
              In Stock
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none ${
            isSaved
              ? "bg-burgundy-700 text-parchment-50 hover:bg-burgundy-800"
              : "bg-white/80 text-stone-700 hover:bg-white hover:text-burgundy-700"
          }`}
          aria-label={isSaved ? `Remove ${book.title} from wishlist` : `Save ${book.title} to wishlist`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {book.rating && (
            <div className="bg-black/70 backdrop-blur-xs text-amber-400 text-[11px] px-2 py-1 rounded font-sans flex items-center gap-1 font-semibold">
              <Star className="w-3 h-3 fill-current" />
              <span>{book.rating.toFixed(1)}</span>
            </div>
          )}
          <span className="text-[10px] font-cinzel uppercase bg-parchment-50/95 border border-gold-500/70 text-burgundy-700 px-2 py-0.5 rounded shadow-xs font-semibold">
            {book.format}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-cinzel uppercase text-burgundy-700 tracking-wider block mb-1">
            {book.authors.join(", ")}
          </span>
          <Link href={`/books/${book.id}`} className="group-hover:text-burgundy-700 transition-colors">
            <h3 className="font-playfair text-lg sm:text-xl font-bold text-ink-900 leading-snug line-clamp-2 mb-2">
              {book.title}
            </h3>
          </Link>
          {book.description && (
            <p className="text-xs text-ink-700 line-clamp-2 leading-relaxed mb-4 font-serif">
              {book.description}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-parchment-300 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] font-mono text-stone-500 uppercase block">Archival Price</span>
            <span className="text-lg font-cinzel font-bold text-ink-900">
              {formatCurrency(book.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || isLoadingCart}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md font-cinzel text-xs uppercase tracking-wider transition-all duration-200 shadow-xs focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none ${
              isOutOfStock
                ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                : "bg-burgundy-700 text-parchment-50 hover:bg-burgundy-800 active:scale-95 cursor-pointer"
            }`}
            aria-label={`Add ${book.title} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-gold-500" />
            <span>{isAdding ? "Adding..." : isOutOfStock ? "Sold" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
