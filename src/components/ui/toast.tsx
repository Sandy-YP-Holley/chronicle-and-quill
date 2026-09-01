"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-[#FBF9F5] border-emerald-700/60 text-emerald-950"
              : toast.type === "error"
              ? "bg-[#FBF9F5] border-red-700/60 text-red-950"
              : "bg-[#FBF9F5] border-[#D97706]/60 text-[#1C1917]"
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-[#D97706] shrink-0" />}
            <p className="text-xs sm:text-sm font-serif font-medium leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
