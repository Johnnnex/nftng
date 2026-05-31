"use client";
import { useEffect } from "react";
import { useLogisticsStore } from "@/store";
import type { OutsideNigeriaOrder, PaginationMeta } from "@/data";

type Result = { data: OutsideNigeriaOrder[]; meta: PaginationMeta } | null;

export function InternationalInitializer({ results }: { results: [Result] }) {
  useEffect(() => {
    const r = results[0];
    useLogisticsStore.setState({
      international: r?.data ?? [],
      meta: { ...useLogisticsStore.getState().meta, international: r?.meta ?? { total: 0, page: 1, limit: 50 } },
      internationalLoading: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
