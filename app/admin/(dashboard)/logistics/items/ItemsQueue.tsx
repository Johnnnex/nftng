/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { api } from "@/lib/api";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useLogisticsStore } from "@/store";
import { Table, Button, Input } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { LogisticsQueueItem, TripRecord, GeoState } from "@/data";

const LIMIT = 50;
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const CreateTripDrawer = ({ selectedItems, onClose, onCreated }: { selectedItems: LogisticsQueueItem[]; onClose: () => void; onCreated: (trip: TripRecord) => void }) => {
  const { createTrip } = useLogisticsStore();
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  const [riderCompany, setRiderCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = useCallback(async () => {
    if (!riderName.trim() || !riderPhone.trim()) { toast.error("Rider name and phone are required"); return; }
    setLoading(true);
    try {
      const trip = await createTrip({ riderName, riderPhone, riderEmail: riderEmail || undefined, riderCompany: riderCompany || undefined, itemIds: selectedItems.map((i) => i.id) });
      toast.success(`Trip ${trip.code} created`);
      onCreated(trip);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to create trip");
    } finally { setLoading(false); }
  }, [riderName, riderPhone, riderEmail, riderCompany, selectedItems, createTrip, onCreated]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280]">
            <Icon icon="solar:close-square-bold" className="w-5 h-5" />
          </button>
          <div>
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827]")}>Create Trip</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
            <p className={cn(satoshi.className, "text-[0.8125rem] font-semibold text-[#374151] px-4 py-2.5 border-b border-[#F3F4F6] bg-[#F9FAFB]")}>Selected Items</p>
            <div className="flex flex-col divide-y divide-[#F3F4F6] max-h-48 overflow-y-auto">
              {selectedItems.map((i) => (
                <div key={i.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
                    {i.productImage ? <img src={i.productImage} alt="" className="w-full h-full object-cover" /> : <Icon icon="solar:image-bold-duotone" className="w-4 h-4 text-[#D1D5DB]" />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(satoshi.className, "text-[0.8125rem] font-medium text-[#374151] truncate")}>{i.productTitle}</p>
                    <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{i.orderRef} · {i.userCityName ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827]")}>Rider Details</p>
            <Input label="Rider Name *" type="text" value={riderName} onChange={(e) => setRiderName((e.target as HTMLInputElement).value)} placeholder="e.g. Emeka Okafor" className="border-[#D0D5DD]" />
            <Input label="Phone *" type="tel" name="riderPhone" value={riderPhone} onChange={(e: { target: { name?: string; value: string } }) => setRiderPhone(e.target.value)} defaultCountry="ng" className="border-[#D0D5DD]" />
            <Input label="Email (optional)" type="email" value={riderEmail} onChange={(e) => setRiderEmail((e.target as HTMLInputElement).value)} placeholder="rider@gigm.com" className="border-[#D0D5DD]" />
            <Input label="Company (optional)" type="text" value={riderCompany} onChange={(e) => setRiderCompany((e.target as HTMLInputElement).value)} placeholder="GIGM, FEZ…" className="border-[#D0D5DD]" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E5E7EB] shrink-0">
          <Button loading={loading} onClick={handle} className={cn(satoshi.className, "w-full py-3 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem]")}>
            <Icon icon="solar:delivery-bold" className="w-4 h-4 mr-2" />Create Trip
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

type QueueTab = "available" | "on_trip";

type TabFilterState = {
  stateId: string;
  cityId: string;
  search: string;
  cities: { id: string; name: string }[];
  citiesLoading: boolean;
};

const EMPTY_TAB_FILTER: TabFilterState = { stateId: "", cityId: "", search: "", cities: [], citiesLoading: false };

const ItemsQueue = () => {
  const { admin } = useAuthStore();
  const { items, onTripItems, itemsLoading, meta, fetchItems } = useLogisticsStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "logistics", "write");

  const [activeTab, setActiveTab] = useState<QueueTab>("available");
  const [selectedItems, setSelectedItems] = useState<LogisticsQueueItem[]>([]);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [states, setStates] = useState<GeoState[]>([]);

  // Per-tab filter state — each tab remembers its own state/city/search independently
  const [tabFilters, setTabFilters] = useState<Record<QueueTab, TabFilterState>>({
    available: { ...EMPTY_TAB_FILTER },
    on_trip: { ...EMPTY_TAB_FILTER },
  });

  const tabRef = useRef<QueueTab>("available");
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helpers to read/update current tab's filters
  const curFilter = tabFilters[activeTab];
  const updateFilter = useCallback((tab: QueueTab, patch: Partial<TabFilterState>) => {
    setTabFilters((prev) => ({ ...prev, [tab]: { ...prev[tab], ...patch } }));
  }, []);

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
    const tab = tabRef.current;
    const search = String(value);
    updateFilter(tab, { search });
    fetchItems(1, tabFilters[tab].cityId || undefined, tabFilters[tab].stateId || undefined, search || undefined, tab);
  }, [fetchItems, tabFilters, updateFilter]);

  const handleTabChange = useCallback((tab: QueueTab) => {
    tabRef.current = tab;
    setActiveTab(tab);
    setSelectedItems([]);
    // Restore tab's filter state — no refetch, data pre-loaded server-side
  }, []);

  const handleStateChange = useCallback((stateId: string) => {
    const tab = tabRef.current;
    updateFilter(tab, { stateId, cityId: "", cities: [], citiesLoading: !!stateId });
    if (stateId) {
      api.get<{ data: { id: string; name: string }[] }>(`/api/delivery/cities/${stateId}`)
        .then((r) => updateFilter(tab, { cities: r.data.data ?? [], citiesLoading: false }))
        .catch(() => updateFilter(tab, { citiesLoading: false }));
    }
    // Debounce the table fetch so rapid select changes don't spam API
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(() => {
      fetchItems(1, undefined, stateId || undefined, tabFilters[tab].search || undefined, tab);
    }, 300);
  }, [fetchItems, tabFilters, updateFilter]);

  const handleCityChange = useCallback((cityId: string) => {
    const tab = tabRef.current;
    updateFilter(tab, { cityId });
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(() => {
      fetchItems(1, cityId || undefined, tabFilters[tab].stateId || undefined, tabFilters[tab].search || undefined, tab);
    }, 300);
  }, [fetchItems, tabFilters, updateFilter]);

  const stateOptions = useMemo(() => [
    { value: "", label: "All States" },
    ...states.map((s) => ({ value: s.id, label: s.name })),
  ], [states]);

  const cityOptions = useMemo(() => [
    { value: "", label: "All LGAs / Zones" },
    ...curFilter.cities.map((c) => ({ value: c.id, label: c.name })),
  ], [curFilter.cities]);

  const columns = useMemo(() => [
    {
      title: "Item", minWidth: 220,
      customTableBody: (r: LogisticsQueueItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
            {r.productImage ? <img src={r.productImage} alt="" className="w-full h-full object-cover" /> : <Icon icon="solar:image-bold-duotone" className="w-4 h-4 text-[#D1D5DB]" />}
          </div>
          <div className="min-w-0">
            <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] truncate")}>{r.productTitle}</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{Object.entries(r.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No variants"}</p>
          </div>
        </div>
      ),
    },
    { title: "Order", width: 130, customTableBody: (r: LogisticsQueueItem) => <span className={cn(satoshi.className, "text-[0.875rem] font-mono text-[#374151]")}>{r.orderRef}</span> },
    {
      title: "Customer", minWidth: 140,
      customTableBody: (r: LogisticsQueueItem) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{r.userName}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.userPhone}</p>
        </div>
      ),
    },
    {
      title: "Destination", minWidth: 140,
      customTableBody: (r: LogisticsQueueItem) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.userCityName ?? "—"}</p>
          {r.userStateName && <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.userStateName}</p>}
        </div>
      ),
    },
    {
      title: "Packaged", width: 120,
      customTableBody: (r: LogisticsQueueItem) => <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] whitespace-nowrap")}>{fmtDate(r.packagedAt)}</span>,
    },
  ], []);

  const activeItems = activeTab === "on_trip" ? onTripItems : items;
  const activeMeta = activeTab === "on_trip" ? meta.onTripItems : meta.items;
  const activeLoading = itemsLoading[activeTab];
  const data = useMemo(() => activeItems.map((r) => [r, r, r, r, r]), [activeItems]);

  const handleCheckChange = useCallback((rows: any[][]) => {
    setSelectedItems(rows.map((row) => row[0] as LogisticsQueueItem));
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Items Queue
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>({activeMeta.total})</span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>Packaged items marked logistics-ready</p>
        </div>
        <div className="flex items-center gap-3">
          {states.length > 0 && (
            <div className="w-40">
              <Input type="select" name="stateFilter" value={curFilter.stateId} selectOptions={stateOptions} placeholder="All States" onChange={(e: { target: { name?: string; value: string | string[] } }) => handleStateChange(e.target.value as string)} className="border-[#D0D5DD]" />
            </div>
          )}
          {states.length > 0 && (
            <div className={cn("w-44", (!curFilter.stateId || curFilter.citiesLoading) && "opacity-50 pointer-events-none")}>
              <Input type="select" name="cityFilter" value={curFilter.cityId}
                selectOptions={curFilter.citiesLoading ? [{ value: "", label: "Loading…" }] : cityOptions}
                placeholder="All LGAs / Zones"
                onChange={(e: { target: { name?: string; value: string | string[] } }) => handleCityChange(e.target.value as string)} className="border-[#D0D5DD]" />
            </div>
          )}
          {canWrite && selectedItems.length > 0 && activeTab === "available" && (
            <Button onClick={() => setShowCreateTrip(true)} className={cn(satoshi.className, "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem]")}>
              <Icon icon="solar:delivery-bold" className="w-4 h-4" />Create Trip ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {(["available", "on_trip"] as QueueTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={cn(
              satoshi.className,
              "relative px-4 py-1.5 rounded-lg text-[0.875rem] font-medium transition-colors z-10",
              activeTab === tab ? "text-[#111827]" : "text-[#6B7280] hover:text-[#374151]",
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="queue-tab-pill"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">
              {tab === "available" ? "Available" : "On Trip"}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          key={activeTab}
          columns={columns as any}
          data={data as any}
          loading={activeLoading}
          pagination
          head
          search={{ show: true, placeholder: "Search item, order or customer…", onResolve: handleSearch }}
          isCheckable={canWrite}
          onCheckChange={handleCheckChange}
          metaData={{
            currentPage: (activeMeta.page - 1) * LIMIT + 1,
            endPage: Math.min(activeMeta.page * LIMIT, activeMeta.total),
            totalRecords: activeMeta.total,
            onPageChange: (offset) => {
              const tab = tabRef.current;
              fetchItems(Math.floor(offset / LIMIT) + 1, tabFilters[tab].cityId || undefined, tabFilters[tab].stateId || undefined, tabFilters[tab].search || undefined, tab);
              setSelectedItems([]);
            },
          }}
          emptyStateProps={{ svg: "solar:box-minimalistic-bold-duotone", title: "No items in queue", text: "Items marked logistics-ready by the products admin will appear here." }}
        />
      </div>

      <AnimatePresence>
        {showCreateTrip && (
          <CreateTripDrawer
            selectedItems={selectedItems}
            onClose={() => setShowCreateTrip(false)}
            onCreated={() => { setShowCreateTrip(false); setSelectedItems([]); fetchItems(1); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ItemsQueue;
