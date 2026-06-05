"use client";
import { useEffect } from "react";
import { useProductStore } from "@/store";
import type { ProductDetail } from "@/data";

type WrappedDetail = { data: ProductDetail } | null;

export function EditProductInitializer({ results }: { results: [WrappedDetail] }) {
  useEffect(() => {
    useProductStore.getState().setOriginalDetail(results[0]?.data ?? null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
