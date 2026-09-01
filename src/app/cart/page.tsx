"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Truck,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency } from "@/lib/formatters";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartQuantity, removeFromCart, isLoadingCart, showConfirm } = useStore();

  const freeShippingThreshold = 100;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  function handleRemoveItem(bookId: string, title: string) {
    showConfirm({
      title: "Remove from Archival Folio",
      description: `Are you sure you want to remove "${title}" from your current cart?`,
      confirmLabel: "Yes, Remove",
      cancelLabel: "Keep in Folio",
      variant: "danger",
      onConfirm: async () => {
        await removeFromCart(bookId);
      },
    });
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-parchment-100 border border-parchment-300 flex items-center justify-center mb-6 text-stone-400 shadow-xs">
          <ShoppingBag className="w-10 h-10 text-burgundy-700" />
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900 mb-2">
          Your Archival Folio is Empty
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-serif max-w-sm mb-8 leading-relaxed">
          No manuscripts, treatises, or historical texts have been added to your cart yet.
        </p>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 bg-burgundy-700 text-parchment-50 px-6 py-3 rounded-md font-cinzel text-xs uppercase tracking-wider hover:bg-burgundy-800 transition-all duration-200 active:scale-95 shadow-md"
        >
          <span>Explore The Stacks</span>
          <ArrowRight className="w-4 h-4 text-gold-500" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-parchment-300">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
            Itemized Archival Folio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-serif mt-1">
            Review your selected historical volumes before proceeding to simulated courier checkout.
          </p>
        </div>
        <Link
          href="/books"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-cinzel uppercase text-stone-600 hover:text-burgundy-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Browsing</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-parchment-200/40 border border-parchment-300 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs font-serif text-ink-900 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-burgundy-700" />
                {amountToFreeShipping > 0
                  ? `Add ${formatCurrency(amountToFreeShipping)} more to qualify for Free Archival Courier Delivery`
                  : "✓ You have unlocked Free Archival Courier Delivery"}
              </span>
              <span className="font-mono text-stone-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-300/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-burgundy-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-parchment-300 divide-y divide-parchment-300 shadow-2xs">
            {cart.items.map((item) => (
              <div key={item.bookId} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start">
                <div className="relative w-20 h-28 bg-parchment-100 rounded overflow-hidden shrink-0 border border-parchment-300">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-cinzel uppercase text-burgundy-700 tracking-wider block font-bold">
                        {item.period} &bull; {item.format}
                      </span>
                      <Link href={`/books/${item.bookId}`}>
                        <h3 className="font-playfair text-base sm:text-lg font-bold text-ink-900 hover:text-burgundy-700 transition-colors leading-snug">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-stone-500 font-serif mt-0.5">
                        By {item.authors.join(", ")}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base font-cinzel font-bold text-ink-900 block">
                        {formatCurrency(item.lineTotal)}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {formatCurrency(item.price)} each
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center border border-parchment-300 rounded bg-parchment-50 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.bookId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoadingCart}
                        className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-xs font-bold text-ink-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.bookId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock || isLoadingCart}
                        className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.bookId, item.title)}
                      disabled={isLoadingCart}
                      className="text-xs font-serif text-stone-500 hover:text-red-700 flex items-center gap-1 transition-colors active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-parchment-100 border border-gold-500/40 rounded-lg p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0" />
            <p className="text-xs text-ink-700 font-serif leading-relaxed">
              <strong>Price Tamper Protection:</strong> Every line item and subtotal is dynamically verified against live MongoDB documents upon checkout. Client modifications to HTML or local storage are actively discarded.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg border border-parchment-300 p-6 shadow-xs sticky top-24 space-y-4">
            <h2 className="font-cinzel text-base font-bold text-ink-900 pb-3 border-b border-parchment-300">
              Archival Order Summary
            </h2>

            <div className="space-y-2.5 text-xs font-serif text-ink-700">
              <div className="flex justify-between">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-cinzel font-bold text-ink-900">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Archival Courier Delivery</span>
                <span className="font-cinzel text-ink-900">
                  {cart.shipping === 0 ? "FREE" : formatCurrency(cart.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-3 border-t border-parchment-300 text-ink-900">
                <span className="font-cinzel">Total Amount</span>
                <span className="font-cinzel text-lg text-burgundy-700">{formatCurrency(cart.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="w-full flex items-center justify-center gap-2 bg-burgundy-700 text-parchment-50 py-3 rounded-md font-cinzel text-xs uppercase tracking-wider hover:bg-burgundy-800 transition-all duration-200 active:scale-95 shadow-md focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none cursor-pointer"
            >
              <span>Proceed to Courier Checkout</span>
              <ArrowRight className="w-4 h-4 text-gold-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
