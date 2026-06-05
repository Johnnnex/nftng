"use client";
import { create } from "zustand";

export type ConfirmDeliveryData = {
  tripOrderId: string;
  orderId: string;
  orderRef: string;
  userName: string;
  userAddress: string;
  riderName: string;
  items: {
    id: string;
    productTitle: string;
    productImage: string | null;
    variantCombo: Record<string, string>;
    quantity: number;
    unitPrice: number;
    status: string;
  }[];
};

type ConfirmDeliveryState = {
  data: ConfirmDeliveryData | null;
};

export const useConfirmDeliveryStore = create<ConfirmDeliveryState>()(() => ({
  data: null,
}));
