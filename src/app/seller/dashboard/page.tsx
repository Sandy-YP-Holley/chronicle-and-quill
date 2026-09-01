"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  BookOpen,
  Plus,
  Package,
  DollarSign,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency, getPeriodBadge } from "@/lib/formatters";

interface SellerBook {
  id: string;
  title: string;
  authors: string[];
  period: string;
  format: string;
  price: number;
  stock: number;
  imageUrl: string;
  isDelisted?: boolean;
  createdAt: string;
}

interface SellerOrder {
  id: string;
  status: string;
  createdAt: string;
  shippingAddress: { city: string; country: string };
  items: Array<{ title: string; price: number; quantity: number }>;
  sellerTotal: number;
}

export default function SellerDashboardPage() {
  const { user, showConfirm, showToast } = useStore();
  const [books, setBooks] = useState<SellerBook[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalUnitsSold: 0, totalSalesVolume: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "orders">("inventory");

  const loadSellerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [booksRes, ordersRes] = await Promise.all([
        fetch("/api/seller/books"),
        fetch("/api/seller/orders"),
      ]);

      if (booksRes.ok) {
        const data = await booksRes.json();
        setBooks(data.items || []);
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
        setStats(data.stats || { totalOrders: 0, totalUnitsSold: 0, totalSalesVolume: 0 });
      }
    } catch {
      showToast("Error loading seller portal data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  function handleDeleteBook(book: SellerBook) {
    showConfirm({
      title: "Delist Archival Volume?",
      description: `Are you sure you wish to delist "${book.title}"? If scholars have previously ordered this volume, it will be soft-delisted to maintain historical receipt integrity.`,
      confirmLabel: "Delist Volume",
      cancelLabel: "Keep in Stacks",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/seller/books/${book.id}`, { method: "DELETE" });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message || "Volume delisted successfully.", "success");
            loadSellerData();
          } else {
            showToast(data.detail || "Failed to delist volume.", "error");
          }
        } catch {
          showToast("Network error delisting volume.", "error");
        }
      },
    });
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Accessing Archival Dealership Records...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-burgundy-700 text-parchment-50 flex items-center justify-center shadow-md border border-gold-500/60 shrink-0">
            <Store className="w-7 h-7 text-gold-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
                {user?.sellerName || "Archivist Dealership"}
              </h1>
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider bg-gold-300/40 text-burgundy-700 px-2.5 py-0.5 rounded border border-gold-500/40">
                Archival Seller
              </span>
            </div>
            <p className="text-xs text-stone-500 font-serif mt-1">
              Curate your dealership catalog, track inventory stock, and monitor scholar acquisitions.
            </p>
          </div>
        </div>

        <Link
          href="/seller/books/new"
          className="inline-flex items-center gap-2 bg-burgundy-700 text-parchment-50 px-5 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider hover:bg-burgundy-800 transition-all duration-200 active:scale-95 shadow-sm border border-gold-500/40 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gold-500" />
          <span>Catalog New Volume</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-xs uppercase text-stone-500 font-bold">
              Listed Manuscripts
            </span>
            <BookOpen className="w-5 h-5 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
            {books.filter((b) => !b.isDelisted).length}
          </div>
          <span className="text-[11px] font-serif text-stone-500 mt-1 block">
            {books.filter((b) => b.isDelisted).length} archived or soft-delisted
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-xs uppercase text-stone-500 font-bold">
              Dispatched Units
            </span>
            <Package className="w-5 h-5 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
            {stats.totalUnitsSold}
          </div>
          <span className="text-[11px] font-serif text-stone-500 mt-1 block">
            Across {stats.totalOrders} historical orders
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-xs uppercase text-stone-500 font-bold">
              Sales Revenue
            </span>
            <DollarSign className="w-5 h-5 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl sm:text-3xl font-bold text-burgundy-700">
            {formatCurrency(stats.totalSalesVolume)}
          </div>
          <span className="text-[11px] font-serif text-stone-500 mt-1 block">
            Gross simulated acquisitions
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-12">
        <div className="border-b border-stone-200 px-6 py-4 flex items-center justify-between bg-parchment-50">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`font-cinzel text-xs uppercase tracking-wider font-bold pb-1 transition-colors cursor-pointer ${
                activeTab === "inventory"
                  ? "text-burgundy-700 border-b-2 border-burgundy-700"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Dealership Inventory ({books.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`font-cinzel text-xs uppercase tracking-wider font-bold pb-1 transition-colors cursor-pointer ${
                activeTab === "orders"
                  ? "text-burgundy-700 border-b-2 border-burgundy-700"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Acquisition Dispatches ({orders.length})
            </button>
          </div>
        </div>

        {activeTab === "inventory" ? (
          books.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-parchment-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-sm font-bold text-ink-900 mb-1">
                No Manuscripts Cataloged Yet
              </h3>
              <p className="text-xs text-stone-500 font-serif max-w-sm mx-auto mb-4">
                Begin listing rare books, original bindings, or historical treatises from your private collection.
              </p>
              <Link
                href="/seller/books/new"
                className="bg-burgundy-700 text-parchment-50 px-4 py-2 rounded text-xs font-cinzel uppercase tracking-wider"
              >
                Catalog First Volume
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-serif">
                <thead className="bg-parchment-100/60 font-cinzel text-[11px] uppercase tracking-wider text-stone-600 border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-6">Manuscript</th>
                    <th className="py-3.5 px-4">Epoch / Format</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Inventory</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {books.map((book) => {
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
                            {book.stock} units
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {book.isDelisted ? (
                            <span className="text-[10px] font-mono font-bold uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-300">
                              Soft-Delisted
                            </span>
                          ) : book.stock > 0 ? (
                            <span className="text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                              Active in Stacks
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold uppercase bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200">
                              Out of Stock
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
                                onClick={() => handleDeleteBook(book)}
                                className="text-stone-400 hover:text-red-700 p-1 transition-colors cursor-pointer"
                                title="Delist Manuscript"
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
          )
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-parchment-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel text-sm font-bold text-ink-900 mb-1">
              No Dispatches Recorded
            </h3>
            <p className="text-xs text-stone-500 font-serif max-w-sm mx-auto">
              When scholars acquire your listed volumes, order line-item breakdowns and shipping statuses will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-parchment-100/60 font-cinzel text-[11px] uppercase tracking-wider text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Acquired Items</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Dealership Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-parchment-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] font-bold text-ink-900">
                      {order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="text-xs text-ink-900">
                            <span className="font-semibold">{it.title}</span> &times; {it.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-600">
                      {order.shippingAddress.city}, {order.shippingAddress.country}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          order.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : order.status === "Cancelled"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-cinzel font-bold text-burgundy-700">
                      {formatCurrency(order.sellerTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
