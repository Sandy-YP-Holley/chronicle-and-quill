"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Trash2,
  ExternalLink,
  Store,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency, getPeriodBadge } from "@/lib/formatters";

interface AdminBook {
  id: string;
  title: string;
  authors: string[];
  period: string;
  format: string;
  isbn: string;
  price: number;
  stock: number;
  imageUrl: string;
  sellerId?: string;
  sellerName?: string;
  isDelisted: boolean;
  createdAt: string;
}

export default function AdminBooksPage() {
  const { showToast, showConfirm } = useStore();
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<AdminBook[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.items || []);
      } else {
        showToast("Access restricted or failed to load catalog.", "error");
      }
    } catch {
      showToast("Network error fetching catalog.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredBooks(
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.authors.some((a) => a.toLowerCase().includes(q)) ||
          (b.sellerName && b.sellerName.toLowerCase().includes(q))
      )
    );
  }, [books, searchQuery]);

  function handleDelistBook(book: AdminBook) {
    showConfirm({
      title: "Delist Volume from Central Catalog?",
      description: `Are you sure you wish to delist "${book.title}" (ISBN: ${book.isbn})? If historical orders contain this volume, it will be soft-delisted to maintain receipt integrity.`,
      confirmLabel: "Delist Volume",
      cancelLabel: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/books/${book.id}`, { method: "DELETE" });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message || "Volume delisted successfully.", "success");
            fetchBooks();
          } else {
            showToast(data.detail || "Failed to delist volume.", "error");
          }
        } catch {
          showToast("Network error delisting volume.", "error");
        }
      },
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-cinzel text-stone-500 hover:text-burgundy-700 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overseer Suite</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
            Curatorial Catalog Control
          </h1>
          <p className="text-xs text-stone-500 font-serif mt-1">
            Review all manuscripts, dealer attributions, live stock counts, and delisting status.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, author, ISBN, dealer..."
            className="w-full bg-white border border-stone-300 rounded-md py-2 pl-8 pr-3 text-xs text-ink-900 focus:outline-none focus:border-gold-500 font-serif"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-12">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="font-cinzel text-xs uppercase text-stone-500">
              Inspecting Catalog Archives...
            </span>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-3" />
            <h3 className="font-cinzel text-sm font-bold text-ink-900 mb-1">
              No Matching Manuscripts Found
            </h3>
            <p className="text-xs text-stone-500 font-serif">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-parchment-100/60 font-cinzel text-[11px] uppercase tracking-wider text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Manuscript</th>
                  <th className="py-3.5 px-4">Historical Epoch</th>
                  <th className="py-3.5 px-4">Dealer Attribution</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Inventory Stock</th>
                  <th className="py-3.5 px-4">Catalog Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredBooks.map((book) => {
                  const badge = getPeriodBadge(book.period);

                  return (
                    <tr key={book.id} className="hover:bg-parchment-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-14 bg-parchment-100 rounded overflow-hidden shrink-0 border border-stone-200">
                            <Image
                              src={book.imageUrl}
                              alt={book.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/books/${book.id}`}
                              className="font-playfair font-bold text-ink-900 hover:text-burgundy-700 text-sm line-clamp-1"
                            >
                              {book.title}
                            </Link>
                            <span className="text-[11px] text-stone-500 block truncate max-w-xs">
                              {book.authors.join(", ")}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400 block">
                              ISBN: {book.isbn}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-cinzel font-bold px-2 py-0.5 rounded w-max ${badge.bgClass} ${badge.textClass}`}>
                            {book.period}
                          </span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            {book.format}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-stone-700">
                          <Store className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                          <span className="font-semibold truncate max-w-xs">
                            {book.sellerName || "Chronicle & Quill Archive"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-cinzel font-bold text-ink-900">
                        {formatCurrency(book.price)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-bold ${
                            book.stock === 0
                              ? "text-red-700"
                              : book.stock <= 3
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {book.stock} in stacks
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {book.isDelisted ? (
                          <span className="text-[10px] font-mono font-bold uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-300">
                            Soft-Delisted
                          </span>
                        ) : book.stock > 0 ? (
                          <span className="text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                            Public in Stacks
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold uppercase bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200">
                            Exhausted Stock
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/books/${book.id}`}
                            className="text-stone-400 hover:text-stone-700 p-1"
                            title="View in Catalog"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {!book.isDelisted && (
                            <button
                              onClick={() => handleDelistBook(book)}
                              className="text-stone-400 hover:text-red-700 p-1 transition-colors cursor-pointer"
                              title="Delist Volume"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
