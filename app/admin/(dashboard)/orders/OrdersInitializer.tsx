"use client";
import { useEffect } from "react";
import { useOrderStore } from "@/store";
import type { OrderRecord, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;

export function OrdersInitializer({ results }: { results: [Paged<OrderRecord>] }) {
  useEffect(() => {
    useOrderStore.setState((s) => ({
      orders: results[0]?.data ?? [],
      meta: { ...s.meta, orders: results[0]?.meta ?? { total: 0, page: 1, limit: 50 } },
      loading: false,
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
