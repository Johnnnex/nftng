"use client";
import { useEffect } from "react";
import { useProductStore } from "@/store";
import type { EcommerceConfig } from "@/data";

export function SalesConfigInitializer({ results }: { results: [EcommerceConfig | null] }) {
  useEffect(() => {
    useProductStore.setState({ config: results[0] });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
