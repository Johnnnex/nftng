/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect } from "react";
import { useTeamStore } from "@/store";
import type { RoleTemplate, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;
const DEFAULT_PAGE: PaginationMeta = { total: 0, page: 1, limit: 50 };

export function RolesInitializer({ results }: { results: [Paged<RoleTemplate>] }) {
  useEffect(() => {
    useTeamStore.setState((s) => ({
      roles: results[0]?.data ?? [],
      meta: { ...s.meta, roles: results[0]?.meta ?? DEFAULT_PAGE },
      loading: false,
    }));
  }, []);
  return null;
}
