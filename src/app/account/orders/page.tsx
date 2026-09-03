"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Clock,
  Truck,
  Check,
  XCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

interface HistoricalOrder {
  id: string;
  createdAt: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user, isLoadingUser, showToast, showConfirm } = useStore();

  const [orders, setOrders] = useState<HistoricalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login?redirect=/account/orders");
      return;
    }

    async function loadOrders() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        showToast("Failed to retrieve order history.", "error");
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user, isLoadingUser, router, showToast]);

  function handleCancelOrder(orderId: string) {
    showConfirm({
      title: "Cancel Archival Dispatch",
      description:
        "Are you sure you want to cancel this order? All allocated manuscripts will be atomically restored to the catalog stacks.",
      confirmLabel: "Yes, Cancel Order",
      cancelLabel: "Keep Order",
      variant: "danger",
      onConfirm: async () => {
        try {
          setCancellingId(orderId);
          const res = await fetch(`/api/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "Cancelled",
              reason: "Scholar requested cancellation via customer portal.",
            }),
          });

          if (res.ok) {
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
            );
            showToast("Order cancelled successfully. Catalog stock has been restored.", "success");
          } else {
            const err = await res.json();
            showToast(err.detail || "Unable to cancel order.", "error");
          }
        } catch {
          showToast("Network error cancelling order.", "error");
        } finally {
          setCancellingId(null);
        }
      },
    });
  }

  if (isLoadingUser || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Accessing Archival Order Ledgers...
        </p>
      </div>
    );
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "Pending":
        return { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300", icon: Clock };
      case "Confirmed":
        return { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300", icon: Package };
      case "Shipped":
        return { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300", icon: Truck };
      case "Delivered":
        return { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300", icon: Check };
      case "Cancelled":
        return { bg: "bg-red-100", text: "text-red-900", border: "border-red-300", icon: XCircle };
      default:
        return { bg: "bg-stone-100", text: "text-stone-900", border: "border-stone-300", icon: Clock };
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB]">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Historical Order Archive
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-serif mt-1">
            Review simulated order dispatches, itemized breakdowns, and cancellation requests.
          </p>
        </div>
        <Link
          href="/account"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-cinzel uppercase text-stone-600 hover:text-[#7C2D12] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Profile</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center max-w-md mx-auto">
          <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h2 className="font-cinzel text-base font-bold text-[#1C1917] mb-1">
            No Historical Orders Recorded
          </h2>
          <p className="text-xs text-stone-500 font-serif mb-6">
            You have not placed any simulated dispatches through our bookstore yet.
          </p>
          <Link
            href="/books"
            className="bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider hover:bg-[#9A3412] transition-colors shadow-xs"
          >
            Explore The Stacks
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const StatusIcon = badge.icon;
            const canCancel = order.status === "Pending";

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-[#E5E7EB] shadow-2xs overflow-hidden"
              >
                <div className="p-3.5 sm:p-5 bg-[#F5F0E8] border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-stone-500 uppercase block">Order Reference</span>
                      <span className="font-mono text-xs font-bold text-[#1C1917] break-all">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-stone-500 uppercase block">Date Placed</span>
                      <span className="text-xs font-serif text-[#1C1917]">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-stone-500 uppercase block">Total Amount</span>
                      <span className="font-cinzel text-xs font-bold text-[#7C2D12]">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-cinzel font-bold px-2.5 py-1 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{order.status}</span>
                    </span>

                    <Link
                      href={`/order/${order.id}`}
                      className="text-xs font-cinzel uppercase text-stone-600 hover:text-[#7C2D12] flex items-center gap-1 p-1"
                      title="View itemized receipt"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-5 divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs font-serif">
                      <div className="pr-4">
                        <span className="font-playfair font-bold text-[#1C1917] text-sm block">
                          {item.title}
                        </span>
                        <span className="text-stone-500">
                          Qty: {item.quantity} &bull; {formatCurrency(item.price)} each
                        </span>
                      </div>
                      <span className="font-cinzel font-bold text-[#1C1917] shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-stone-50 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div className="text-[11px] font-mono text-stone-500">
                    Anti-IDOR Secured &bull; Simulated Card Delivery
                  </div>

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-50 border border-red-200 text-red-800 hover:bg-red-100 text-xs font-cinzel uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{cancellingId === order.id ? "Cancelling..." : "Cancel Order & Restore Stock"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
