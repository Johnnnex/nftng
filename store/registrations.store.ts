"use client";
import { create } from "zustand";
import { authRequest } from "@/lib/api";
import type { RegistrantRecord, RegistrationsTab } from "@/data";
import type { PaginationMeta } from "@/data";

const LIMIT = 50;

type RegState = {
  registrations: RegistrantRecord[];
  attendees: RegistrantRecord[];
  meta: { registrations: PaginationMeta; attendees: PaginationMeta };
  baseTotals: { registrations: number; attendees: number };
  search: { registrations: string; attendees: string };
  loading: { registrations: boolean; attendees: boolean };
  fetchTab: (tab: RegistrationsTab, page?: number, search?: string) => Promise<void>;
  markAttendance: (id: string, attended: boolean, tab: RegistrationsTab) => Promise<void>;
};

const DEFAULT_META: PaginationMeta = { total: 0, page: 1, limit: LIMIT };

export const useRegistrationsStore = create<RegState>()((set) => ({
  registrations: [],
  attendees: [],
  meta: { registrations: DEFAULT_META, attendees: DEFAULT_META },
  baseTotals: { registrations: 0, attendees: 0 },
  search: { registrations: "", attendees: "" },
  loading: { registrations: true, attendees: true },

  fetchTab: async (tab, page = 1, search = "") => {
    set((st) => ({
      loading: { ...st.loading, [tab]: true },
      search: { ...st.search, [tab]: search },
    }));
    const params = new URLSearchParams({ tab, page: String(page) });
    if (search) params.set("search", search);
    const res = await authRequest({ url: `/api/admin/registrations?${params}` });
    set((st) => ({
      [tab]: res.data.data,
      meta: { ...st.meta, [tab]: res.data.meta },
      loading: { ...st.loading, [tab]: false },
      // Only keep baseTotals in sync on unfiltered fetches
      ...(!search && { baseTotals: { ...st.baseTotals, [tab]: res.data.meta.total } }),
    }));
  },

  markAttendance: async (id, attended, tab) => {
    await authRequest({ method: "PATCH", url: `/api/admin/registrations/${id}/attend`, data: { attended } });
    set((st) => {
      const removeFrom: RegistrationsTab = attended ? "registrations" : "attendees";
      const addTo: RegistrationsTab = attended ? "attendees" : "registrations";
      const record = (st[removeFrom] as RegistrantRecord[]).find((r) => r.id === id);
      if (!record) return st;
      const updated = { ...record, attended, attendedAt: attended ? new Date().toISOString() : null };
      return {
        [removeFrom]: (st[removeFrom] as RegistrantRecord[]).filter((r) => r.id !== id),
        [addTo]: [updated, ...(st[addTo] as RegistrantRecord[])],
        meta: {
          ...st.meta,
          [removeFrom]: { ...st.meta[removeFrom], total: Math.max(0, st.meta[removeFrom].total - 1) },
          [addTo]: { ...st.meta[addTo], total: st.meta[addTo].total + 1 },
        },
        baseTotals: {
          ...st.baseTotals,
          [removeFrom]: Math.max(0, st.baseTotals[removeFrom] - 1),
          [addTo]: st.baseTotals[addTo] + 1,
        },
      };
    });
    void tab;
  },
}));
