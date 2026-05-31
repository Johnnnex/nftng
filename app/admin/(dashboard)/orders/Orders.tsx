/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { debounce } from "@/lib/utils";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useOrderStore } from "@/store";
import { Table, StatusChip, Button } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { OrderRecord, OrderDetail, OrderItem, ItemStatus } from "@/data";
import { ITEM_STATUS_LABELS, ITEM_NEXT_STATUS, ORDER_STATUS_LABELS } from "@/data";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const OrdersSkeleton = () => (
  <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse">
    <div className="h-14 bg-[#F3F4F6] border-b border-[#E5E7EB]" />
    <div className="p-4 flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`h-16 rounded-xl ${i % 2 === 0 ? "bg-[#F3F4F6]" : "bg-[#F9FAFB]"}`} />
      ))}
    </div>
  </div>
);

// ─── Item status timeline ──────────────────────────────────────────────────────

const ITEM_STATUSES: ItemStatus[] = ["pending", "packaged", "enroute", "delivered"];

const ItemTimeline = ({ item }: { item: OrderItem }) => {
  const idx = ITEM_STATUSES.indexOf(item.status as ItemStatus);
  if (item.status === "returned") {
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className={cn(satoshi.className, "text-[0.75rem] text-red-400 font-medium")}>Returned</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0 mt-1">
      {ITEM_STATUSES.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} className="flex items-center">
            <div
              className={cn("w-2 h-2 rounded-full transition-colors", done ? "bg-[#6EC93E]" : "bg-[#E5E7EB]")}
              title={ITEM_STATUS_LABELS[s]}
            />
            {i < ITEM_STATUSES.length - 1 && (
              <div className={cn("w-4 h-px", done && i < idx ? "bg-[#6EC93E]" : "bg-[#E5E7EB]")} />
            )}
          </div>
        );
      })}
      <span className={cn(satoshi.className, "ml-2 text-[0.75rem] text-[#9CA3AF]")}>{ITEM_STATUS_LABELS[item.status as ItemStatus] ?? item.status}</span>
    </div>
  );
};

// ─── Variant chips ────────────────────────────────────────────────────────────

const ComboChips = ({ combo }: { combo: Record<string, string> }) => {
  const entries = Object.entries(combo);
  if (entries.length === 0) return <span className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>No variants</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([k, v]) => (
        <span key={k} className={cn(satoshi.className, "px-2 py-0.5 bg-[#F3F4F6] rounded-full text-[0.75rem] text-[#374151]")}>
          {k}: {v}
        </span>
      ))}
    </div>
  );
};

// ─── Refund modal ─────────────────────────────────────────────────────────────

type RefundModalProps = {
  label: string;
  onConfirm: (amount: number, notes: string) => Promise<void>;
  onClose: () => void;
};

const RefundModal = ({ label, onConfirm, onClose }: RefundModalProps) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = useCallback(async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { toast.error("Enter a valid amount"); return; }
    setLoading(true);
    try {
      await onConfirm(parsed, notes);
      toast.success("Refund recorded");
      onClose();
    } catch {
      toast.error("Failed to record refund");
    } finally {
      setLoading(false);
    }
  }, [amount, notes, onConfirm, onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 8 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <p className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>{label}</p>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151]">
            <Icon icon="solar:close-square-bold" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className={cn(satoshi.className, "text-[0.8125rem] font-medium text-[#374151] mb-1.5 block")}>Amount refunded (₦)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className={cn(satoshi.className, "w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[0.875rem] text-[#374151] focus:outline-none focus:border-[#6EC93E]")}
            />
          </div>
          <div>
            <label className={cn(satoshi.className, "text-[0.8125rem] font-medium text-[#374151] mb-1.5 block")}>Notes <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for refund…"
              className={cn(satoshi.className, "w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[0.875rem] text-[#374151] focus:outline-none focus:border-[#6EC93E] resize-none")}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} className={cn(satoshi.className, "flex-1 py-2 rounded-xl text-[0.875rem]")}>Cancel</Button>
          <Button loading={loading} onClick={handle} className={cn(satoshi.className, "flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[0.875rem] font-semibold")}>
            Record Refund
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Order drawer ─────────────────────────────────────────────────────────────

