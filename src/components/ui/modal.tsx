"use client";

import React, { useEffect } from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function ArchivalModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  isLoading = false,
  onConfirm,
  onCancel,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && onCancel && !isLoading) {
        onCancel();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  function getVariantIcon() {
    switch (variant) {
      case "danger":
        return (
          <div className="w-11 h-11 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case "warning":
        return (
          <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="w-11 h-11 rounded-full bg-[#EDE4D3] border border-[#D97706]/40 flex items-center justify-center text-[#7C2D12] shrink-0">
            <Info className="w-5 h-5 text-[#D97706]" />
          </div>
        );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archival-modal-title"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isLoading && onCancel) onCancel();
        }}
      />

      <div className="min-h-full flex items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-xl bg-[#FBF9F5] border border-[#D97706]/50 p-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-4 right-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none disabled:opacity-40"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="sm:flex sm:items-start gap-4">
            {getVariantIcon()}
            <div className="mt-3 text-center sm:mt-0 sm:text-left flex-1">
              <h3
                id="archival-modal-title"
                className="font-cinzel text-lg font-bold text-[#1C1917]"
              >
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-xs sm:text-sm text-stone-600 font-serif leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:flex sm:flex-row-reverse gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-md font-cinzel text-xs uppercase tracking-wider font-bold shadow-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none disabled:opacity-50 ${
                variant === "danger"
                  ? "bg-red-800 hover:bg-red-900 text-white"
                  : "bg-[#7C2D12] hover:bg-[#9A3412] text-[#FBF9F5]"
              }`}
            >
              {isLoading ? "Processing..." : confirmLabel}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 font-cinzel text-xs uppercase tracking-wider font-semibold text-stone-700 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
