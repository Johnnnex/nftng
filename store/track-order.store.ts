"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { TrackOrderResult } from "@/data";
import type { ItemStatus, OrderStatus } from "@/components";

type TrackOrderState = {
  result: TrackOrderResult | null;
  loading: boolean;
  error: string | null;
  trackOrder: (ref: string) => Promise<void>;
  clear: () => void;
};

export const useTrackOrderStore = create<TrackOrderState>()((set) => ({
  result: null,
  loading: false,
  error: null,

  trackOrder: async (ref) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: ApiTrackResult }>(`/api/orders/track?ref=${encodeURIComponent(ref)}`);
      const d = res.data.data;
      const result: TrackOrderResult = {
        id: d.orderRef,
        internalId: d.id,
        customer: d.userName,
        date: new Date(d.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        total: d.totalAmount ?? 0,
        items: d.items.length,
        status: d.status as OrderStatus,
        products: d.items.map((i) => ({
          id: i.id,
          name: i.productTitle,
          image: i.productImage,
          variantCombo: i.variantCombo,
          quantity: i.quantity,
          price: i.unitPrice,
          status: i.status as ItemStatus,
          refundAmount: i.refundAmount ?? null,
        })),
        userAddress: d.userAddress ?? undefined,
        cityName: d.userCityName ?? undefined,
        stateName: d.userStateName ?? undefined,
        orderRefundAmount: d.orderRefundAmount ?? null,
      };
      set({ result, loading: false });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      set({ error: msg ?? "Order not found", loading: false });
    }
  },

  clear: () => set({ result: null, error: null }),
}));

type ApiTrackResult = {
  id: string;
  orderRef: string;
  status: string;
  userName: string;
  userEmail: string;
  userAddress: string | null;
  userCityName: string | null;
  userStateName: string | null;
  totalAmount: number | null;
  deliveryFee: number | null;
  orderRefundAmount: number | null;
  createdAt: string;
  items: {
    id: string;
    productTitle: string;
    productImage: string | null;
    variantCombo: Record<string, string>;
    quantity: number;
    unitPrice: number;
    status: string;
    logisticsReady: boolean;
    refundAmount: number | null;
    packagedAt: string | null;
    enrouteAt: string | null;
    deliveredAt: string | null;
  }[];
};
