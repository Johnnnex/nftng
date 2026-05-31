"use client";
import { useEffect } from "react";
import { useProductStore } from "@/store";
import type { ProductRecord, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;

export function ProductsInitializer({ results }: { results: [Paged<ProductRecord>] }) {
  useEffect(() => {
    useProductStore.setState((s) => ({
      products: results[0]?.data ?? [],
      meta: { ...s.meta, products: results[0]?.meta ?? { total: 0, page: 1, limit: 50 } },
      loading: false,
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
