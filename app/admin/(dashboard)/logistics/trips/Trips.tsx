/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useLogisticsStore } from "@/store";
import { Table, StatusChip } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { TripRecord, TripStatus } from "@/data";
import { TRIP_STATUS_LABELS } from "@/data";

const LIMIT = 50;

const Skeleton = () => (
  <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse">
    <div className="h-14 bg-[#F3F4F6] border-b border-[#E5E7EB]" />
    <div className="p-4 flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`h-16 rounded-xl ${i % 2 === 0 ? "bg-[#F3F4F6]" : "bg-[#F9FAFB]"}`} />
      ))}
    </div>
  </div>
);

const TripStatusChip = ({ status }: { status: TripStatus }) => {
  const config = {
    draft: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#9CA3AF]" },
    dispatched: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    completed: { bg: "bg-[#6EC93E]/10", text: "text-[#3a7a1e]", dot: "bg-[#6EC93E]" },
  }[status] ?? { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#9CA3AF]" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-medium", config.bg, config.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {TRIP_STATUS_LABELS[status]}
    </span>
  );
};

const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Trips = () => {
  const router = useRouter();
  const { admin } = useAuthStore();
  const { trips, tripsLoading, meta, fetchTrips } = useLogisticsStore();
  hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "logistics", "read");

  const handleView = useCallback((id: string) => {
    router.push(`/admin/logistics/trips/${id}`);
  }, [router]);

  const columns = useMemo(() => [
    {
      title: "Code",
      width: 120,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] font-bold font-mono tracking-widest text-[#111827]")}>{r.code}</span>
      ),
    },
    {
      title: "Rider",
      minWidth: 160,
      customTableBody: (r: TripRecord) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{r.riderName}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.riderPhone}</p>
        </div>
      ),
    },
    {
      title: "Company",
      width: 120,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>{r.riderCompany ?? "—"}</span>
      ),
    },
    {
      title: "Items",
      width: 70,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.itemCount}</span>
      ),
    },
    {
      title: "Status",
      width: 130,
      customTableBody: (r: TripRecord) => <TripStatusChip status={r.status} />,
    },
    {
      title: "Dispatched",
      width: 110,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{fmt(r.dispatchedAt)}</span>
      ),
    },
    {
      title: "Created",
      width: 100,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{fmt(r.createdAt)}</span>
      ),
    },
    {
      title: "",
      width: 60,
      customTableBody: (r: TripRecord) => (
        <button
          onClick={() => handleView(r.id)}
          className={cn(satoshi.className, "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors")}
        >
          <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ], [handleView]);

  const data = useMemo(() => trips.map((r) => [r, r, r, r, r, r, r, r]), [trips]);


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Trips
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>({meta.trips.total})</span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>Dispatch trips and track delivery progress</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={tripsLoading}
          pagination
          metaData={{
            currentPage: (meta.trips.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.trips.page * LIMIT, meta.trips.total),
            totalRecords: meta.trips.total,
            onPageChange: (offset) => fetchTrips(Math.floor(offset / LIMIT) + 1),
          }}
          emptyStateProps={{
            svg: "solar:delivery-bold-duotone",
            title: "No trips yet",
            text: "Create a trip from the Items Queue by selecting items and clicking Create Trip.",
          }}
        />
      </div>
    </>
  );
};

export default Trips;