const OrderDrawer = ({
  order,
  onClose,
  canWrite,
}: {
  order: OrderDetail;
  onClose: () => void;
  canWrite: boolean;
}) => {
  const { markPackaged, markLogisticsReady, markAllLogisticsReady, refundItem, refundOrder } = useOrderStore();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [refundItemTarget, setRefundItemTarget] = useState<OrderItem | null>(null);
  const [refundOrderOpen, setRefundOrderOpen] = useState(false);

  const handleMarkPackaged = useCallback(async (item: OrderItem) => {
    setBusyId(item.id);
    try {
      await markPackaged(order.id, item.id);
      toast.success("Item marked as Packaged");
    } catch { toast.error("Failed to update"); }
    finally { setBusyId(null); }
  }, [markPackaged, order.id]);

  const handleMarkLogisticsReady = useCallback(async (item: OrderItem) => {
    setBusyId(item.id + "_lr");
    try {
      await markLogisticsReady(order.id, item.id);
      toast.success("Item marked logistics-ready");
    } catch { toast.error("Failed to update"); }
    finally { setBusyId(null); }
  }, [markLogisticsReady, order.id]);

  const handleMarkAllLogisticsReady = useCallback(async () => {
    setMarkingAll(true);
    try {
      await markAllLogisticsReady(order.id);
      toast.success("All eligible items marked logistics-ready");
    } catch { toast.error("Failed"); }
    finally { setMarkingAll(false); }
  }, [markAllLogisticsReady, order.id]);

  const hasEligibleForMarkAll = order.items.some(
    (i) => (i.status === "pending" || (i.status === "packaged" && !i.logisticsReady)) && i.status !== "returned",
  );
  const isFullyRefunded = order.status === "refunded";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280]">
            <Icon icon="solar:close-square-bold" className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827] font-mono")}>{order.orderRef}</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{order.userName} · {order.userEmail}</p>
          </div>
          <StatusChip status={order.status as any} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total", value: order.totalAmount != null ? `₦${Number(order.totalAmount).toLocaleString()}` : "—" },
              { label: "Delivery fee", value: order.deliveryFee != null ? `₦${Number(order.deliveryFee).toLocaleString()}` : "—" },
              { label: "Status", value: ORDER_STATUS_LABELS[order.status] },
              { label: "Delivery method", value: order.deliveryMethod ?? "—" },
              { label: "Phone", value: order.userPhone },
              { label: "Items", value: String(order.itemCount) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F9FAFB] rounded-xl px-4 py-3">
                <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{label}</p>
                <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151] mt-0.5")}>{value}</p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-0.5")}>Delivery address</p>
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{order.userAddress}</p>
            {order.userCityName && (
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-0.5")}>
                {order.userCityName}{order.userStateName ? `, ${order.userStateName}` : ""}
              </p>
            )}
          </div>

          {/* Mark all logistics-ready */}
          {canWrite && hasEligibleForMarkAll && !isFullyRefunded && (
            <div className="rounded-xl border border-[#6EC93E]/30 bg-[#6EC93E]/5 p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <Icon icon="solar:box-minimalistic-bold-duotone" className="w-5 h-5 text-[#6EC93E] shrink-0 mt-0.5" />
                <div>
                  <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151]")}>Mark all logistics-ready</p>
                  <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>Advances pending items to packaged + flags all for logistics pickup</p>
                </div>
              </div>
              <Button
                loading={markingAll}
                onClick={handleMarkAllLogisticsReady}
                className={cn(satoshi.className, "shrink-0 px-4 py-2 rounded-lg bg-[#6EC93E] hover:bg-[#5cb535] text-white text-[0.8125rem] font-semibold")}
              >
                Mark all
              </Button>
            </div>
          )}

          {/* Refund entire order */}
          {canWrite && !isFullyRefunded && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <Icon icon="solar:wallet-money-bold-duotone" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-red-700")}>Refund entire order</p>
                  <p className={cn(satoshi.className, "text-[0.8125rem] text-red-400")}>Marks all items returned and order as refunded</p>
                </div>
              </div>
              <button
                onClick={() => setRefundOrderOpen(true)}
                className={cn(satoshi.className, "shrink-0 px-3 py-1.5 rounded-lg text-[0.8125rem] font-semibold text-red-600 border border-red-300 hover:bg-red-100 transition-colors")}
              >
                Refund
              </button>
            </div>
          )}

          {/* Items */}
          <div>
            <p className={cn(poppins.className, "text-[0.875rem] font-semibold text-[#111827] mb-3")}>Order Items</p>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => {
                const canPackage = canWrite && item.status === "pending";
                const canMarkLR = canWrite && item.status === "packaged" && !item.logisticsReady;
                const isLRDone = item.logisticsReady && item.status === "packaged";
                const canRefund = canWrite && item.status !== "returned" && item.status !== "delivered";

                return (
                  <div key={item.id} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <div className="flex items-start gap-3 p-4">
                      {/* Product image */}
                      <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.productImage
                          ? <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                          : <Icon icon="solar:image-bold-duotone" className="w-6 h-6 text-[#D1D5DB]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] truncate")}>{item.productTitle}</p>
                        <div className="mt-0.5"><ComboChips combo={item.variantCombo} /></div>
                        <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-0.5")}>
                          Qty: {item.quantity} · ₦{Number(item.unitPrice).toLocaleString()}
                          {item.refundAmount != null && <span className="text-red-400"> · Refunded ₦{Number(item.refundAmount).toLocaleString()}</span>}
                        </p>
                        <ItemTimeline item={item} />
                      </div>
                    </div>

                    {/* Item actions */}
                    {(canPackage || canMarkLR || isLRDone || canRefund) && (
                      <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {canPackage && (
                          <button
                            onClick={() => handleMarkPackaged(item)}
                            disabled={busyId === item.id}
                            className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium bg-[#111827] text-white hover:bg-[#1f2937] transition-colors disabled:opacity-50")}
                          >
                            {busyId === item.id
                              ? <Icon icon="svg-spinners:3-dots-fade" className="w-4 h-4" />
                              : <Icon icon="solar:box-bold" className="w-3.5 h-3.5" />
                            }
                            Mark Packaged
                          </button>
                        )}
                        {canMarkLR && (
                          <button
                            onClick={() => handleMarkLogisticsReady(item)}
                            disabled={busyId === item.id + "_lr"}
                            className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium bg-[#6EC93E] text-white hover:bg-[#5cb535] transition-colors disabled:opacity-50")}
                          >
                            {busyId === item.id + "_lr"
                              ? <Icon icon="svg-spinners:3-dots-fade" className="w-4 h-4" />
                              : <Icon icon="solar:delivery-bold" className="w-3.5 h-3.5" />
                            }
                            Mark Logistics-ready
                          </button>
                        )}
                        {isLRDone && (
                          <span className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium bg-[#6EC93E]/10 text-[#3a7a1e]")}>
                            <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                            Logistics-ready
                          </span>
                        )}
                        {item.status === "enroute" && (
                          <span className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] bg-blue-50 text-blue-600")}>
                            <Icon icon="solar:delivery-bold-duotone" className="w-3.5 h-3.5" />
                            En Route
                          </span>
                        )}
                        {canRefund && (
                          <button
                            onClick={() => setRefundItemTarget(item)}
                            className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors")}
                          >
                            <Icon icon="solar:wallet-money-bold" className="w-3.5 h-3.5" />
                            Return & Refund
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Refund item modal */}
      <AnimatePresence>
        {refundItemTarget && (
          <RefundModal
            label={`Refund: ${refundItemTarget.productTitle}`}
            onConfirm={(amount, notes) => refundItem(order.id, refundItemTarget.id, amount, notes)}
            onClose={() => setRefundItemTarget(null)}
          />
        )}
        {refundOrderOpen && (
          <RefundModal
            label="Refund entire order"
            onConfirm={(amount, notes) => refundOrder(order.id, amount, notes)}
            onClose={() => setRefundOrderOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const LIMIT = 50;
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const Orders = () => {
  const { admin, hydrated } = useAuthStore();
  const { orders, meta, loading, fetchOrders, fetchOrderDetail, activeOrder, activeOrderLoading, setActiveOrder } = useOrderStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "products", "write");

  const [search, setSearch] = useState("");
  const debouncedFetch = useRef(debounce((q: string) => fetchOrders(1, q || undefined), 400)).current;
  useEffect(() => { debouncedFetch(search); }, [search, debouncedFetch]);

  const handleRowClick = useCallback(async (order: OrderRecord) => {
    await fetchOrderDetail(order.id);
  }, [fetchOrderDetail]);

  const columns = useMemo(() => [
    {
      title: "Order Ref",
      width: 130,
      customTableBody: (r: OrderRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] font-mono")}>{r.orderRef}</span>
      ),
    },
    {
      title: "Customer",
      minWidth: 180,
      customTableBody: (r: OrderRecord) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{r.userName}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.userEmail}</p>
        </div>
      ),
    },
    {
      title: "Location",
      minWidth: 120,
      customTableBody: (r: OrderRecord) => (
        <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>
          {r.userCityName ?? "—"}{r.userStateName ? `, ${r.userStateName}` : ""}
        </p>
      ),
    },
    {
      title: "Items",
      width: 65,
      customTableBody: (r: OrderRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.itemCount}</span>
      ),
    },
    {
      title: "Total",
      width: 120,
      customTableBody: (r: OrderRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>
          {r.totalAmount != null ? `₦${Number(r.totalAmount).toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      title: "Status",
      width: 130,
      customTableBody: (r: OrderRecord) => <StatusChip status={r.status as any} />,
    },
    {
      title: "Date",
      width: 110,
      customTableBody: (r: OrderRecord) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{fmt(r.createdAt)}</span>
      ),
    },
    {
      title: "",
      width: 60,
      customTableBody: (r: OrderRecord) => (
        <button
          onClick={() => handleRowClick(r)}
          className={cn(satoshi.className, "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors")}
        >
          <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ], [handleRowClick]);

  const data = useMemo(() => orders.map((r) => [r, r, r, r, r, r, r, r]), [orders]);

  if (!hydrated) return <OrdersSkeleton />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Orders
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>({meta.orders.total})</span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>Manage and fulfil customer orders</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by ref, email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(satoshi.className, "w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[0.875rem] text-[#374151] placeholder:text-[#D0D5DD] focus:outline-none focus:border-[#6EC93E]")}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={loading}
          pagination
          metaData={{
            currentPage: (meta.orders.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.orders.page * LIMIT, meta.orders.total),
            totalRecords: meta.orders.total,
            onPageChange: (offset) => fetchOrders(Math.floor(offset / LIMIT) + 1, search || undefined),
          }}
          emptyStateProps={{
            svg: "solar:box-bold-duotone",
            title: "No orders yet",
            text: "Orders will appear here once customers start purchasing.",
          }}
        />
      </div>

      <AnimatePresence>
        {(activeOrder || activeOrderLoading) && (
          activeOrderLoading && !activeOrder
            ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-white" />
              </div>
            : activeOrder && (
              <OrderDrawer
                order={activeOrder}
                onClose={() => setActiveOrder(null)}
                canWrite={canWrite}
              />
            )
        )}
      </AnimatePresence>
    </>
  );
};

export default Orders;
