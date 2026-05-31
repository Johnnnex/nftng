/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useLogisticsStore } from "@/store";
import { Table, StatusChip, Button } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { LogisticsQueueItem, TripRecord } from "@/data";

const LIMIT = 50;
const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";

// ─── Skeleton ──────────────────────────────────────────────────────────────────

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

// ─── Create Trip Drawer ────────────────────────────────────────────────────────

const CreateTripDrawer = ({
  selectedItems,
  onClose,
  onCreated,
}: {
  selectedItems: LogisticsQueueItem[];
  onClose: () => void;
  onCreated: (trip: TripRecord) => void;
}) => {
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
    } finally {
      setLoading(false);
    }
  }, [riderName, riderPhone, riderEmail, riderCompany, selectedItems, createTrip, onCreated]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
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
          {/* Selected items summary */}
          <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
            <p className={cn(satoshi.className, "text-[0.8125rem] font-semibold text-[#374151] px-4 py-2.5 border-b border-[#F3F4F6] bg-[#F9FAFB]")}>Selected Items</p>
            <div className="flex flex-col divide-y divide-[#F3F4F6] max-h-48 overflow-y-auto">
              {selectedItems.map((i) => (
                <div key={i.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
                    {i.productImage
                      ? <img src={i.productImage} alt="" className="w-full h-full object-cover" />
                      : <Icon icon="solar:image-bold-duotone" className="w-4 h-4 text-[#D1D5DB]" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className={cn(satoshi.className, "text-[0.8125rem] font-medium text-[#374151] truncate")}>{i.productTitle}</p>
                    <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{i.orderRef} · {i.userCityName ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rider form */}
          <div className="flex flex-col gap-4">
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827]")}>Rider Details</p>
            {[
              { label: "Rider Name *", value: riderName, set: setRiderName, placeholder: "e.g. Emeka" },
              { label: "Phone *", value: riderPhone, set: setRiderPhone, placeholder: "+2348001234567" },
              { label: "Email (optional)", value: riderEmail, set: setRiderEmail, placeholder: "rider@gigm.com" },
              { label: "Company (optional)", value: riderCompany, set: setRiderCompany, placeholder: "GIGM, FEZ…" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-2.5 text-[0.875rem] text-[#374151] focus:outline-none focus:border-[#6EC93E]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] shrink-0">
          <Button
            loading={loading}
            onClick={handle}
            className={cn(satoshi.className, "w-full py-3 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem]")}
          >
            <Icon icon="solar:delivery-bold" className="w-4 h-4 mr-2" />
            Create Trip
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────

const ItemsQueue = () => {
  const { admin } = useAuthStore();
  const { items, itemsLoading, meta, fetchItems } = useLogisticsStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "logistics", "write");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreateTrip, setShowCreateTrip] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => prev.size === items.length ? new Set() : new Set(items.map((i) => i.id)));
  }, [items]);

  const selectedItems = useMemo(() => items.filter((i) => selected.has(i.id)), [items, selected]);

  const columns = useMemo(() => [
    {
      title: "",
      width: 44,
      customTableBody: (r: LogisticsQueueItem) => (
        canWrite ? (
          <input
            type="checkbox"
            checked={selected.has(r.id)}
            onChange={() => toggleSelect(r.id)}
            className="w-4 h-4 accent-[#6EC93E]"
          />
        ) : null
      ),
    },
    {
      title: "Item",
      minWidth: 220,
      customTableBody: (r: LogisticsQueueItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
            {r.productImage
              ? <img src={r.productImage} alt="" className="w-full h-full object-cover" />
              : <Icon icon="solar:image-bold-duotone" className="w-4 h-4 text-[#D1D5DB]" />
            }
          </div>
          <div className="min-w-0">
            <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] truncate")}>{r.productTitle}</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{Object.entries(r.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No variants"}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Order",
      width: 130,
      customTableBody: (r: LogisticsQueueItem) => (
        <span className={cn(satoshi.className, "text-[0.875rem] font-mono text-[#374151]")}>{r.orderRef}</span>
      ),
    },
    {
      title: "Customer",
      minWidth: 140,
      customTableBody: (r: LogisticsQueueItem) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{r.userName}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.userPhone}</p>
        </div>
      ),
    },
    {
      title: "Destination",
      minWidth: 140,
      customTableBody: (r: LogisticsQueueItem) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.userCityName ?? "—"}</p>
          {r.userStateName && <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.userStateName}</p>}
        </div>
      ),
    },
    {
      title: "Packaged",
      width: 100,
      customTableBody: (r: LogisticsQueueItem) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{fmt(r.packagedAt)}</span>
      ),
    },
  ], [canWrite, selected, toggleSelect]);

  const data = useMemo(() => items.map((r) => [r, r, r, r, r, r]), [items]);


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Items Queue
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>({meta.items.total})</span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>
            Packaged items marked logistics-ready, waiting to be dispatched
          </p>
        </div>
        {canWrite && selected.size > 0 && (
          <Button
            onClick={() => setShowCreateTrip(true)}
            className={cn(satoshi.className, "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem]")}
          >
            <Icon icon="solar:delivery-bold" className="w-4 h-4" />
            Create Trip ({selected.size})
          </Button>
        )}
      </div>

      {canWrite && items.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={toggleAll}
            className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors")}
          >
            <input type="checkbox" checked={selected.size === items.length} readOnly className="w-3.5 h-3.5 accent-[#6EC93E]" />
            {selected.size === items.length ? "Deselect all" : "Select all"}
          </button>
          {selected.size > 0 && (
            <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{selected.size} selected</span>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={itemsLoading}
          pagination
          metaData={{
            currentPage: (meta.items.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.items.page * LIMIT, meta.items.total),
            totalRecords: meta.items.total,
            onPageChange: (offset) => { fetchItems(Math.floor(offset / LIMIT) + 1); setSelected(new Set()); },
          }}
          emptyStateProps={{
            svg: "solar:box-minimalistic-bold-duotone",
            title: "No items in queue",
            text: "Items marked logistics-ready by the products admin will appear here.",
          }}
        />
      </div>

      <AnimatePresence>
        {showCreateTrip && (
          <CreateTripDrawer
            selectedItems={selectedItems}
            onClose={() => setShowCreateTrip(false)}
            onCreated={() => { setShowCreateTrip(false); setSelected(new Set()); fetchItems(1); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ItemsQueue;
