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
import type { OutsideNigeriaOrder, OutsideNigeriaItem } from "@/data";

const LIMIT = 50;
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse">
    <div className="h-14 bg-[#F3F4F6] border-b border-[#E5E7EB]" />
    <div className="p-4 flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`h-14 rounded-xl ${i % 2 === 0 ? "bg-[#F3F4F6]" : "bg-[#F9FAFB]"}`} />
      ))}
    </div>
  </div>
);

// ─── Detail drawer ─────────────────────────────────────────────────────────────

const DetailDrawer = ({
  order,
  onClose,
  canWrite,
}: {
  order: OutsideNigeriaOrder;
  onClose: () => void;
  canWrite: boolean;
}) => {
  const { resolveInternational } = useLogisticsStore();
  const [resolving, setResolving] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const handleResolve = useCallback(async () => {
    setResolving(true);
    try {
      await resolveInternational(order.id);
      toast.success("Order marked as resolved");
    } catch { toast.error("Failed to resolve order"); }
    finally { setResolving(false); }
  }, [order.id, resolveInternational]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280]">
            <Icon icon="solar:close-square-bold" className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827]")}>International Order</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{order.userName} · {order.userCountryName ?? "Unknown country"}</p>
          </div>
          <span className={cn(satoshi.className, "px-2.5 py-1 rounded-full text-[0.8125rem] font-medium", order.status === "resolved" ? "bg-[#6EC93E]/10 text-[#3a7a1e]" : "bg-amber-50 text-amber-700")}>
            {order.status === "resolved" ? "Resolved" : "Pending"}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Name", value: order.userName },
              { label: "Country", value: order.userCountryName ?? "—" },
              { label: "Email", value: order.userEmail },
              { label: "Phone", value: order.userPhone },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F9FAFB] rounded-xl px-4 py-3">
                <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{label}</p>
                <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151] mt-0.5 break-all")}>{value}</p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-0.5")}>Address</p>
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{order.userAddress}</p>
          </div>

          {/* Preview URL */}
          <div className="rounded-xl border border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
            <Icon icon="solar:link-bold-duotone" className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-0.5")}>Customer preview URL</p>
              <p className={cn(satoshi.className, "text-[0.8125rem] text-[#374151] truncate")}>{appUrl}/preview-order/{order.previewToken}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(`${appUrl}/preview-order/${order.previewToken}`); toast.success("Copied"); }}
              className="shrink-0 text-[#9CA3AF] hover:text-[#374151] transition-colors"
            >
              <Icon icon="solar:copy-bold" className="w-4 h-4" />
            </button>
          </div>

          {/* Order items */}
          <div>
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827] mb-3")}>
              Items ({order.items.length})
            </p>
            <div className="flex flex-col gap-2">
              {order.items.map((item: OutsideNigeriaItem, i: number) => (
                <div key={i} className="rounded-xl border border-[#E5E7EB] p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.productImage
                      ? <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                      : <Icon icon="solar:image-bold-duotone" className="w-5 h-5 text-[#D1D5DB]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] truncate")}>{item.productTitle}</p>
                    <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>
                      {Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No variants"}
                    </p>
                    <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>Qty: {item.qty} · ₦{Number(item.unitPrice).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolve action */}
          {canWrite && order.status === "pending" && (
            <div className="rounded-xl border border-[#E5E7EB] p-4 flex items-start gap-3">
              <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-[#6EC93E] mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151]")}>Mark as Resolved</p>
                <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] mt-0.5")}>Confirm you have contacted this customer and settled delivery details.</p>
                <Button
                  loading={resolving}
                  onClick={handleResolve}
                  className={cn(satoshi.className, "mt-3 px-4 py-2 rounded-lg bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem]")}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
          {order.status === "resolved" && order.resolvedAt && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#6EC93E]/10 rounded-xl">
              <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#6EC93E]" />
              <span className={cn(satoshi.className, "text-[0.875rem] text-[#3a7a1e]")}>Resolved {fmt(order.resolvedAt)}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────

const International = () => {
  const { admin } = useAuthStore();
  const { international, internationalLoading, meta, fetchInternational, activeInternational, setActiveInternational, fetchInternationalDetail } = useLogisticsStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "logistics", "write");

  const handleView = useCallback(async (order: OutsideNigeriaOrder) => {
    await fetchInternationalDetail(order.id);
  }, [fetchInternationalDetail]);

  const columns = useMemo(() => [
    {
      title: "Customer",
      minWidth: 160,
      customTableBody: (r: OutsideNigeriaOrder) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{r.userName}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.userEmail}</p>
        </div>
      ),
    },
    {
      title: "Country",
      width: 130,
      customTableBody: (r: OutsideNigeriaOrder) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.userCountryName ?? "—"}</span>
      ),
    },
    {
      title: "Phone",
      width: 140,
      customTableBody: (r: OutsideNigeriaOrder) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#374151]")}>{r.userPhone}</span>
      ),
    },
    {
      title: "Items",
      width: 65,
      customTableBody: (r: OutsideNigeriaOrder) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.items.length}</span>
      ),
    },
    {
      title: "Status",
      width: 110,
      customTableBody: (r: OutsideNigeriaOrder) => (
        <span className={cn(satoshi.className, "px-2.5 py-1 rounded-full text-[0.8125rem] font-medium", r.status === "resolved" ? "bg-[#6EC93E]/10 text-[#3a7a1e]" : "bg-amber-50 text-amber-700")}>
          {r.status === "resolved" ? "Resolved" : "Pending"}
        </span>
      ),
    },
    {
      title: "Date",
      width: 110,
      customTableBody: (r: OutsideNigeriaOrder) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{fmt(r.createdAt)}</span>
      ),
    },
    {
      title: "",
      width: 60,
      customTableBody: (r: OutsideNigeriaOrder) => (
        <button
          onClick={() => handleView(r)}
          className={cn(satoshi.className, "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors")}
        >
          <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ], [handleView]);

  const data = useMemo(() => international.map((r) => [r, r, r, r, r, r, r]), [international]);


  return (
    <>
      <div className="mb-6">
        <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
          International Orders
          <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>({meta.international.total})</span>
        </h1>
        <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>Outside-Nigeria orders — handle delivery manually, mark resolved when contacted</p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={internationalLoading}
          pagination
          metaData={{
            currentPage: (meta.international.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.international.page * LIMIT, meta.international.total),
            totalRecords: meta.international.total,
            onPageChange: (offset) => fetchInternational(Math.floor(offset / LIMIT) + 1),
          }}
          emptyStateProps={{
            svg: "solar:global-bold-duotone",
            title: "No international orders",
            text: "Orders from outside Nigeria will appear here.",
          }}
        />
      </div>

      <AnimatePresence>
        {activeInternational && (
          <DetailDrawer
            order={activeInternational}
            onClose={() => setActiveInternational(null)}
            canWrite={canWrite}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default International;
