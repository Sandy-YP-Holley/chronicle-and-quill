"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Check,
  XCircle,
  Search,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatCurrency } from "@/lib/formatters";
import { OrderStatus } from "@/models/order";

interface AdminOrder {
  id: string;
  ownerId: string;
  items: Array<{ title: string; price: number; quantity: number; bookId: string }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: { fullName: string; city: string; country: string };
  status: OrderStatus;
  createdAt: string;
}

const STATUS_FILTERS: Array<"All" | OrderStatus> = [
  "All",
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const { showToast, showConfirm } = useStore();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<"All" | OrderStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        showToast("Access restricted or failed to load orders.", "error");
      }
    } catch {
      showToast("Network error fetching orders.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let result = [...orders];

    if (activeFilter !== "All") {
      result = result.filter((o) => o.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.shippingAddress.fullName.toLowerCase().includes(q) ||
          o.shippingAddress.city.toLowerCase().includes(q) ||
          o.items.some((it) => it.title.toLowerCase().includes(q))
      );
    }

    setFilteredOrders(result);
  }, [orders, activeFilter, searchQuery]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.status === "Cancelled" || targetOrder.status === "Delivered") {
      showToast(`Cannot modify order ${orderId.slice(-8)}: It is in terminal state "${targetOrder.status}".`, "error");
      return;
    }

    const action = () => executeStatusChange(orderId, newStatus);

    if (newStatus === "Cancelled") {
      showConfirm({
        title: "Cancel Order & Restore Inventory?",
        description: `Are you sure you want to transition order ${orderId.slice(-8)} to Cancelled? This will automatically restore each volume's stock back into the Archival Stacks. This action cannot be reversed.`,
        confirmLabel: "Cancel Order",
        cancelLabel: "Dismiss",
        variant: "danger",
        onConfirm: action,
      });
    } else {
      await action();
    }
  }

  async function executeStatusChange(orderId: string, newStatus: OrderStatus) {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Order updated to ${newStatus}.`, "success");
        fetchOrders();
      } else {
        showToast(data.detail || "Failed to update order status.", "error");
      }
    } catch {
      showToast("Network error updating order status.", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function getStatusBadge(status: OrderStatus) {
    switch (status) {
      case "Pending":
        return { bg: "bg-stone-100 text-stone-800 border-stone-300", icon: Clock };
      case "Confirmed":
        return { bg: "bg-blue-50 text-blue-800 border-blue-200", icon: CheckCircle2 };
      case "Shipped":
        return { bg: "bg-amber-50 text-amber-800 border-amber-200", icon: Truck };
      case "Delivered":
        return { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: Check };
      case "Cancelled":
        return { bg: "bg-red-50 text-red-800 border-red-200", icon: XCircle };
      default:
        return { bg: "bg-stone-100 text-stone-800 border-stone-200", icon: Clock };
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-cinzel text-stone-500 hover:text-burgundy-700 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overseer Suite</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
            Global Orders Ledger
          </h1>
          <p className="text-xs text-stone-500 font-serif mt-1">
            Audit customer checkout dispatches and advance order states through the archival delivery lifecycle.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, recipient..."
            className="w-full bg-white border border-stone-300 rounded-md py-2 pl-8 pr-3 text-xs text-ink-900 focus:outline-none focus:border-gold-500 font-serif"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            onClick={() => setActiveFilter(st)}
            className={`text-xs font-cinzel uppercase px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeFilter === st
                ? "bg-burgundy-700 text-parchment-50 font-bold shadow-xs"
                : "bg-white text-stone-600 hover:bg-parchment-100 border border-stone-200"
            }`}
          >
            {st} {st === "All" ? `(${orders.length})` : `(${orders.filter((o) => o.status === st).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-12">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="font-cinzel text-xs uppercase text-stone-500">
              Retrieving Ledger Records...
            </span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-8 h-8 text-stone-400 mx-auto mb-3" />
            <h3 className="font-cinzel text-sm font-bold text-ink-900 mb-1">
              No Matching Orders Found
            </h3>
            <p className="text-xs text-stone-500 font-serif">
              Try adjusting your status filter or query keywords.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-parchment-100/60 font-cinzel text-[11px] uppercase tracking-wider text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Order ID &amp; Date</th>
                  <th className="py-3.5 px-4">Customer &amp; Destination</th>
                  <th className="py-3.5 px-4">Line Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-6 text-right">Lifecycle Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const isTerminal = order.status === "Cancelled" || order.status === "Delivered";

                  return (
                    <tr key={order.id} className="hover:bg-parchment-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          href={`/order/${order.id}`}
                          className="font-mono text-xs font-bold text-burgundy-700 hover:underline block"
                        >
                          #{order.id.slice(-8).toUpperCase()}
                        </Link>
                        <span className="text-[11px] font-mono text-stone-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-ink-900 block truncate max-w-xs">
                          {order.shippingAddress.fullName}
                        </span>
                        <span className="text-[11px] text-stone-500 truncate block max-w-xs">
                          {order.shippingAddress.city}, {order.shippingAddress.country}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-sm">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-xs text-ink-900 truncate">
                              <span className="font-semibold">{it.title}</span> &times; {it.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-cinzel font-bold text-ink-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border ${badge.bg}`}
                        >
                          <badge.icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{order.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isTerminal ? (
                          <span className="text-[11px] font-mono text-stone-400 italic">
                            Terminal State (Locked)
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className="bg-parchment-50 border border-stone-300 rounded px-2.5 py-1 text-xs font-cinzel uppercase text-ink-900 focus:outline-none focus:border-gold-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value="Pending" disabled>Pending</option>
                              <option value="Confirmed">Confirm Order</option>
                              <option value="Shipped">Mark Shipped</option>
                              <option value="Delivered">Mark Delivered</option>
                              <option value="Cancelled">Cancel &amp; Restock</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
