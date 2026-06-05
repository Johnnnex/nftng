"use client";
import { useEffect } from "react";
import { useProductStore } from "@/store";
import type { EcommerceConfig } from "@/data";

type WrappedConfig = { data: EcommerceConfig } | null;

export function SalesConfigInitializer({ results }: { results: [WrappedConfig] }) {
  useEffect(() => {
    useProductStore.setState({ config: results[0]?.data ?? null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
