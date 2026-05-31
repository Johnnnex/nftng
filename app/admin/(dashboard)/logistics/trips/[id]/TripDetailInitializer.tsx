"use client";
import { useEffect } from "react";
import { useLogisticsStore } from "@/store";
import type { TripDetail } from "@/data";

export function TripDetailInitializer({ results }: { results: [TripDetail | null] }) {
  useEffect(() => {
    useLogisticsStore.setState({ activeTrip: results[0], activeTripLoading: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
