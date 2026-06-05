/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { api } from "@/lib/api";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useLogisticsStore } from "@/store";
import { Table, Input } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { TripRecord, TripStatus, GeoState } from "@/data";
import { TRIP_STATUS_LABELS } from "@/data";

const LIMIT = 50;

const TripStatusChip = ({ status }: { status: TripStatus }) => {
  const config = {
    draft: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#9CA3AF]" },
    dispatched: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    completed: { bg: "bg-[#6EC93E]/10", text: "text-[#3a7a1e]", dot: "bg-[#6EC93E]" },
  }[status] ?? { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#9CA3AF]" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-medium whitespace-nowrap", config.bg, config.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {TRIP_STATUS_LABELS[status]}
    </span>
  );
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Trips = () => {
  const router = useRouter();
  const { admin } = useAuthStore();
  const { trips, tripsLoading, meta, fetchTrips } = useLogisticsStore();
  hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "logistics", "read");

  const [states, setStates] = useState<GeoState[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const searchRef = useRef("");
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get<{ data: { id: string; name: string; code: string }[] }>("/api/delivery/countries")
      .then((r) => {
        const ng = r.data.data.find((c) => c.code === "NG");
        if (!ng) return null;
        return api.get<{ data: GeoState[] }>(`/api/delivery/states/${ng.id}`);
      })
      .then((r) => { if (r) setStates(r.data.data); })
      .catch(() => null);
  }, []);

  const handleSearch = useCallback((value: string | number) => {
    searchRef.current = String(value);
    fetchTrips(1, String(value) || undefined, selectedStateId || undefined, selectedCityId || undefined);
  }, [fetchTrips, selectedStateId, selectedCityId]);

  const handleStateChange = useCallback((stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedCityId("");
    setCities([]);
    if (stateId) {
      setCitiesLoading(true);
      api.get<{ data: { id: string; name: string }[] }>(`/api/delivery/cities/${stateId}`)
        .then((r) => setCities(r.data.data ?? []))
        .catch(() => null)
        .finally(() => setCitiesLoading(false));
    }
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(() => {
      fetchTrips(1, searchRef.current || undefined, stateId || undefined, undefined);
    }, 300);
  }, [fetchTrips]);

  const handleCityChange = useCallback((cityId: string) => {
    setSelectedCityId(cityId);
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(() => {
      fetchTrips(1, searchRef.current || undefined, selectedStateId || undefined, cityId || undefined);
    }, 300);
  }, [fetchTrips, selectedStateId]);

  const stateOptions = useMemo(() => [
    { value: "", label: "All States" },
    ...states.map((s) => ({ value: s.id, label: s.name })),
  ], [states]);

  const cityOptions = useMemo(() => [
    { value: "", label: "All LGAs / Zones" },
    ...cities.map((c) => ({ value: c.id, label: c.name })),
  ], [cities]);

  const handleView = useCallback((id: string) => {
    router.push(`/admin/logistics/trips/${id}`);
  }, [router]);

  const columns = useMemo(() => [
    {
      title: "Code", width: 120,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] font-bold font-mono tracking-widest text-[#111827] whitespace-nowrap")}>{r.code}</span>
      ),
    },
    {
      title: "Rider", minWidth: 160,
      customTableBody: (r: TripRecord) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{r.riderName}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.riderPhone}</p>
        </div>
      ),
    },
    {
      title: "Company", width: 120,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>{r.riderCompany ?? "—"}</span>
      ),
    },
    {
      title: "Items", width: 70,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.itemCount}</span>
      ),
    },
    {
      title: "Status", width: 130,
      customTableBody: (r: TripRecord) => <TripStatusChip status={r.status} />,
    },
    {
      title: "Dispatched", width: 120,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] whitespace-nowrap")}>{fmt(r.dispatchedAt)}</span>
      ),
    },
    {
      title: "Created", width: 120,
      customTableBody: (r: TripRecord) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] whitespace-nowrap")}>{fmt(r.createdAt)}</span>
      ),
    },
    {
      title: "", width: 60,
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
        <div className="flex items-center gap-2">
          {states.length > 0 && (
            <div className="w-40">
              <Input type="select" name="stateFilter" value={selectedStateId} selectOptions={stateOptions} placeholder="All States"
                onChange={(e: { target: { name?: string; value: string | string[] } }) => handleStateChange(e.target.value as string)} className="border-[#D0D5DD]" />
            </div>
          )}
          {states.length > 0 && (
            <div className={cn("w-44", (!selectedStateId || citiesLoading) && "opacity-50 pointer-events-none")}>
              <Input type="select" name="cityFilter" value={selectedCityId}
                selectOptions={citiesLoading ? [{ value: "", label: "Loading…" }] : cityOptions}
                placeholder="All LGAs / Zones"
                onChange={(e: { target: { name?: string; value: string | string[] } }) => handleCityChange(e.target.value as string)} className="border-[#D0D5DD]" />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={tripsLoading}
          pagination
          head
          search={{ show: true, placeholder: "Search by code, rider or company…", onResolve: handleSearch }}
          metaData={{
            currentPage: (meta.trips.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.trips.page * LIMIT, meta.trips.total),
            totalRecords: meta.trips.total,
            onPageChange: (offset) => fetchTrips(Math.floor(offset / LIMIT) + 1, searchRef.current || undefined, selectedStateId || undefined, selectedCityId || undefined),
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
