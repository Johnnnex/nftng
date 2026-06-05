"use client";
import { create } from "zustand";
import type { OutsideNigeriaOrder } from "@/data";

type PreviewOrderState = {
  order: OutsideNigeriaOrder | null;
};

export const usePreviewOrderStore = create<PreviewOrderState>()(() => ({
  order: null,
}));
