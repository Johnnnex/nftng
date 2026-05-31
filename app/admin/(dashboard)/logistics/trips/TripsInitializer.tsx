"use client";
import { useEffect } from "react";
import { useLogisticsStore } from "@/store";
import type { TripRecord, PaginationMeta } from "@/data";

type Result = { data: TripRecord[]; meta: PaginationMeta } | null;

export function TripsInitializer({ results }: { results: [Result] }) {
  useEffect(() => {
    const r = results[0];
    useLogisticsStore.setState({
      trips: r?.data ?? [],
      meta: { ...useLogisticsStore.getState().meta, trips: r?.meta ?? { total: 0, page: 1, limit: 50 } },
      tripsLoading: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
