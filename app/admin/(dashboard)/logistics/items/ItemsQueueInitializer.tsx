"use client";
import { useEffect } from "react";
import { useLogisticsStore } from "@/store";
import type { LogisticsQueueItem, PaginationMeta } from "@/data";

type TabResult = { data: LogisticsQueueItem[]; meta: PaginationMeta } | null;

export function ItemsQueueInitializer({ results }: { results: [TabResult, TabResult] }) {
  useEffect(() => {
    const available = results[0];
    const onTrip = results[1];
    useLogisticsStore.setState({
      items: available?.data ?? [],
      onTripItems: onTrip?.data ?? [],
      meta: {
        ...useLogisticsStore.getState().meta,
        items: available?.meta ?? { total: 0, page: 1, limit: 50 },
        onTripItems: onTrip?.meta ?? { total: 0, page: 1, limit: 50 },
      },
      itemsLoading: { available: false, on_trip: false },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
