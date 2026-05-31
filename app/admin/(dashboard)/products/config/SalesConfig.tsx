/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useProductStore } from "@/store";
import { Button, Input } from "@/components";
import { hasPermission } from "@/lib/permissions";

const ConfigSkeleton = () => (
  <div className="max-w-lg animate-pulse flex flex-col gap-5">
    <div className="h-8 w-56 bg-[#F3F4F6] rounded-xl" />
    <div className="h-48 bg-[#F3F4F6] rounded-2xl" />
  </div>
);

const fmtLocal = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Not set");

const SalesConfig = () => {
  const { admin, hydrated } = useAuthStore();
  const { config, fetchConfig, updateConfig } = useProductStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "products", "write");

  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (config) {
      setOpenAt(config.salesOpenAt ? config.salesOpenAt.slice(0, 16) : "");
      setCloseAt(config.salesCloseAt ? config.salesCloseAt.slice(0, 16) : "");
    }
  }, [config]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateConfig({
        salesOpenAt: openAt ? new Date(openAt).toISOString() : null,
        salesCloseAt: closeAt ? new Date(closeAt).toISOString() : null,
      });
      toast.success("Sales window updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update config");
    } finally {
      setSaving(false);
    }
  }, [openAt, closeAt, updateConfig]);

  if (!hydrated) return <ConfigSkeleton />;

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div>
        <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>Sales Configuration</h1>
        <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>
          Global sales window — this applies on top of per-product windows
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5 text-[#6EC93E]" />
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827]")}>Global Sales Window</p>
          </div>
          {canWrite && !editing && (
            <button
              onClick={() => setEditing(true)}
              className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors")}
            >
              <Icon icon="solar:pen-bold" className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Status banner */}
          {config && (
            <StatusBanner config={config} />
          )}

          {!editing ? (
            /* Read-only view */
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Sales Open At", value: fmtLocal(config?.salesOpenAt ?? null), sub: "Null = always open" },
                { label: "Sales Close At", value: fmtLocal(config?.salesCloseAt ?? null), sub: "Null = never closes" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-[#F9FAFB] rounded-xl px-4 py-3">
                  <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{label}</p>
                  <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151] mt-0.5")}>{value}</p>
                  <p className={cn(satoshi.className, "text-[0.6875rem] text-[#D1D5DB] mt-0.5")}>{sub}</p>
                </div>
              ))}
            </div>
          ) : (
            /* Edit form */
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>Sales Open At</label>
                  <Input
                    type="datetime-local"
                    value={openAt}
                    onChange={(e) => setOpenAt((e as any).target.value)}
                    placeholder="Select open date & time"
                  />
                  <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>Leave blank = always open</p>
                </div>
                <div>
                  <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>Sales Close At</label>
                  <Input
                    type="datetime-local"
                    value={closeAt}
                    onChange={(e) => setCloseAt((e as any).target.value)}
                    placeholder="Select close date & time"
                  />
                  <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>Leave blank = never closes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  loading={saving}
                  onClick={handleSave}
                  className={cn(satoshi.className, "px-5 py-2 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem]")}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setEditing(false); if (config) { setOpenAt(config.salesOpenAt?.slice(0, 16) ?? ""); setCloseAt(config.salesCloseAt?.slice(0, 16) ?? ""); } }}
                  className={cn(satoshi.className, "px-5 py-2 rounded-xl text-[0.875rem]")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="rounded-xl bg-[#F9FAFB] border border-[#F3F4F6] p-4 flex gap-3">
            <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-[#9CA3AF] shrink-0 mt-0.5" />
            <div>
              <p className={cn(satoshi.className, "text-[0.8125rem] font-medium text-[#374151]")}>Two-layer window</p>
              <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] mt-0.5")}>
                A product is purchasable only when BOTH this global window AND the product's own window are open.
                Leaving both dates blank here means the global gate is always open — per-product windows take full control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatusBanner({ config }: { config: { salesOpenAt: string | null; salesCloseAt: string | null } }) {
  const now = new Date();
  const openAt = config.salesOpenAt ? new Date(config.salesOpenAt) : null;
  const closeAt = config.salesCloseAt ? new Date(config.salesCloseAt) : null;

  const isOpen =
    (openAt == null || now >= openAt) &&
    (closeAt == null || now <= closeAt);

  return (
    <div className={cn("flex items-center gap-2.5 px-4 py-3 rounded-xl", isOpen ? "bg-[#6EC93E]/10 border border-[#6EC93E]/20" : "bg-amber-50 border border-amber-200")}>
      <div className={cn("w-2 h-2 rounded-full", isOpen ? "bg-[#6EC93E]" : "bg-amber-500")} />
      <p className={cn(satoshi.className, "text-[0.875rem] font-semibold", isOpen ? "text-[#3a7a1e]" : "text-amber-700")}>
        {isOpen ? "Store is currently OPEN for purchases" : "Store is currently CLOSED for purchases"}
      </p>
    </div>
  );
}

export default SalesConfig;
