"use client";
import { useEffect } from "react";
import { useProductStore } from "@/store";
import type { ProductDetail } from "@/data";

export function EditProductInitializer({ results }: { results: [ProductDetail | null] }) {
  useEffect(() => {
    useProductStore.getState().setOriginalDetail(results[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
