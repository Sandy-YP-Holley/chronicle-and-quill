"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency } from "@/lib/formatters";

export function CartDrawer() {
  const router = useRouter();
  const { cart, isCartOpen, setIsCartOpen, updateCartQuantity, removeFromCart, isLoadingCart } = useStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    }
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  const freeShippingThreshold = 100;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
        isCartOpen ? "pointer-events-auto opacity-100 visible" : "pointer-events-none opacity-0 invisible"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto justify-end pointer-events-none">
        <div
          ref={drawerRef}
          className={`pointer-events-auto w-full sm:w-[420px] max-w-full bg-parchment-50 shadow-2xl flex flex-col border-l border-parchment-300 transform transition-transform duration-300 ease-in-out ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="px-5 py-4 border-b border-parchment-300 flex items-center justify-between bg-parchment-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-burgundy-700" />
              <h2 id="cart-drawer-title" className="font-cinzel text-base font-bold text-ink-900">
                Archival Folio Cart ({cart.itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-3 bg-parchment-200/50 border-b border-parchment-300">
            <div className="flex justify-between text-xs font-serif mb-1.5 text-ink-900">
              <span className="font-medium">
                {amountToFreeShipping > 0
                  ? `Add ${formatCurrency(amountToFreeShipping)} more for Free Courier Delivery`
                  : "✓ Qualified for Free Archival Courier Delivery"}
              </span>
              <span className="font-mono text-stone-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-300/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-burgundy-700 h-1.5 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-parchment-100 border border-parchment-300 flex items-center justify-center mb-4 text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-ink-900 mb-1">
                  Your Archive is Empty
                </h3>
                <p className="text-xs text-stone-500 font-serif max-w-xs mb-6">
                  No rare manuscripts or historical editions have been added to your folio yet.
                </p>
                <Link
                  href="/books"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-burgundy-700 text-parchment-50 px-5 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider hover:bg-burgundy-800 transition-colors shadow-xs"
                >
                  Explore the Stacks
                </Link>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.bookId}
                  className="flex gap-4 pb-4 border-b border-parchment-300 last:border-0 last:pb-0"
                >
                  <div className="relative w-16 h-22 bg-parchment-100 rounded overflow-hidden shrink-0 border border-parchment-300">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-cinzel uppercase text-burgundy-700 tracking-wider block">
                        {item.period} &bull; {item.format}
                      </span>
                      <h4 className="font-playfair text-sm font-bold text-ink-900 truncate leading-tight mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500 truncate font-serif">
                        {item.authors.join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2">
                      <div className="flex items-center border border-parchment-300 rounded bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.bookId, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoadingCart}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors active:scale-90 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.bookId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock || isLoadingCart}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors active:scale-90 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-cinzel text-xs font-bold text-ink-900">
                          {formatCurrency(item.lineTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.bookId)}
                          disabled={isLoadingCart}
                          className="text-stone-400 hover:text-red-700 p-1 transition-colors active:scale-90 cursor-pointer"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="p-5 border-t border-parchment-300 bg-parchment-100 space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              <div className="space-y-1.5 text-xs font-serif text-ink-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-cinzel font-bold text-ink-900">
                    {formatCurrency(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Archival Courier Shipping</span>
                  <span className="font-cinzel text-ink-900">
                    {cart.shipping === 0 ? "FREE" : formatCurrency(cart.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-stone-300 text-ink-900">
                  <span className="font-cinzel">Estimated Total</span>
                  <span className="font-cinzel text-base text-burgundy-700">
                    {formatCurrency(cart.total)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500 bg-white/70 p-2 rounded border border-parchment-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Server-verified prices &amp; live stock locks</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-burgundy-700 text-parchment-50 py-3 rounded-md font-cinzel text-xs uppercase tracking-wider hover:bg-burgundy-800 transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-gold-500" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/cart");
                  }}
                  className="w-full text-center py-2 text-xs font-cinzel uppercase tracking-wider text-stone-700 hover:text-burgundy-700 transition-colors cursor-pointer"
                >
                  View Itemized Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
