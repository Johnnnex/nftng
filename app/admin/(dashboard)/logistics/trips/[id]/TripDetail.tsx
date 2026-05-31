/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useLogisticsStore } from "@/store";
import { Button } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { TripDetail as TripDetailType, TripItem } from "@/data";
import { TRIP_STATUS_LABELS } from "@/data";

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="max-w-3xl animate-pulse flex flex-col gap-6">
    <div className="h-8 w-48 bg-[#F3F4F6] rounded-xl" />
    <div className="h-32 bg-[#F3F4F6] rounded-2xl" />
    <div className="h-64 bg-[#F3F4F6] rounded-2xl" />
  </div>
);

// ─── Edit Rider Drawer ─────────────────────────────────────────────────────────

const EditRiderDrawer = ({
  trip,
  onClose,
}: {
  trip: TripDetailType;
  onClose: () => void;
}) => {
  const { patchTrip } = useLogisticsStore();
  const [name, setName] = useState(trip.riderName);
  const [phone, setPhone] = useState(trip.riderPhone);
  const [email, setEmail] = useState(trip.riderEmail ?? "");
  const [company, setCompany] = useState(trip.riderCompany ?? "");
  const [loading, setLoading] = useState(false);

  const handle = useCallback(async () => {
    if (!name.trim() || !phone.trim()) { toast.error("Name and phone are required"); return; }
    setLoading(true);
    try {
      await patchTrip(trip.id, { riderName: name, riderPhone: phone, riderEmail: email || undefined, riderCompany: company || undefined });
      toast.success("Rider info updated");
      onClose();
    } catch { toast.error("Failed to update"); }
    finally { setLoading(false); }
  }, [name, phone, email, company, trip.id, patchTrip, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>Edit Rider</p>
          <button onClick={onClose}><Icon icon="solar:close-square-bold" className="w-5 h-5 text-[#9CA3AF]" /></button>
        </div>
        {[
          { label: "Name *", value: name, set: setName },
          { label: "Phone *", value: phone, set: setPhone },
          { label: "Email", value: email, set: setEmail },
          { label: "Company", value: company, set: setCompany },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>{label}</label>
            <input type="text" value={value} onChange={(e) => set(e.target.value)}
              className="w-full rounded-xl border border-[#D0D5DD] px-4 py-2.5 text-[0.875rem] text-[#374151] focus:outline-none focus:border-[#6EC93E]" />
          </div>
        ))}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className={cn(satoshi.className, "flex-1 py-2 rounded-xl text-[0.875rem]")}>Cancel</Button>
          <Button loading={loading} onClick={handle} className={cn(satoshi.className, "flex-1 py-2 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem]")}>Save</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function TripDetail({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { admin, hydrated } = useAuthStore();
  const { activeTrip, activeTripLoading, fetchTripDetail, dispatchTrip, setActiveTrip } = useLogisticsStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "logistics", "write");

  const [editRider, setEditRider] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if (!activeTrip || activeTrip.id !== tripId) {
      fetchTripDetail(tripId);
    }
    return () => { setActiveTrip(null); };
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDispatch = useCallback(async () => {
    setDispatching(true);
    try {
      await dispatchTrip(tripId);
      toast.success("Trip dispatched — items are now en route, emails sent");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Dispatch failed");
    } finally {
      setDispatching(false);
    }
  }, [tripId, dispatchTrip]);

  if (!hydrated || activeTripLoading || !activeTrip) return <Skeleton />;

  const trip = activeTrip;

  // Group items by order
  const byOrder = new Map<string, { orderId: string; orderRef: string; userName: string; userEmail: string; userAddress: string; items: TripItem[] }>();
  for (const item of trip.items) {
    if (!byOrder.has(item.orderId)) {
      byOrder.set(item.orderId, { orderId: item.orderId, orderRef: item.orderRef, userName: item.userName, userEmail: item.userEmail, userAddress: item.userAddress, items: [] });
    }
    byOrder.get(item.orderId)!.items.push(item);
  }

  const statusConfig = {
    draft: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
    dispatched: { bg: "bg-blue-50", text: "text-blue-700" },
    completed: { bg: "bg-[#6EC93E]/10", text: "text-[#3a7a1e]" },
  }[trip.status] ?? { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" };

  return (
    <div className="max-w-3xl flex flex-col gap-6 pb-16">
      {/* Back */}
      <button onClick={() => router.back()} className={cn(satoshi.className, "self-start flex items-center gap-1.5 text-[0.875rem] text-[#9CA3AF] hover:text-[#374151] transition-colors")}>
        <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4" />
        Back to Trips
      </button>

      {/* Header card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#F3F4F6]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className={cn(poppins.className, "text-[1.75rem] font-bold tracking-[0.15em] text-[#111827] font-mono")}>{trip.code}</p>
              <span className={cn(satoshi.className, "px-3 py-1 rounded-full text-[0.8125rem] font-semibold", statusConfig.bg, statusConfig.text)}>
                {TRIP_STATUS_LABELS[trip.status]}
              </span>
            </div>
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>{trip.itemCount} item{trip.itemCount !== 1 ? "s" : ""} · Created {fmt(trip.createdAt)}</p>
            {trip.dispatchedAt && (
              <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>Dispatched {fmt(trip.dispatchedAt)}</p>
            )}
          </div>
          {canWrite && trip.status === "draft" && (
            <Button
              loading={dispatching}
              onClick={handleDispatch}
              className={cn(satoshi.className, "px-5 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-semibold text-[0.9375rem]")}
            >
              <Icon icon="solar:delivery-bold" className="w-4 h-4 mr-2" />
              Dispatch Trip
            </Button>
          )}
        </div>

        {/* Rider info */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827]")}>Rider</p>
            {canWrite && trip.status === "draft" && (
              <button onClick={() => setEditRider(true)} className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors")}>
                <Icon icon="solar:pen-bold" className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Name", value: trip.riderName },
              { label: "Phone", value: trip.riderPhone },
              { label: "Email", value: trip.riderEmail ?? "—" },
              { label: "Company", value: trip.riderCompany ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F9FAFB] rounded-xl px-4 py-3">
                <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{label}</p>
                <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151] mt-0.5")}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispatch info */}
      {trip.status === "draft" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
          <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-amber-900")}>Ready to dispatch?</p>
            <p className={cn(satoshi.className, "text-[0.8125rem] text-amber-700 mt-0.5")}>
              Dispatching will mark all {trip.itemCount} items as En Route, send customers their confirmation URLs,
              {trip.riderEmail ? " and email the rider their trip code and manifest." : " (no rider email — add one above if needed)."}
            </p>
          </div>
        </div>
      )}

      {/* Items grouped by order */}
      <div>
        <p className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827] mb-4")}>
          Items by Order ({[...byOrder.values()].length} customer{[...byOrder.values()].length !== 1 ? "s" : ""})
        </p>
        <div className="flex flex-col gap-4">
          {[...byOrder.values()].map((orderGroup) => (
            <div key={orderGroup.orderId} className="rounded-2xl border border-[#E5E7EB] overflow-hidden">
              {/* Order header */}
              <div className="px-5 py-3.5 bg-[#F9FAFB] border-b border-[#F3F4F6] flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className={cn(satoshi.className, "text-[0.875rem] font-bold font-mono text-[#111827]")}>{orderGroup.orderRef}</span>
                <span className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{orderGroup.userName}</span>
                <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{orderGroup.userEmail}</span>
              </div>
              {/* Address */}
              <div className="px-5 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
                <Icon icon="solar:map-point-bold-duotone" className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>
                  {orderGroup.userAddress}
                  {orderGroup.items[0]?.userCityName && ` · ${orderGroup.items[0].userCityName}`}
                  {orderGroup.items[0]?.userStateName && `, ${orderGroup.items[0].userStateName}`}
                </p>
              </div>
              {/* Items */}
              <div className="divide-y divide-[#F3F4F6]">
                {orderGroup.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.productImage
                        ? <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                        : <Icon icon="solar:image-bold-duotone" className="w-5 h-5 text-[#D1D5DB]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] truncate")}>{item.productTitle}</p>
                      <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>
                        {Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No variants"} · Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editRider && <EditRiderDrawer trip={trip} onClose={() => setEditRider(false)} />}
    </div>
  );
}
