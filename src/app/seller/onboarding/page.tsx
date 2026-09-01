"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { useStore } from "@/context/store-context";

const ERA_OPTIONS = [
  "Classical Antiquity (c. 800 BCE – 500 CE)",
  "Medieval Era (500 – 1500 CE)",
  "Renaissance & Enlightenment (1500 – 1900 CE)",
  "20th Century Historical Folios",
  "General Archival Literature (All Eras)",
];

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user, refreshUser, showToast, isLoadingUser } = useStore();

  const [sellerName, setSellerName] = useState("");
  const [specialtyEra, setSpecialtyEra] = useState(ERA_OPTIONS[0]);
  const [sellerBio, setSellerBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoadingUser && user) {
      if (user.role === "seller") {
        router.push("/seller/dashboard");
      }
    }
  }, [user, isLoadingUser, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};
    if (!sellerName.trim() || sellerName.trim().length < 2) {
      newFieldErrors.sellerName = "Bookstore or dealership name is required and must be at least 2 characters";
    }
    if (sellerBio.trim() && sellerBio.trim().length < 10) {
      newFieldErrors.sellerBio = "Archival statement and dealer bio must be at least 10 characters";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMessage(`Validation failed on [${Object.keys(newFieldErrors).join(", ")}]. Please correct the highlighted fields.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerName: sellerName.trim(),
          specialtyEra,
          sellerBio: sellerBio.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        showToast("Scholar status successfully elevated to Archival Seller!", "success");
        router.push("/seller/dashboard");
      } else {
        if (data.errors && typeof data.errors === "object") {
          const parsed: Record<string, string> = {};
          Object.entries(data.errors).forEach(([k, v]) => {
            parsed[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setFieldErrors(parsed);
        }
        setErrorMessage(data.detail || "Onboarding could not be completed.");
      }
    } catch {
      setErrorMessage("Network error communicating with the Archival Registry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Loading Registry...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-burgundy-700 text-parchment-50 flex items-center justify-center mx-auto mb-4 shadow-md border border-gold-500/60">
          <Store className="w-7 h-7 text-gold-500" />
        </div>
        <span className="text-xs font-cinzel tracking-widest uppercase text-burgundy-700 font-bold block mb-1">
          Archivist Guild Accreditation
        </span>
        <h1 className="font-cinzel text-3xl font-bold text-ink-900">
          Register as an Archival Bookseller
        </h1>
        <p className="text-sm text-stone-600 font-serif max-w-lg mx-auto mt-2">
          Curate rare historical manuscripts, illuminated folios, and timeless treatises for scholars worldwide.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-md p-6 sm:p-10">
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-serif rounded mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
              Bookstore or Archivist Name *
            </label>
            <input
              type="text"
              required
              value={sellerName}
              onChange={(e) => {
                setSellerName(e.target.value);
                if (fieldErrors.sellerName) setFieldErrors((prev) => ({ ...prev, sellerName: "" }));
              }}
              placeholder="e.g., Alexandria Rare Folios &amp; Manuscripts"
              className={`w-full bg-parchment-50 border rounded px-3.5 py-2.5 text-xs text-ink-900 focus:outline-none transition-colors font-serif ${
                fieldErrors.sellerName
                  ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              }`}
            />
            {fieldErrors.sellerName ? (
              <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.sellerName}</span>
              </p>
            ) : (
              <p className="text-[11px] text-stone-500 font-serif mt-1">
                The public dealership identity under which your volumes will be archived and dispatched.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
              Curatorial Specialty &amp; Historical Era
            </label>
            <select
              value={specialtyEra}
              onChange={(e) => setSpecialtyEra(e.target.value)}
              className="w-full bg-parchment-50 border border-stone-300 rounded px-3.5 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors font-serif cursor-pointer"
            >
              {ERA_OPTIONS.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
              Archival Statement &amp; Dealer Bio
            </label>
            <textarea
              rows={4}
              value={sellerBio}
              onChange={(e) => {
                setSellerBio(e.target.value);
                if (fieldErrors.sellerBio) setFieldErrors((prev) => ({ ...prev, sellerBio: "" }));
              }}
              placeholder="Describe your preservation focus, collection provenance, and historical literature background..."
              className={`w-full bg-parchment-50 border rounded px-3.5 py-2.5 text-xs text-ink-900 focus:outline-none transition-colors font-serif ${
                fieldErrors.sellerBio
                  ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              }`}
            />
            {fieldErrors.sellerBio && (
              <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.sellerBio}</span>
              </p>
            )}
          </div>

          <div className="p-4 bg-parchment-100 rounded-lg border border-parchment-300 flex items-start gap-3 text-xs font-serif text-ink-700">
            <ShieldCheck className="w-5 h-5 text-burgundy-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold font-cinzel text-ink-900 block mb-0.5">
                Archival Guild Covenant
              </span>
              By registering as a bookseller, you pledge to provide accurate bibliographical descriptions, honest condition grades, and safe courier dispatch packaging for all manuscripts.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
            <Link
              href="/account"
              className="text-xs font-cinzel text-stone-500 hover:text-ink-900 uppercase tracking-wider"
            >
              Cancel &bull; Return to Profile
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-burgundy-700 text-parchment-50 px-8 py-3 rounded-md font-cinzel text-xs uppercase tracking-widest hover:bg-burgundy-800 transition-all duration-200 active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Accrediting Seller...</span>
              ) : (
                <>
                  <span>Complete Seller Accreditation</span>
                  <ArrowRight className="w-4 h-4 text-gold-500" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
