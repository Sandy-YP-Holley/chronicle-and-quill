"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ToastContainer, ToastData } from "@/components/ui/toast";
import { ArchivalModal, ModalProps } from "@/components/ui/modal";

export type UserRole = "buyer" | "seller" | "admin" | "customer";

export interface UserProfile {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
  sellerName?: string;
  sellerBio?: string;
  specialtyEra?: string;
  isApprovedSeller?: boolean;
}

export interface EnrichedCartItem {
  bookId: string;
  title: string;
  authors: string[];
  price: number;
  quantity: number;
  imageUrl: string;
  period: string;
  format: string;
  stock: number;
  lineTotal: number;
}

export interface EnrichedCart {
  items: EnrichedCartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
}

interface StoreContextType {
  user: UserProfile | null;
  cart: EnrichedCart;
  wishlistIds: string[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isLoadingCart: boolean;
  isLoadingUser: boolean;
  addToCart: (bookId: string, quantity?: number, title?: string) => Promise<boolean>;
  updateCartQuantity: (bookId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (bookId: string) => Promise<boolean>;
  toggleWishlist: (bookId: string, title?: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  logout: () => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
  closeModal: () => void;
}

const defaultCart: EnrichedCart = {
  items: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  itemCount: 0,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<EnrichedCart>(defaultCart);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setModalConfig({
      isOpen: true,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel || "Confirm",
      cancelLabel: options.cancelLabel || "Cancel",
      variant: options.variant || "info",
      isLoading: false,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isLoading: true }));
        try {
          await options.onConfirm();
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
      onCancel: () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoadingUser(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart || defaultCart);
      } else {
        setCart(defaultCart);
      }
    } catch {
      setCart(defaultCart);
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        const items = data.wishlist?.items || [];
        setWishlistIds(items.map((item: { id: string }) => item.id));
      } else {
        setWishlistIds([]);
      }
    } catch {
      setWishlistIds([]);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshCart();
  }, [refreshUser, refreshCart]);

  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [user, refreshWishlist]);

  const addToCart = useCallback(
    async (bookId: string, quantity = 1, title?: string) => {
      try {
        setIsLoadingCart(true);
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, quantity }),
        });

        if (res.ok) {
          const data = await res.json();
          setCart(data.cart || defaultCart);
          showToast(
            title ? `Added "${title}" to your archival cart.` : "Added volume to your cart.",
            "success"
          );
          setIsCartOpen(true);
          return true;
        } else {
          const err = await res.json();
          showToast(err.detail || "Unable to add book to cart. Exceeds stock limit.", "error");
          return false;
        }
      } catch {
        showToast("Network error. Please try adding the book again.", "error");
        return false;
      } finally {
        setIsLoadingCart(false);
      }
    },
    [showToast]
  );

  const updateCartQuantity = useCallback(
    async (bookId: string, quantity: number) => {
      try {
        setIsLoadingCart(true);
        const res = await fetch("/api/cart/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, quantity }),
        });

        if (res.ok) {
          const data = await res.json();
          setCart(data.cart || defaultCart);
          return true;
        } else {
          const err = await res.json();
          showToast(err.detail || "Quantity adjustment exceeds available inventory.", "error");
          return false;
        }
      } catch {
        showToast("Network error updating cart.", "error");
        return false;
      } finally {
        setIsLoadingCart(false);
      }
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    async (bookId: string) => {
      try {
        setIsLoadingCart(true);
        const res = await fetch("/api/cart/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId }),
        });

        if (res.ok) {
          const data = await res.json();
          setCart(data.cart || defaultCart);
          showToast("Item removed from cart.", "info");
          return true;
        }
        return false;
      } catch {
        showToast("Failed to remove item from cart.", "error");
        return false;
      } finally {
        setIsLoadingCart(false);
      }
    },
    [showToast]
  );

  const toggleWishlist = useCallback(
    async (bookId: string, title?: string) => {
      if (!user) {
        showToast("Please sign in to your scholar account to save volumes.", "info");
        return false;
      }

      try {
        const res = await fetch("/api/wishlist/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.inWishlist) {
            setWishlistIds((prev) => [...prev, bookId]);
            showToast(title ? `Saved "${title}" to your wishlist.` : "Saved to wishlist.", "success");
          } else {
            setWishlistIds((prev) => prev.filter((id) => id !== bookId));
            showToast("Removed volume from wishlist.", "info");
          }
          return true;
        }
        return false;
      } catch {
        showToast("Failed to update wishlist.", "error");
        return false;
      }
    },
    [user, showToast]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setWishlistIds([]);
      await refreshCart();
      showToast("You have been logged out of the archive.", "info");
    } catch {
      showToast("Error during logout.", "error");
    }
  }, [refreshCart, showToast]);

  return (
    <StoreContext.Provider
      value={{
        user,
        cart,
        wishlistIds,
        isCartOpen,
        setIsCartOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isLoadingCart,
        isLoadingUser,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        toggleWishlist,
        refreshUser,
        refreshCart,
        refreshWishlist,
        logout,
        showToast,
        showConfirm,
        closeModal,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ArchivalModal {...modalConfig} />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
