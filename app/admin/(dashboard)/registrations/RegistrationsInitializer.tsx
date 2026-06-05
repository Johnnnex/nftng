"use client";
import { useEffect } from "react";
import { useRegistrationsStore } from "@/store";
import type { RegistrantRecord, PaginationMeta } from "@/data";

type RegPage = { data: RegistrantRecord[]; meta: PaginationMeta };

export function RegistrationsInitializer({ results }: { results: [RegPage | null] }) {
  useEffect(() => {
    const page = results[0];
    const regTotal = page?.meta?.total ?? 0;
    useRegistrationsStore.setState({
      registrations: page?.data ?? [],
      meta: {
        registrations: page?.meta ?? { total: 0, page: 1, limit: 50 },
        attendees: { total: 0, page: 1, limit: 50 },
      },
      baseTotals: { registrations: regTotal, attendees: 0 },
      loading: { registrations: false, attendees: true },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
