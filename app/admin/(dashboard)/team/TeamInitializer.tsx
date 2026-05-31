/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect } from "react";
import { useTeamStore } from "@/store";
import type { AdminRecord, RoleTemplate, PendingInvite, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;
const DEFAULT_PAGE: PaginationMeta = { total: 0, page: 1, limit: 50 };

export function TeamInitializer({
  results,
}: {
  results: [Paged<AdminRecord>, Paged<RoleTemplate>, Paged<PendingInvite>];
}) {
  useEffect(() => {
    useTeamStore.setState({
      admins: results[0]?.data ?? [],
      roles: results[1]?.data ?? [],
      invites: results[2]?.data ?? [],
      meta: {
        admins: results[0]?.meta ?? DEFAULT_PAGE,
        roles: results[1]?.meta ?? DEFAULT_PAGE,
        invites: results[2]?.meta ?? DEFAULT_PAGE,
      },
      loading: false,
    });
  }, []);
  return null;
}
