"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Bookmark,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  ArrowRight,
  BookOpen,
  Store,
  Shield,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/store-context";

export default function AccountPage() {
  const router = useRouter();
  const { user, cart, wishlistIds, refreshUser, showToast, isLoadingUser } = useStore();

  async function logout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        await refreshUser();
        showToast("You have departed the archives safely.", "info");
        router.push("/login");
      }
    } catch {
      showToast("Error during departure.", "error");
    }
  }

  if (isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Loading Scholar Profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-parchment-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
          <User className="w-6 h-6" />
        </div>
        <h1 className="font-cinzel text-xl font-bold text-ink-900 mb-2">
          Scholar Session Required
        </h1>
        <p className="text-xs text-stone-500 font-serif mb-6 leading-relaxed">
          Please authenticate with the guild to inspect your private orders, saved manuscripts, and archival status.
        </p>
        <Link
          href="/login"
          className="bg-burgundy-700 text-parchment-50 px-6 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider shadow-sm hover:bg-burgundy-800 transition-colors"
        >
          Sign In to Archive
        </Link>
      </div>
    );
  }

  const isSeller = user.role === "seller";
  const isAdmin = user.role === "admin";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-burgundy-700 text-parchment-50 flex items-center justify-center font-cinzel text-xl font-bold shadow-md border border-gold-500/60 shrink-0">
            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-2xl font-bold text-ink-900">
                {user.name || "Archival Scholar"}
              </h1>
              {isAdmin ? (
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider bg-burgundy-700 text-parchment-50 px-2 py-0.5 rounded border border-gold-500">
                  Curatorial Admin
                </span>
              ) : isSeller ? (
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider bg-gold-300/40 text-burgundy-700 px-2 py-0.5 rounded border border-gold-500/40">
                  Archival Seller
                </span>
              ) : (
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-300">
                  Scholar Member
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-stone-500">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 text-xs font-cinzel uppercase text-red-800 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Link
          href="/account/orders"
          className="bg-white p-5 rounded-lg border border-stone-200 hover:border-gold-500 transition-colors shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <Package className="w-6 h-6 text-burgundy-700" />
            <span className="text-[10px] font-mono bg-parchment-100 text-burgundy-700 px-2 py-0.5 rounded font-bold uppercase">
              Orders
            </span>
          </div>
          <div>
            <h3 className="font-cinzel text-sm font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
              Historical Orders
            </h3>
            <p className="text-xs text-stone-500 font-serif mt-1">
              Inspect order lifecycle, itemized receipts, or request cancellation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-cinzel text-burgundy-700">
            <span>View Inquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="bg-white p-5 rounded-lg border border-stone-200 hover:border-gold-500 transition-colors shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <Bookmark className="w-6 h-6 text-burgundy-700" />
            <span className="text-[10px] font-mono bg-parchment-100 text-burgundy-700 px-2 py-0.5 rounded font-bold uppercase">
              {wishlistIds.length} Saved
            </span>
          </div>
          <div>
            <h3 className="font-cinzel text-sm font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
              Saved Folios &amp; Treatises
            </h3>
            <p className="text-xs text-stone-500 font-serif mt-1">
              Curate your personal collection and transfer saved manuscripts to cart.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-cinzel text-burgundy-700">
            <span>Open Wishlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/cart"
          className="bg-white p-5 rounded-lg border border-stone-200 hover:border-gold-500 transition-colors shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <ShoppingBag className="w-6 h-6 text-burgundy-700" />
            <span className="text-[10px] font-mono bg-parchment-100 text-burgundy-700 px-2 py-0.5 rounded font-bold uppercase">
              {cart.itemCount} in Cart
            </span>
          </div>
          <div>
            <h3 className="font-cinzel text-sm font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
              Active Folio Cart
            </h3>
            <p className="text-xs text-stone-500 font-serif mt-1">
              Review current staged volumes and dispatch to simulated checkout.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-cinzel text-burgundy-700">
            <span>Examine Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {isAdmin ? (
          <Link
            href="/admin"
            className="bg-burgundy-700 text-parchment-50 p-5 rounded-lg border border-gold-500 hover:bg-burgundy-800 transition-colors shadow-md group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <Shield className="w-6 h-6 text-gold-500" />
              <span className="text-[10px] font-mono bg-gold-300 text-burgundy-900 px-2 py-0.5 rounded font-bold uppercase">
                Admin
              </span>
            </div>
            <div>
              <h3 className="font-cinzel text-sm font-bold text-parchment-50 group-hover:text-gold-500 transition-colors">
                Overseer Suite
              </h3>
              <p className="text-xs text-parchment-200 font-serif mt-1">
                Audit orders ledger, curate catalog, and manage user directory.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-burgundy-800 flex items-center justify-between text-xs font-cinzel text-gold-500">
              <span>Open Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ) : isSeller ? (
          <Link
            href="/seller/dashboard"
            className="bg-white p-5 rounded-lg border border-gold-500 hover:border-burgundy-700 transition-colors shadow-2xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <Store className="w-6 h-6 text-burgundy-700" />
              <span className="text-[10px] font-mono bg-gold-300/40 text-burgundy-700 px-2 py-0.5 rounded font-bold uppercase">
                Seller
              </span>
            </div>
            <div>
              <h3 className="font-cinzel text-sm font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
                Seller Dashboard
              </h3>
              <p className="text-xs text-stone-500 font-serif mt-1 truncate">
                {user.sellerName || "Archival Dealership"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-cinzel text-burgundy-700">
              <span>Manage Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ) : (
          <Link
            href="/seller/onboarding"
            className="bg-parchment-100 p-5 rounded-lg border border-gold-500/50 hover:border-gold-500 transition-colors shadow-2xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <Sparkles className="w-6 h-6 text-gold-500" />
              <span className="text-[10px] font-mono bg-gold-300/40 text-burgundy-700 px-2 py-0.5 rounded font-bold uppercase">
                Upgrade
              </span>
            </div>
            <div>
              <h3 className="font-cinzel text-sm font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
                Become a Seller
              </h3>
              <p className="text-xs text-stone-500 font-serif mt-1">
                Accredit your private dealership and catalog rare folios to scholars.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-parchment-300 flex items-center justify-between text-xs font-cinzel text-burgundy-700">
              <span>Accreditation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-2xs space-y-4">
        <h2 className="font-cinzel text-sm font-bold text-ink-900 uppercase tracking-wider pb-3 border-b border-stone-200">
          Scholar Credentials &amp; Guild Registry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
          <div className="p-3 bg-parchment-50 rounded border border-stone-200">
            <span className="font-mono text-[10px] uppercase text-stone-500 block">Session Identity</span>
            <span className="font-mono font-bold text-ink-900">{user.userId}</span>
          </div>

          <div className="p-3 bg-parchment-50 rounded border border-stone-200">
            <span className="font-mono text-[10px] uppercase text-stone-500 block">Guild Role Archetype</span>
            <span className="font-bold text-burgundy-700 capitalize">
              {isAdmin ? "Curatorial Master Overseer" : isSeller ? `Archival Seller (${user.sellerName})` : "Scholar Member (Buyer)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 pt-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Stateless Jose JWT Session Authenticated (HttpOnly SameSite=Lax)</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs font-cinzel text-burgundy-700 uppercase tracking-wider font-bold hover:underline"
        >
          <BookOpen className="w-4 h-4" />
          <span>Return to The Stacks</span>
        </Link>
      </div>
    </div>
  );
}
