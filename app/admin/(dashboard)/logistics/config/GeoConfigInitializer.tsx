"use client";
import { useEffect } from "react";
import { useLogisticsStore } from "@/store";
import type { GeoCountry } from "@/data";

type Result = { data: GeoCountry[] } | null;

export function GeoConfigInitializer({ results }: { results: [Result] }) {
  useEffect(() => {
    useLogisticsStore.setState({
      countries: results[0]?.data ?? [],
      geoLoading: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
