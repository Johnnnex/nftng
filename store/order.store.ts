"use client";
import { create } from "zustand";
import { authRequest } from "@/lib/api";
import type { OrderRecord, OrderDetail, PaginationMeta } from "@/data";

const LIMIT = 50;

type OrderMeta = { orders: PaginationMeta };
const DEFAULT_META: OrderMeta = {
  orders: { total: 0, page: 1, limit: LIMIT },
};

type OrderState = {
  orders: OrderRecord[];
  meta: OrderMeta;
  loading: boolean;
  activeOrder: OrderDetail | null;
  activeOrderLoading: boolean;

  fetchOrders: (page: number, search?: string) => Promise<void>;
  fetchOrderDetail: (id: string) => Promise<void>;
  markPackaged: (orderId: string, itemId: string) => Promise<void>;
  markLogisticsReady: (orderId: string, itemId: string) => Promise<void>;
  markAllLogisticsReady: (orderId: string) => Promise<void>;
  refundItem: (orderId: string, itemId: string, amount: number, notes?: string) => Promise<void>;
  refundOrder: (orderId: string, amount: number, notes?: string) => Promise<void>;
  setActiveOrder: (order: OrderDetail | null) => void;
};

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  meta: DEFAULT_META,
  loading: true,
  activeOrder: null,
  activeOrderLoading: false,

  fetchOrders: async (page, search) => {
    set({ loading: true });
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) params.set("search", search);
    const res = await authRequest({ url: `/api/admin/orders?${params}` });
    set((s) => ({
      orders: res.data.data,
      meta: { ...s.meta, orders: res.data.meta },
      loading: false,
    }));
  },

  fetchOrderDetail: async (id) => {
    set({ activeOrderLoading: true });
    const res = await authRequest({ url: `/api/admin/orders/${id}` });
    set({ activeOrder: res.data.data, activeOrderLoading: false });
  },

  markPackaged: async (orderId, itemId) => {
    await authRequest({ method: "PATCH", url: `/api/admin/orders/${orderId}/items/${itemId}`, data: { status: "packaged" } });
    await get().fetchOrderDetail(orderId);
    const updated = get().activeOrder;
    if (updated) set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)) }));
  },

  markLogisticsReady: async (orderId, itemId) => {
    await authRequest({ method: "PATCH", url: `/api/admin/orders/${orderId}/items/${itemId}`, data: { logisticsReady: true } });
    await get().fetchOrderDetail(orderId);
  },

  markAllLogisticsReady: async (orderId) => {
    await authRequest({ method: "POST", url: `/api/admin/orders/${orderId}/logistics-ready` });
    await get().fetchOrderDetail(orderId);
  },

  refundItem: async (orderId, itemId, amount, notes) => {
    await authRequest({ method: "POST", url: `/api/admin/orders/${orderId}/items/${itemId}/refund`, data: { amount, notes } });
    await get().fetchOrderDetail(orderId);
    const updated = get().activeOrder;
    if (updated) set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)) }));
  },

  refundOrder: async (orderId, amount, notes) => {
    await authRequest({ method: "POST", url: `/api/admin/orders/${orderId}/refund`, data: { amount, notes } });
    await get().fetchOrderDetail(orderId);
    set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: "refunded" as const } : o)) }));
  },

  setActiveOrder: (order) => set({ activeOrder: order }),
}));
