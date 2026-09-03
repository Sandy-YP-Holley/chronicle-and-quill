"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Search,
  Bookmark,
  ShoppingBag,
  User,
  X,
  Feather,
  LogOut,
  Package,
} from "lucide-react";
import { useStore } from "@/context/store-context";

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    cart,
    wishlistIds,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsCartOpen,
    logout,
  } = useStore();
  const [mobileSearch, setMobileSearch] = useState("");

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = mobileSearch.trim();
    setIsMobileMenuOpen(false);
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/books");
    }
  }

  const isHomeActive = pathname === "/";
  const isStacksActive = pathname.startsWith("/books");
  const isSearchActive = pathname.startsWith("/search");
  const isWishlistActive = pathname.startsWith("/wishlist");
  const isCartActive = pathname.startsWith("/cart");

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FBF9F5] shadow-2xl p-6 flex flex-col justify-between z-50 border-r border-[#E5E7EB] animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#7C2D12] flex items-center justify-center text-[#FBF9F5]">
                    <Feather className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <span className="font-cinzel text-base font-bold text-[#1C1917]">
                    Chronicle &amp; Quill
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMobileSearch} className="mt-5 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Search historical folios..."
                  className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded-lg py-2 pl-9 pr-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                />
              </form>

              <nav className="mt-6 flex flex-col gap-2 font-cinzel text-xs tracking-wider uppercase">
                <Link
                  href="/books"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md hover:bg-[#F5F0E8] text-[#1C1917] flex items-center gap-2.5 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#7C2D12]" />
                  <span>The Stacks (All Volumes)</span>
                </Link>
                <Link
                  href="/books?period=Antiquity"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md hover:bg-[#F5F0E8] text-stone-700 transition-colors"
                >
                  Classical Antiquity
                </Link>
                <Link
                  href="/books?period=Medieval"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md hover:bg-[#F5F0E8] text-stone-700 transition-colors"
                >
                  Medieval Christendom &amp; Islam
                </Link>
                <Link
                  href="/books?period=Early%20Modern"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md hover:bg-[#F5F0E8] text-stone-700 transition-colors"
                >
                  Renaissance &amp; Enlightenment
                </Link>
                <Link
                  href="/books?period=20th%20Century"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md hover:bg-[#F5F0E8] text-stone-700 transition-colors"
                >
                  20th Century Historiography
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1">
                    <p className="text-xs font-cinzel font-bold text-[#1C1917]">{user.name || "Scholar"}</p>
                    <p className="text-[11px] font-mono text-stone-500">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-cinzel text-stone-700 hover:bg-[#F5F0E8] rounded-md flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#D97706]" />
                    <span>My Scholar Account</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-cinzel text-stone-700 hover:bg-[#F5F0E8] rounded-md flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-[#D97706]" />
                    <span>Order History</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="px-3 py-2 text-xs font-cinzel text-red-800 hover:bg-red-50 rounded-md flex items-center gap-2 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#7C2D12] text-[#FBF9F5] py-2.5 rounded-md font-cinzel text-xs tracking-wider uppercase shadow-xs"
                >
                  <User className="w-4 h-4 text-[#D97706]" />
                  <span>Scholar Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 inset-x-0 bg-[#FBF9F5]/98 backdrop-blur-md border-t border-[#E5E7EB] z-40 md:hidden pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 flex justify-around items-center shadow-lg"
        aria-label="Mobile quick navigation"
      >
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-cinzel uppercase p-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
            isHomeActive ? "text-[#7C2D12] font-bold" : "text-stone-600 hover:text-[#7C2D12]"
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? "text-[#7C2D12] stroke-[2.5]" : "text-stone-500"}`} />
          <span>Home</span>
          {isHomeActive && <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5" />}
        </Link>
        <Link
          href="/books"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-cinzel uppercase p-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
            isStacksActive ? "text-[#7C2D12] font-bold" : "text-stone-600 hover:text-[#7C2D12]"
          }`}
        >
          <BookOpen className={`w-5 h-5 ${isStacksActive ? "text-[#7C2D12] stroke-[2.5]" : "text-stone-500"}`} />
          <span>Stacks</span>
          {isStacksActive && <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5" />}
        </Link>
        <Link
          href="/search"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-cinzel uppercase p-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
            isSearchActive ? "text-[#7C2D12] font-bold" : "text-stone-600 hover:text-[#7C2D12]"
          }`}
        >
          <Search className={`w-5 h-5 ${isSearchActive ? "text-[#7C2D12] stroke-[2.5]" : "text-stone-500"}`} />
          <span>Search</span>
          {isSearchActive && <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5" />}
        </Link>
        <Link
          href="/wishlist"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-cinzel uppercase relative p-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
            isWishlistActive ? "text-[#7C2D12] font-bold" : "text-stone-600 hover:text-[#7C2D12]"
          }`}
          aria-label={`Wishlist with ${wishlistIds.length} items`}
        >
          <Bookmark className={`w-5 h-5 ${isWishlistActive ? "text-[#7C2D12] stroke-[2.5] fill-[#7C2D12]/20" : "text-stone-500"}`} />
          {wishlistIds.length > 0 && (
            <span className="absolute top-0.5 right-1.5 w-4 h-4 rounded-full bg-[#D97706] text-[#1C1917] font-bold text-[9px] flex items-center justify-center">
              {wishlistIds.length}
            </span>
          )}
          <span>Saved</span>
          {isWishlistActive && <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5" />}
        </Link>
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`group flex flex-col items-center gap-0.5 text-[10px] font-cinzel uppercase relative p-1.5 rounded transition-all duration-200 active:scale-90 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none cursor-pointer ${
            isCartActive ? "text-[#7C2D12] font-bold" : "text-stone-600 hover:text-[#7C2D12]"
          }`}
          aria-label={`Cart with ${cart.itemCount} items`}
        >
          <ShoppingBag className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isCartActive ? "text-[#7C2D12] stroke-[2.5]" : "text-[#7C2D12]"}`} />
          {cart.itemCount > 0 && (
            <span className="absolute top-0.5 right-1.5 w-4 h-4 rounded-full bg-[#D97706] text-[#1C1917] font-bold text-[9px] flex items-center justify-center shadow-xs">
              {cart.itemCount}
            </span>
          )}
          <span>Cart</span>
          {isCartActive && <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5" />}
        </button>
      </nav>
    </>
  );
}
