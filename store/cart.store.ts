"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartItemKey } from "@/data";
import type { CartItem } from "@/data";

type CartState = {
  items: CartItem[];
  favoriteIds: string[];

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantCombo: Record<string, string>) => void;
  updateQty: (productId: string, variantCombo: Record<string, string>, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteIds: [],

      addItem: (item) => {
        const key = cartItemKey(item.productId, item.variantCombo);
        set((s) => {
          const existing = s.items.find((i) => cartItemKey(i.productId, i.variantCombo) === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                cartItemKey(i.productId, i.variantCombo) === key
                  ? { ...i, qty: Math.min(i.qty + item.qty, item.maxQty), maxQty: item.maxQty }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, qty: Math.min(item.qty, item.maxQty) }] };
        });
      },

      removeItem: (productId, variantCombo) => {
        const key = cartItemKey(productId, variantCombo);
        set((s) => ({ items: s.items.filter((i) => cartItemKey(i.productId, i.variantCombo) !== key) }));
      },

      updateQty: (productId, variantCombo, qty) => {
        const key = cartItemKey(productId, variantCombo);
        set((s) => {
          const item = s.items.find((i) => cartItemKey(i.productId, i.variantCombo) === key);
          if (!item) return s;
          if (qty <= 0) return { items: s.items.filter((i) => cartItemKey(i.productId, i.variantCombo) !== key) };
          return {
            items: s.items.map((i) =>
              cartItemKey(i.productId, i.variantCombo) === key
                ? { ...i, qty: Math.min(qty, i.maxQty) }
                : i,
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      toggleFavorite: (productId) =>
        set((s) => ({
          favoriteIds: s.favoriteIds.includes(productId)
            ? s.favoriteIds.filter((id) => id !== productId)
            : [...s.favoriteIds, productId],
        })),

      isFavorite: (productId) => get().favoriteIds.includes(productId),
    }),
    {
      name: "nftng-cart",
      partialize: (s) => ({ items: s.items, favoriteIds: s.favoriteIds }),
    },
  ),
);
