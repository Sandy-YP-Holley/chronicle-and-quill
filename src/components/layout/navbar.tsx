"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Feather,
  Search,
  Bookmark,
  ShoppingBag,
  User,
  LogOut,
  Package,
  Menu,
  X,
  ChevronDown,
  Shield,
  Store,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/store-context";

export function Navbar() {
  const router = useRouter();
  const { user, cart, wishlistIds, setIsCartOpen, isMobileMenuOpen, setIsMobileMenuOpen, logout } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/books");
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-[#7C2D12] hover:bg-[#F5F0E8] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
            aria-label="Toggle navigation drawer"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="group flex items-center gap-3.5 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none rounded-lg p-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#7C2D12] flex items-center justify-center text-[#FBF9F5] shadow-md border border-[#D97706]/60 group-hover:bg-[#9A3412] transition-colors shrink-0">
              <Feather className="w-5 h-5 sm:w-6 sm:h-6 text-[#D97706]" />
            </div>
            <div>
              <span className="font-cinzel text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#1C1917] block leading-none">
                Chronicle &amp; Quill
              </span>
              <span className="text-[10px] sm:text-[11px] font-serif text-[#7C2D12] tracking-widest uppercase block mt-1">
                Historical Bookstore &amp; Archival Press
              </span>
            </div>
          </Link>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative flex-1 max-w-sm lg:max-w-md mx-4"
          role="search"
        >
          <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, authors, or eras..."
            className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded-full py-2 pl-10 pr-4 text-xs lg:text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
            aria-label="Search catalog"
          />
        </form>

        <nav className="flex items-center gap-3 sm:gap-4 md:gap-6 text-sm font-medium">
          <div className="hidden lg:flex items-center gap-6 font-cinzel text-xs tracking-wider uppercase text-[#44403C]">
            <Link
              href="/books"
              className="hover:text-[#7C2D12] transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none p-1 rounded"
            >
              The Stacks
            </Link>
            <Link
              href="/books?period=Antiquity"
              className="hover:text-[#7C2D12] transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none p-1 rounded"
            >
              Antiquity
            </Link>
            <Link
              href="/books?period=Medieval"
              className="hover:text-[#7C2D12] transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none p-1 rounded"
            >
              Medieval
            </Link>
            <Link
              href="/books?period=Early%20Modern"
              className="hover:text-[#7C2D12] transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none p-1 rounded"
            >
              Early Modern
            </Link>
          </div>

          <Link
            href="/wishlist"
            className="p-2 text-[#44403C] hover:text-[#7C2D12] hover:bg-[#F5F0E8] rounded-full transition-colors relative focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
            title="View Wishlist"
            aria-label={`Wishlist containing ${wishlistIds.length} volumes`}
          >
            <Bookmark className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#D97706] text-[#1C1917] font-bold text-[10px] flex items-center justify-center shadow-xs">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="group flex items-center gap-2 bg-[#7C2D12] text-[#FBF9F5] px-3 sm:px-4 py-2 rounded-md hover:bg-[#9A3412] transition-all duration-200 active:scale-95 shadow-sm font-medium text-xs tracking-wider uppercase font-cinzel relative focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none cursor-pointer"
            aria-label={`Cart drawer containing ${cart.itemCount} items`}
          >
            <ShoppingBag className="w-4 h-4 text-[#D97706] group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-[#D97706] text-[#1C1917] font-bold text-[11px] px-1.5 py-0.2 rounded-full transition-transform group-hover:scale-110">
              {cart.itemCount}
            </span>
          </button>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-parchment-50 border border-gold-500/60 px-2.5 py-1 rounded font-cinzel text-[11px] uppercase tracking-wider shadow-xs hover:bg-burgundy-800 transition-colors"
              title="Curatorial Overseer Suite"
            >
              <Shield className="w-3.5 h-3.5 text-gold-500" />
              <span>Admin Suite</span>
            </Link>
          )}

          {user?.role === "seller" && (
            <Link
              href="/seller/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 bg-parchment-100 text-burgundy-700 border border-gold-500/40 px-2.5 py-1 rounded font-cinzel text-[11px] uppercase tracking-wider shadow-xs hover:bg-parchment-200 transition-colors"
              title="Seller Dashboard"
            >
              <Store className="w-3.5 h-3.5 text-burgundy-700" />
              <span>Seller Portal</span>
            </Link>
          )}

          <div className="relative" ref={userMenuRef}>
            {user ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-stone-700 hover:text-[#7C2D12] p-1.5 rounded-md hover:bg-[#F5F0E8] transition-colors text-xs font-cinzel tracking-wider uppercase focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="Scholar Account Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[#7C2D12] text-[#FBF9F5] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#FBF9F5] border border-[#E5E7EB] rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    role="menu"
                  >
                    <div className="px-4 py-2 border-b border-[#E5E7EB]">
                      <p className="text-xs font-cinzel font-bold text-[#1C1917] truncate">
                        {user.name || "Archival Scholar"}
                      </p>
                      <p className="text-[11px] font-mono text-stone-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-[#F5F0E8] hover:text-[#7C2D12] transition-colors"
                      role="menuitem"
                    >
                      <User className="w-4 h-4 text-[#D97706]" />
                      <span>Scholar Profile</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-[#F5F0E8] hover:text-[#7C2D12] transition-colors"
                      role="menuitem"
                    >
                      <Package className="w-4 h-4 text-[#D97706]" />
                      <span>Historical Orders</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-[#F5F0E8] hover:text-[#7C2D12] transition-colors"
                      role="menuitem"
                    >
                      <Bookmark className="w-4 h-4 text-[#D97706]" />
                      <span>Saved Folios</span>
                    </Link>

                    {user.role === "admin" ? (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-burgundy-700 bg-gold-300/20 hover:bg-gold-300/30 transition-colors"
                        role="menuitem"
                      >
                        <Shield className="w-4 h-4 text-gold-600" />
                        <span>Curatorial Admin</span>
                      </Link>
                    ) : user.role === "seller" ? (
                      <Link
                        href="/seller/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-burgundy-700 hover:bg-[#F5F0E8] transition-colors"
                        role="menuitem"
                      >
                        <Store className="w-4 h-4 text-burgundy-700" />
                        <span>Seller Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        href="/seller/onboarding"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-[#F5F0E8] hover:text-[#7C2D12] transition-colors"
                        role="menuitem"
                      >
                        <Sparkles className="w-4 h-4 text-[#D97706]" />
                        <span>Become a Seller</span>
                      </Link>
                    )}
                    <div className="border-t border-[#E5E7EB] my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-800 hover:bg-red-50 transition-colors text-left"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out of Archive</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#F5F0E8] text-[#1C1917] border border-[#D97706]/70 hover:bg-[#EDE4D3] px-3.5 py-2 rounded-md font-cinzel text-xs tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
              >
                <User className="w-3.5 h-3.5 text-[#7C2D12]" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
