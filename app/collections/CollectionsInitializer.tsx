"use client";
import { useEffect } from "react";
import { useCollectionsStore } from "@/store";
import type { PublicProduct } from "@/data";

type ApiResult = { data: PublicProduct[]; meta: { total: number; page: number; limit: number } } | null;

export function CollectionsInitializer({ results }: { results: [ApiResult] }) {
  useEffect(() => {
    useCollectionsStore.setState({
      products: results[0]?.data ?? [],
      total: results[0]?.meta?.total ?? 0,
      page: 1,
      loading: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
