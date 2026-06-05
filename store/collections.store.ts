"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { PublicProduct } from "@/data";

const LIMIT = 50;

type CollectionsState = {
  products: PublicProduct[];
  total: number;
  page: number;
  loading: boolean;
  fetchMore: () => Promise<void>;
};

export const useCollectionsStore = create<CollectionsState>()((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  loading: false,

  fetchMore: async () => {
    const { loading, page, products, total } = get();
    if (loading || products.length >= total) return;
    const nextPage = page + 1;
    set({ loading: true });
    try {
      const res = await api.get<{ data: PublicProduct[]; meta: { total: number } }>(
        `/api/products?page=${nextPage}&limit=${LIMIT}`,
      );
      set((s) => ({
        products: [...s.products, ...(res.data.data ?? [])],
        total: res.data.meta?.total ?? s.total,
        page: nextPage,
      }));
    } finally {
      set({ loading: false });
    }
  },
}));
