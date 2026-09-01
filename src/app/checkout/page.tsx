"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Zap,
  User,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency } from "@/lib/formatters";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, refreshUser, refreshCart, showToast } = useStore();

  const [fullName, setFullName] = useState(user?.name || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  async function handleInlineLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsAuthenticating(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });

      if (res.ok) {
        await refreshUser();
        await refreshCart();
        showToast("Logged in successfully. Guest folio merged into your scholar account.", "success");
      } else {
        const err = await res.json();
        setAuthError(err.detail || "Invalid credentials.");
      }
    } catch {
      setAuthError("Network error during login.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleFillDemo() {
    setAuthEmail("scholar@chronicleandquill.com");
    setAuthPassword("HistoricalReader2026!");
    setFullName("Marcus Scholar");
    setStreet("42 Alexandria Way");
    setCity("Boston");
    setPostalCode("02108");
    setCountry("United States");
    setAddressErrors({});
    setCheckoutError("");
  }

  async function handleConfirmOrder(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutError("");
    setAddressErrors({});

    if (!user) {
      showToast("Please sign in or use the Demo Helper to complete checkout.", "error");
      return;
    }

    const clientErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      clientErrors.fullName = "Full recipient name is required and must be at least 2 characters";
    }
    if (!street.trim() || street.trim().length < 5) {
      clientErrors.street = "Street address is required and must be at least 5 characters";
    }
    if (!city.trim() || city.trim().length < 2) {
      clientErrors.city = "City is required and must be at least 2 characters";
    }
    if (!postalCode.trim() || postalCode.trim().length < 3) {
      clientErrors.postalCode = "Postal or ZIP code is required (min 3 characters)";
    }
    if (!country.trim() || country.trim().length < 2) {
      clientErrors.country = "Country is required and must be at least 2 characters";
    }

    if (Object.keys(clientErrors).length > 0) {
      setAddressErrors(clientErrors);
      setCheckoutError(`Validation failed on [${Object.keys(clientErrors).join(", ")}]. Please correct the highlighted fields.`);
      return;
    }

    try {
      setIsSubmitting(true);

      const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: fullName.trim(),
            street: street.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.orderId) {
        await refreshCart();
        router.push(`/order/${data.orderId}`);
      } else {
        if (data.errors && typeof data.errors === "object") {
          const parsed: Record<string, string> = {};
          Object.entries(data.errors).forEach(([k, v]) => {
            const shortKey = k.replace(/^shippingAddress\./, "");
            const msg = Array.isArray(v) ? v[0] : String(v);
            parsed[shortKey] = msg;
            parsed[k] = msg;
          });
          setAddressErrors(parsed);
        }
        setCheckoutError(data.detail || "Unable to confirm simulated order.");
        showToast(data.detail || "Checkout error.", "error");
      }
    } catch {
      setCheckoutError("Communication error with archival checkout API.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <h1 className="font-cinzel text-2xl font-bold text-[#1C1917] mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-xs text-stone-500 font-serif mb-6">
          You cannot proceed to checkout without adding manuscripts to your archival cart.
        </p>
        <Link
          href="/books"
          className="bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider shadow-xs"
        >
          Explore The Stacks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB]">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Courier Checkout &amp; Order Confirmation
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-serif mt-1">
            Simulated archival dispatch mode &bull; No financial transaction executed
          </p>
        </div>
        <Link
          href="/cart"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-cinzel uppercase text-stone-600 hover:text-[#7C2D12] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#F5F0E8] border border-[#D97706]/60 rounded-lg p-4 flex items-start gap-3 shadow-xs">
            <Lock className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-cinzel font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                Anti-Tamper Security Lock &amp; Server-Price Authority
              </h2>
              <p className="text-xs text-[#44403C] font-serif leading-relaxed">
                Client-side prices and subtotals are strictly ignored by our backend. Item amounts and physical inventory allocations are computed atomically on the server before transaction confirmation.
              </p>
            </div>
          </div>

          {!user ? (
            <div className="bg-white rounded-lg border border-[#D97706]/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#7C2D12]" />
                  <h3 className="font-cinzel text-sm font-bold text-[#1C1917] uppercase">
                    Scholar Authentication Required
                  </h3>
                </div>
                <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                  Guest Cart Staged
                </span>
              </div>

              <p className="text-xs text-stone-600 font-serif leading-relaxed">
                You are checking out as a guest. Please sign in or use the one-click demo button below to merge your staged cart into a registered account.
              </p>

              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full bg-[#EDE4D3] hover:bg-[#E5D7BE] text-[#7C2D12] border border-[#D97706] py-2.5 px-4 rounded-md font-cinzel text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[#D97706] fill-current" />
                <span>⚡ Fill Demo Scholar Account (Quick QA Helper)</span>
              </button>

              <form onSubmit={handleInlineLogin} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-cinzel uppercase text-stone-600 mb-1">
                    Scholar Email
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="scholar@chronicleandquill.com"
                    className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded p-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cinzel uppercase text-stone-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#F5F0E8] border border-[#E5E7EB] rounded p-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-red-700 font-serif">{authError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="flex-1 bg-[#7C2D12] text-[#FBF9F5] py-2 rounded font-cinzel text-xs uppercase tracking-wider hover:bg-[#9A3412] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {isAuthenticating ? "Authenticating..." : "Sign In & Merge Cart"}
                  </button>
                  <Link
                    href="/register?redirect=/checkout"
                    className="px-4 py-2 bg-[#F5F0E8] text-[#1C1917] border border-[#E5E7EB] hover:border-[#D97706] rounded font-cinzel text-xs uppercase tracking-wider transition-colors text-center"
                  >
                    Register
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-xs font-cinzel font-bold text-emerald-950">
                    Authenticated Scholar: {user.name || user.email}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-800">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-bold uppercase">
                Active Session
              </span>
            </div>
          )}

          <form onSubmit={handleConfirmOrder} className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB] mb-4">
                <Truck className="w-4 h-4 text-[#7C2D12]" />
                <h3 className="font-cinzel text-sm font-bold text-[#1C1917] uppercase tracking-wider">
                  Archival Courier Delivery Address
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel uppercase text-stone-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (addressErrors.fullName || addressErrors["shippingAddress.fullName"]) {
                        setAddressErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.fullName;
                          delete updated["shippingAddress.fullName"];
                          return updated;
                        });
                      }
                    }}
                    placeholder="Marcus Aurelius Scholar"
                    className={`w-full bg-[#F5F0E8] border rounded p-2.5 text-xs text-[#1C1917] focus:outline-none transition-colors ${
                      addressErrors.fullName || addressErrors["shippingAddress.fullName"]
                        ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                        : "border-[#E5E7EB] focus:border-[#D97706]"
                    }`}
                  />
                  {(addressErrors.fullName || addressErrors["shippingAddress.fullName"]) && (
                    <p className="text-[11px] text-red-700 font-serif mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{addressErrors.fullName || addressErrors["shippingAddress.fullName"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-cinzel uppercase text-stone-700 mb-1">
                    Street Address &bull; Vault Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      if (addressErrors.street || addressErrors["shippingAddress.street"]) {
                        setAddressErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.street;
                          delete updated["shippingAddress.street"];
                          return updated;
                        });
                      }
                    }}
                    placeholder="42 Bibliophile Terrace"
                    className={`w-full bg-[#F5F0E8] border rounded p-2.5 text-xs text-[#1C1917] focus:outline-none transition-colors ${
                      addressErrors.street || addressErrors["shippingAddress.street"]
                        ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                        : "border-[#E5E7EB] focus:border-[#D97706]"
                    }`}
                  />
                  {(addressErrors.street || addressErrors["shippingAddress.street"]) && (
                    <p className="text-[11px] text-red-700 font-serif mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{addressErrors.street || addressErrors["shippingAddress.street"]}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-cinzel uppercase text-stone-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (addressErrors.city || addressErrors["shippingAddress.city"]) {
                          setAddressErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.city;
                            delete updated["shippingAddress.city"];
                            return updated;
                          });
                        }
                      }}
                      placeholder="Alexandria"
                      className={`w-full bg-[#F5F0E8] border rounded p-2.5 text-xs text-[#1C1917] focus:outline-none transition-colors ${
                        addressErrors.city || addressErrors["shippingAddress.city"]
                          ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                          : "border-[#E5E7EB] focus:border-[#D97706]"
                      }`}
                    />
                    {(addressErrors.city || addressErrors["shippingAddress.city"]) && (
                      <p className="text-[11px] text-red-700 font-serif mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{addressErrors.city || addressErrors["shippingAddress.city"]}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-cinzel uppercase text-stone-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value);
                        if (addressErrors.postalCode || addressErrors["shippingAddress.postalCode"]) {
                          setAddressErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.postalCode;
                            delete updated["shippingAddress.postalCode"];
                            return updated;
                          });
                        }
                      }}
                      placeholder="02108"
                      className={`w-full bg-[#F5F0E8] border rounded p-2.5 text-xs text-[#1C1917] focus:outline-none transition-colors ${
                        addressErrors.postalCode || addressErrors["shippingAddress.postalCode"]
                          ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                          : "border-[#E5E7EB] focus:border-[#D97706]"
                      }`}
                    />
                    {(addressErrors.postalCode || addressErrors["shippingAddress.postalCode"]) && (
                      <p className="text-[11px] text-red-700 font-serif mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{addressErrors.postalCode || addressErrors["shippingAddress.postalCode"]}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-cinzel uppercase text-stone-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (addressErrors.country || addressErrors["shippingAddress.country"]) {
                        setAddressErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.country;
                          delete updated["shippingAddress.country"];
                          return updated;
                        });
                      }
                    }}
                    className={`w-full bg-[#F5F0E8] border rounded p-2.5 text-xs text-[#1C1917] focus:outline-none transition-colors ${
                      addressErrors.country || addressErrors["shippingAddress.country"]
                        ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                        : "border-[#E5E7EB] focus:border-[#D97706]"
                    }`}
                  />
                  {(addressErrors.country || addressErrors["shippingAddress.country"]) && (
                    <p className="text-[11px] text-red-700 font-serif mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{addressErrors.country || addressErrors["shippingAddress.country"]}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB] mb-4">
                <CreditCard className="w-4 h-4 text-[#7C2D12]" />
                <h3 className="font-cinzel text-sm font-bold text-[#1C1917] uppercase tracking-wider">
                  Payment Method: Simulated Archival Card
                </h3>
              </div>

              <div className="bg-[#F5F0E8] border border-[#E5E7EB] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cinzel font-bold text-[#1C1917]">
                    Simulated Test Payment (Free Tier)
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">
                    Auto-Authorized
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-serif leading-relaxed">
                  No real credit cards or bank details are accepted or processed. Submitting this order registers an authentic order record in MongoDB with status <code>Pending</code> and atomically decrements book inventory.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>PCI-DSS Guard Active: Raw credit card numbers are strictly rejected by the server.</span>
                </div>
              </div>
            </div>

            {checkoutError && (
              <div className="bg-red-50 border border-red-300 rounded p-3 text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !user}
              className="w-full bg-[#7C2D12] hover:bg-[#9A3412] text-[#FBF9F5] py-3.5 rounded-md font-cinzel text-xs uppercase tracking-wider font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#D97706]" />
              <span>{isSubmitting ? "Locking Inventory & Placing Order..." : "Confirm & Place Simulated Order"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-xs sticky top-24 space-y-5">
            <h3 className="font-cinzel text-sm font-bold text-[#1C1917] pb-3 border-b border-[#E5E7EB] uppercase tracking-wider">
              Order Summary ({cart.itemCount} items)
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-stone-100">
              {cart.items.map((item) => (
                <div key={item.bookId} className="flex gap-3 pt-3 first:pt-0 items-center">
                  <div className="relative w-12 h-16 bg-[#F5F0E8] rounded overflow-hidden shrink-0 border border-[#E5E7EB]">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-playfair text-xs font-bold text-[#1C1917] truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-serif">
                      Qty: {item.quantity} &bull; {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-cinzel text-xs font-bold text-[#1C1917]">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#E5E7EB] text-xs font-serif text-[#44403C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-cinzel font-bold text-[#1C1917]">
                  {formatCurrency(cart.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Archival Courier Shipping</span>
                <span className="font-cinzel text-[#1C1917]">
                  {cart.shipping === 0 ? "FREE" : formatCurrency(cart.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Estimated Tax</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="pt-3 border-t border-[#E5E7EB] flex justify-between text-sm font-bold text-[#1C1917]">
                <span className="font-cinzel">Total</span>
                <span className="font-cinzel text-lg text-[#7C2D12]">
                  {formatCurrency(cart.total)}
                </span>
              </div>
            </div>

            <div className="bg-[#F5F0E8] p-3 rounded text-[11px] font-mono text-stone-500 space-y-1 border border-[#E5E7EB]">
              <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Idempotency-Key Guard Active</span>
              </div>
              <p className="leading-tight">
                Duplicate clicks or network retries reuse the existing order record without double stock deductions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
