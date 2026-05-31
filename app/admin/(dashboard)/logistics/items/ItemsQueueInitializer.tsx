"use client";
import { useEffect } from "react";
import { useLogisticsStore } from "@/store";
import type { LogisticsQueueItem, PaginationMeta } from "@/data";

type Result = { data: LogisticsQueueItem[]; meta: PaginationMeta } | null;

export function ItemsQueueInitializer({ results }: { results: [Result] }) {
  useEffect(() => {
    const r = results[0];
    useLogisticsStore.setState({
      items: r?.data ?? [],
      meta: { ...useLogisticsStore.getState().meta, items: r?.meta ?? { total: 0, page: 1, limit: 50 } },
      itemsLoading: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
