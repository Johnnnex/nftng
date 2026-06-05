"use client";
import { useEffect } from "react";
import { usePromoStore } from "@/store";
import type { PromoCodeRecord, PaginationMeta } from "@/data";

type PromoPage = { data: PromoCodeRecord[]; meta: PaginationMeta };

export function PromoCodesInitializer({ results }: { results: [PromoPage | null] }) {
  useEffect(() => {
    const page = results[0];
    usePromoStore.setState({
      promoCodes: page?.data ?? [],
      meta: page?.meta ?? { total: 0, page: 1, limit: 50 },
      loading: false,
    });
  }, []);
  return null;
}
