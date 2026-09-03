"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Feather, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Zap } from "lucide-react";
import { useStore } from "@/context/store-context";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const { refreshUser, refreshCart, showToast } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  function handleFillDemo(accountEmail: string) {
    setEmail(accountEmail);
    setPassword("HistoricalReader2026!");
    setErrorMessage("");
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};
    if (!email.trim()) {
      newFieldErrors.email = "Please provide a valid email address (e.g., scholar@example.com)";
    }
    if (!password) {
      newFieldErrors.password = "Password is required to authenticate";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMessage(`Validation failed on [${Object.keys(newFieldErrors).join(", ")}]. Please correct the highlighted fields.`);
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        await refreshCart();
        showToast("Welcome back to the archives, Scholar.", "success");
        router.push(redirectPath);
      } else {
        if (data.errors && typeof data.errors === "object") {
          const parsed: Record<string, string> = {};
          Object.entries(data.errors).forEach(([k, v]) => {
            parsed[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setFieldErrors(parsed);
        }
        setErrorMessage(data.detail || "Authentication rejected. Invalid credentials.");
      }
    } catch {
      setErrorMessage("Network error communicating with authentication provider.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 flex-1 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#E5E7EB] shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[#7C2D12] flex items-center justify-center text-[#FBF9F5] mx-auto mb-3 shadow-sm border border-[#D97706]/60">
            <Feather className="w-6 h-6 text-[#D97706]" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-[#1C1917]">
            Scholar Portal Sign In
          </h1>
          <p className="text-xs text-stone-500 font-serif mt-1">
            Access preserved folios, manage saved items, and review archival dispatches.
          </p>
        </div>

        <div className="bg-[#F5F0E8] p-3 rounded-lg border border-[#D97706]/40 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-cinzel font-bold text-[#7C2D12] uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current text-[#D97706]" /> Quick Demo Accounts (QA Helpers)
            </span>
            <span className="text-[10px] text-stone-500 font-serif font-normal">
              Fill Demo Scholar Account
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("scholar@chronicleandquill.com")}
              className="bg-white hover:bg-stone-50 border border-stone-300 py-2 sm:py-1.5 px-3 rounded text-[11px] sm:text-[10px] font-cinzel uppercase font-bold text-stone-700 hover:text-[#7C2D12] transition-colors text-center cursor-pointer"
            >
              Scholar (Buyer)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("seller@chronicleandquill.com")}
              className="bg-white hover:bg-stone-50 border border-amber-300 py-2 sm:py-1.5 px-3 rounded text-[11px] sm:text-[10px] font-cinzel uppercase font-bold text-stone-700 hover:text-[#7C2D12] transition-colors text-center cursor-pointer"
            >
              Archivist (Seller)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin@chronicleandquill.com")}
              className="bg-white hover:bg-stone-50 border border-[#7C2D12] py-2 sm:py-1.5 px-3 rounded text-[11px] sm:text-[10px] font-cinzel uppercase font-bold text-[#7C2D12] transition-colors text-center cursor-pointer"
            >
              Overseer (Admin)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-cinzel uppercase text-stone-700 mb-1 font-semibold">
              Archival Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="scholar@chronicleandquill.com"
                className={`w-full bg-[#F5F0E8] border rounded-md py-2 pl-9 pr-3 text-xs sm:text-sm text-[#1C1917] focus:outline-none transition-colors ${
                  fieldErrors.email
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-[#E5E7EB] focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-red-700 font-serif mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-cinzel uppercase text-stone-700 mb-1 font-semibold">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••••••"
                className={`w-full bg-[#F5F0E8] border rounded-md py-2 pl-9 pr-10 text-xs sm:text-sm text-[#1C1917] focus:outline-none transition-colors ${
                  fieldErrors.password
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-[#E5E7EB] focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-red-700 font-serif mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#7C2D12] hover:bg-[#9A3412] text-[#FBF9F5] py-3 rounded-md font-cinzel text-xs uppercase tracking-wider font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? "Validating Cryptographic Session..." : "Sign In to Archives"}</span>
            <ArrowRight className="w-4 h-4 text-[#D97706]" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5E7EB] text-center text-xs font-serif text-stone-600">
          <span>New to Chronicle &amp; Quill? </span>
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-[#7C2D12] font-cinzel font-bold hover:underline"
          >
            Create Guild Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
            Accessing Guild Vault...
          </p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
