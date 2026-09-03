"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  XCircle,
  Printer,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  createdAt: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  payment?: {
    paymentMethod: string;
    transactionId?: string;
    isTestOrder?: boolean;
    paidAt?: string;
  };
}

const LIFECYCLE_STEPS = [
  { status: "Pending", label: "Archival Order Placed", icon: Clock },
  { status: "Confirmed", label: "Vault Folios Bound", icon: Package },
  { status: "Shipped", label: "In Archival Transit", icon: Truck },
  { status: "Delivered", label: "Safely Delivered", icon: Check },
];

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        setErrorMsg("");
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        } else if (res.status === 403) {
          setErrorMsg("Anti-IDOR Security: You are not authorized to view this historical order record.");
        } else {
          setErrorMsg("Historical order record not found in archival logs.");
        }
      } catch {
        setErrorMsg("Failed to communicate with order inquiry API.");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-stone-500">
          Verifying Archival Order Record...
        </p>
      </div>
    );
  }

  if (!order || errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-700 mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-[#1C1917] mb-2">
          Order Access Restricted
        </h1>
        <p className="text-xs text-stone-600 font-serif mb-6 leading-relaxed">
          {errorMsg || "Unable to display order."}
        </p>
        <Link
          href="/account/orders"
          className="bg-[#7C2D12] text-[#FBF9F5] px-5 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider shadow-xs"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "Cancelled";
  const currentStepIndex = isCancelled ? -1 : LIFECYCLE_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full animate-fadeIn">
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-10 shadow-sm mb-8">
        <div className="text-center pb-8 border-b border-[#E5E7EB]">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Simulated Order Confirmed
          </span>
          <h1 className="font-cinzel text-3xl font-bold text-[#1C1917] mt-3 mb-2">
            Archival Dispatch Registered
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-serif max-w-md mx-auto">
            Order Reference: <span className="font-mono font-bold text-[#1C1917] break-all">{order.id}</span>
          </p>
        </div>

        <div className="py-8 border-b border-[#E5E7EB]">
          <h2 className="font-cinzel text-xs uppercase tracking-widest text-stone-500 font-bold mb-6 text-center">
            Order Lifecycle Progress
          </h2>

          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <span className="font-cinzel text-sm font-bold text-red-800 uppercase block mb-1">
                Order Cancelled &bull; Stock Restored
              </span>
              <p className="text-xs text-red-700 font-serif">
                This order was cancelled and physical book copies were automatically restored to catalog inventory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCompleted
                          ? "bg-[#7C2D12] text-[#FBF9F5] shadow-xs"
                          : "bg-stone-100 text-stone-400 border border-stone-200"
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-cinzel text-xs uppercase font-bold tracking-wider ${
                        isCurrent
                          ? "text-[#7C2D12]"
                          : isCompleted
                          ? "text-[#1C1917]"
                          : "text-stone-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 mt-0.5">
                      {isCurrent ? "Active Stage" : isCompleted ? "Completed" : "Queued"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="py-8 border-b border-[#E5E7EB] space-y-4">
          <h2 className="font-cinzel text-sm font-bold text-[#1C1917] uppercase tracking-wider">
            Itemized Preserved Folios
          </h2>

          <div className="divide-y divide-stone-100 border border-[#E5E7EB] rounded-lg overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between bg-stone-50/50">
                <div>
                  <h3 className="font-playfair text-sm font-bold text-[#1C1917]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-serif">
                    Quantity: {item.quantity} &bull; {formatCurrency(item.price)} each
                  </p>
                </div>
                <span className="font-cinzel text-sm font-bold text-[#1C1917]">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-1.5 text-xs font-serif text-[#44403C] max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Folio Subtotal</span>
              <span className="font-cinzel font-bold text-[#1C1917]">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Courier Delivery</span>
              <span className="font-cinzel text-[#1C1917]">
                {order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Simulated Sales Tax</span>
              <span className="font-mono">$0.00</span>
            </div>
            <div className="pt-2 border-t border-[#E5E7EB] flex justify-between text-sm font-bold text-[#1C1917]">
              <span className="font-cinzel">Grand Total</span>
              <span className="font-cinzel text-base text-[#7C2D12]">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-serif">
          <div className="bg-[#F5F0E8] p-4 rounded-lg border border-[#E5E7EB]">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-2">
              Dispatch Destination
            </h3>
            <p className="font-bold text-[#1C1917]">{order.shippingAddress.fullName}</p>
            <p className="text-stone-600">{order.shippingAddress.street}</p>
            <p className="text-stone-600">
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p className="text-stone-600">{order.shippingAddress.country}</p>
          </div>

          <div className="bg-[#F5F0E8] p-4 rounded-lg border border-[#E5E7EB]">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-2 flex items-center justify-between">
              <span>Payment Details</span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.2 rounded">
                Simulated
              </span>
            </h3>
            <p className="text-stone-700">
              Method: <span className="font-mono font-bold text-[#1C1917]">simulated_card</span>
            </p>
            <p className="text-stone-700">
              Transaction ID: <span className="font-mono text-[11px] text-stone-500">{order.payment?.transactionId || "N/A"}</span>
            </p>
            <p className="text-stone-700">
              Date: <span className="font-mono">{formatDate(order.createdAt)}</span>
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-800 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PCI-Safe Test Order (Zero Credit Card Storage)</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-[#F5F0E8] border border-[#E5E7EB] hover:border-[#D97706] text-[#1C1917] px-5 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Print Itemized Receipt</span>
          </button>
          <Link
            href="/books"
            className="flex items-center justify-center gap-2 bg-[#7C2D12] text-[#FBF9F5] hover:bg-[#9A3412] px-6 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            <span>Return to The Stacks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
