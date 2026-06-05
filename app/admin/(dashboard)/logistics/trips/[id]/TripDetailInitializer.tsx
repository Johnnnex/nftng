"use client";
import { useEffect } from "react";
import { useLogisticsStore } from "@/store";
import type { TripDetail } from "@/data";

type Result = { data: TripDetail } | null;

export function TripDetailInitializer({ results }: { results: [Result] }) {
  useEffect(() => {
    useLogisticsStore.setState({ activeTrip: results[0]?.data ?? null, activeTripLoading: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
