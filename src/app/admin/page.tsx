"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BookOpen,
  Users,
  Store,
  Package,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency } from "@/lib/formatters";

interface AdminMetrics {
  totalBooks: number;
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
  grossVolume: number;
}

export default function AdminDashboardPage() {
  const { user, showToast } = useStore();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
        } else if (res.status === 403) {
          showToast("Access restricted: Curatorial Admin privileges required.", "error");
        }
      } catch {
        showToast("Error retrieving administrative metrics.", "error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Unlocking Curatorial Archive Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-burgundy-700 text-parchment-50 flex items-center justify-center shadow-md border border-gold-500/60 shrink-0">
            <ShieldCheck className="w-8 h-8 text-gold-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
                Curatorial Overseer Suite
              </h1>
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider bg-gold-300/40 text-burgundy-700 px-2.5 py-0.5 rounded border border-gold-500/40">
                Master Admin
              </span>
            </div>
            <p className="text-xs text-stone-500 font-serif mt-1">
              Global platform oversight, catalog auditing, order lifecycle state control, and user directory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Enforced: {user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-[11px] uppercase text-stone-500 font-bold">
              Catalog Volumes
            </span>
            <BookOpen className="w-4 h-4 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl font-bold text-ink-900">
            {metrics?.totalBooks ?? 0}
          </div>
          <span className="text-[10px] font-serif text-stone-500 mt-1 block">Active in Stacks</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-[11px] uppercase text-stone-500 font-bold">
              Registered Guild
            </span>
            <Users className="w-4 h-4 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl font-bold text-ink-900">
            {metrics?.totalUsers ?? 0}
          </div>
          <span className="text-[10px] font-serif text-stone-500 mt-1 block">Total Scholar Accounts</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-[11px] uppercase text-stone-500 font-bold">
              Archival Sellers
            </span>
            <Store className="w-4 h-4 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl font-bold text-ink-900">
            {metrics?.totalSellers ?? 0}
          </div>
          <span className="text-[10px] font-serif text-stone-500 mt-1 block">Accredited Dealerships</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-[11px] uppercase text-stone-500 font-bold">
              Platform Orders
            </span>
            <Package className="w-4 h-4 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl font-bold text-ink-900">
            {metrics?.totalOrders ?? 0}
          </div>
          <span className="text-[10px] font-serif text-stone-500 mt-1 block">All Dispatch Records</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-[11px] uppercase text-stone-500 font-bold">
              Gross Volume
            </span>
            <DollarSign className="w-4 h-4 text-burgundy-700" />
          </div>
          <div className="font-cinzel text-2xl font-bold text-burgundy-700">
            {formatCurrency(metrics?.grossVolume ?? 0)}
          </div>
          <span className="text-[10px] font-serif text-stone-500 mt-1 block">Non-Cancelled Sales</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-gold-500 transition-all duration-200 shadow-sm group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-burgundy-700/10 text-burgundy-700 flex items-center justify-center mb-4 group-hover:bg-burgundy-700 group-hover:text-parchment-50 transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="font-cinzel text-base font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
              Global Orders Ledger
            </h2>
            <p className="text-xs text-stone-500 font-serif mt-2 leading-relaxed">
              Audit all customer checkout records across the platform. Update order dispatch statuses (`Confirmed`, `Shipped`, `Delivered`, `Cancelled`) with irreversible terminal state machine enforcement.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-cinzel text-burgundy-700 font-bold">
            <span>Manage Orders</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/books"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-gold-500 transition-all duration-200 shadow-sm group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-burgundy-700/10 text-burgundy-700 flex items-center justify-center mb-4 group-hover:bg-burgundy-700 group-hover:text-parchment-50 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-cinzel text-base font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
              Curatorial Catalog Control
            </h2>
            <p className="text-xs text-stone-500 font-serif mt-2 leading-relaxed">
              Inspect all manuscripts across all eras, review dealer attributions, check live inventory counts, and delist compromised or out-of-print volumes while preserving historical receipts.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-cinzel text-burgundy-700 font-bold">
            <span>Inspect Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-gold-500 transition-all duration-200 shadow-sm group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-burgundy-700/10 text-burgundy-700 flex items-center justify-center mb-4 group-hover:bg-burgundy-700 group-hover:text-parchment-50 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-cinzel text-base font-bold text-ink-900 group-hover:text-burgundy-700 transition-colors">
              Scholar &amp; Seller Directory
            </h2>
            <p className="text-xs text-stone-500 font-serif mt-2 leading-relaxed">
              Inspect guild members, review archival dealership credentials, and monitor role distribution. Hardened with explicit zero-password-hash leakage projection.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-cinzel text-burgundy-700 font-bold">
            <span>View Directory</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
