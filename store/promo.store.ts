"use client";
import { create } from "zustand";
import { authRequest } from "@/lib/api";
import type { PromoCodeRecord, PromoCodeFormData, PaginationMeta } from "@/data";

const LIMIT = 50;

type PromoState = {
  promoCodes: PromoCodeRecord[];
  meta: PaginationMeta;
  search: string;
  loading: boolean;
  fetchPromoCodes: (page?: number, search?: string) => Promise<void>;
  createPromoCode: (data: PromoCodeFormData) => Promise<PromoCodeRecord>;
  togglePromoCode: (id: string, isActive: boolean) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
};

export const usePromoStore = create<PromoState>()((set, get) => ({
  promoCodes: [],
  meta: { total: 0, page: 1, limit: LIMIT },
  search: "",
  loading: true,

  fetchPromoCodes: async (page = 1, search) => {
    const s = search !== undefined ? search : get().search;
    set({ loading: true, search: s });
    const params = new URLSearchParams({ page: String(page) });
    if (s) params.set("search", s);
    const res = await authRequest({ url: `/api/admin/promo-codes?${params}` });
    set({ promoCodes: res.data.data, meta: res.data.meta, loading: false });
  },

  createPromoCode: async (data) => {
    const res = await authRequest({ method: "POST", url: "/api/admin/promo-codes", data });
    const record: PromoCodeRecord = res.data.data;
    set((s) => ({ promoCodes: [record, ...s.promoCodes], meta: { ...s.meta, total: s.meta.total + 1 } }));
    return record;
  },

  togglePromoCode: async (id, isActive) => {
    await authRequest({ method: "PATCH", url: `/api/admin/promo-codes/${id}`, data: { isActive } });
    set((s) => ({
      promoCodes: s.promoCodes.map((p) => (p.id === id ? { ...p, isActive } : p)),
    }));
  },

  deletePromoCode: async (id) => {
    await authRequest({ method: "DELETE", url: `/api/admin/promo-codes/${id}` });
    set((s) => ({ promoCodes: s.promoCodes.filter((p) => p.id !== id), meta: { ...s.meta, total: Math.max(0, s.meta.total - 1) } }));
  },
}));
