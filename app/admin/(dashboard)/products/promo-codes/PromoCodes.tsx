/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn, hasPermission, debounce } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, usePromoStore } from "@/store";
import { Input, Button, Table, StatusChip } from "@/components";
import { promoCodeSchema, DISCOUNT_TYPE_OPTIONS } from "@/data";
import type { PromoCodeRecord, PromoCodeFormData } from "@/data";

const LIMIT = 50;

// ─── Confirm delete ───────────────────────────────────────────────────────────

const ConfirmDelete = ({
  promo,
  onClose,
  onConfirm,
  loading,
}: {
  promo: PromoCodeRecord;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827]")}>Delete Promo Code</p>
          <p className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280]")}>This cannot be undone.</p>
        </div>
      </div>
      <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>
        Delete <span className="font-semibold">"{promo.code}"</span>? Customers will no longer be able to use it.
      </p>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onClose} className={cn(satoshi.className, "px-4 py-2 text-[0.875rem]")}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={onConfirm}
          className={cn(satoshi.className, "px-4 py-2 text-[0.875rem] bg-red-500 hover:bg-red-600 text-white rounded-lg")}
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
);

// ─── Create modal ─────────────────────────────────────────────────────────────

type CodeStatus = "idle" | "checking" | "available" | "taken";

const CreateModal = ({ onClose }: { onClose: () => void }) => {
  const { createPromoCode } = usePromoStore();
  const [saving, setSaving] = useState(false);
  const [codeStatus, setCodeStatus] = useState<CodeStatus>("idle");

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { campaignName: "", code: "", discountType: "percent", discountValue: undefined as any, maxUsage: null, startsAt: null, expiresAt: null },
  });

  const discountType = watch("discountType");

  // Async uniqueness check — Zod must pass first, then hits the DB
  const checkCodeAsync = useRef(
    debounce(async (val: string, triggerFn: typeof trigger, setErr: typeof setError, clearErr: typeof clearErrors) => {
      const zodOk = await triggerFn("code");
      if (!zodOk) { setCodeStatus("idle"); return; }
      try {
        const res = await fetch(`/api/admin/promo-codes/check?code=${encodeURIComponent(val.toUpperCase())}`);
        const json = await res.json();
        if (json.exists) {
          setErr("code", { message: "This code has already been taken" });
          setCodeStatus("taken");
        } else {
          clearErr("code");
          setCodeStatus("available");
        }
      } catch {
        setCodeStatus("idle");
      }
    }, 600),
  ).current;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val || val.length < 3) {
      setCodeStatus("idle");
      clearErrors("code");
    } else {
      setCodeStatus("checking");
      checkCodeAsync(val, trigger, setError, clearErrors);
    }
  };

  const onSubmit = async (data: PromoCodeFormData) => {
    if (codeStatus === "checking" || codeStatus === "taken") return;
    setSaving(true);
    try {
      await createPromoCode(data);
      toast.success("Promo code created");
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Failed to create promo code";
      if (msg.toLowerCase().includes("already exists")) {
        setError("code", { message: "This code has already been taken" });
        setCodeStatus("taken");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-[#F3F4F6]">
          <p className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>New Promo Code</p>
          <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] mt-0.5")}>
            Create a campaign discount for customers.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
              Campaign Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Unchain Summer Launch"
              error={errors.campaignName?.message}
              className={errors.campaignName ? undefined : "border-[#D0D5DD]"}
              {...register("campaignName")}
            />
          </div>

          <div>
            <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
              Promo Code *{" "}
              <span className={cn(satoshi.className, "font-normal text-[#9CA3AF]")}>(uppercase, no spaces)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. UNCHAIN20"
              error={errors.code?.message}
              className={
                errors.code ? undefined
                : codeStatus === "available" ? "border-[#6EC93E]"
                : "border-[#D0D5DD]"
              }
              {...register("code", { onChange: handleCodeChange })}
            />
            {!errors.code && codeStatus === "checking" && (
              <p className={cn(satoshi.className, "flex items-center gap-1.5 text-[0.75rem] text-[#9CA3AF] mt-1")}>
                <Icon icon="svg-spinners:3-dots-fade" className="w-3.5 h-3.5" />
                Checking availability…
              </p>
            )}
            {!errors.code && codeStatus === "available" && (
              <p className={cn(satoshi.className, "flex items-center gap-1.5 text-[0.75rem] text-[#6EC93E] mt-1")}>
                <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                Code is available
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                Discount Type *
              </label>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <Input
                    type="select"
                    value={field.value}
                    selectOptions={DISCOUNT_TYPE_OPTIONS}
                    onChange={(e: any) => field.onChange(e.target.value)}
                    error={errors.discountType?.message}
                    className={errors.discountType ? undefined : "border-[#D0D5DD]"}
                  />
                )}
              />
            </div>
            <div>
              <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                {discountType === "percent" ? "Percentage (1–100)" : "Amount (₦)"}
                {" *"}
              </label>
              <Input
                type="number"
                placeholder={discountType === "percent" ? "e.g. 20" : "e.g. 5000"}
                error={errors.discountValue?.message}
                className={errors.discountValue ? undefined : "border-[#D0D5DD]"}
                {...register("discountValue", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                Start Date <span className="font-normal text-[#9CA3AF]">(optional)</span>
              </label>
              <Input
                type="datetime-local"
                value={watch("startsAt") ?? ""}
                onChange={(e: any) => setValue("startsAt", e.target.value || null, { shouldDirty: true })}
                placeholder="Select start date"
              />
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>Leave blank = active immediately</p>
            </div>
            <div>
              <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                Expiry Date <span className="font-normal text-[#9CA3AF]">(optional)</span>
              </label>
              <Input
                type="datetime-local"
                value={watch("expiresAt") ?? ""}
                onChange={(e: any) => setValue("expiresAt", e.target.value || null, { shouldDirty: true, shouldValidate: true })}
                placeholder="Select expiry date"
              />
              {errors.expiresAt && (
                <p className={cn(satoshi.className, "text-[0.75rem] text-red-500 mt-1")}>{errors.expiresAt.message as string}</p>
              )}
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>Leave blank = never expires</p>
            </div>
          </div>

          <div>
            <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
              Max Usage <span className="font-normal text-[#9CA3AF]">(optional)</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 100"
              error={errors.maxUsage?.message}
              className={errors.maxUsage ? undefined : "border-[#D0D5DD]"}
              {...register("maxUsage", { setValueAs: (v) => (v === "" || isNaN(Number(v)) ? null : Number(v)) })}
            />
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>Leave blank = unlimited uses</p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className={cn(satoshi.className, "flex-1 py-2.5 rounded-xl text-[0.875rem]")}
            >
              Cancel
            </Button>
            <Button
              loading={saving}
              disabled={codeStatus === "checking" || codeStatus === "taken"}
              type="submit"
              className={cn(satoshi.className, "flex-1 py-2.5! rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none")}
            >
              Create
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const PromoCodes = () => {
  const { admin } = useAuthStore();
  const { promoCodes, meta, loading, fetchPromoCodes, togglePromoCode, deletePromoCode } = usePromoStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "products", "write");

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromoCodeRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSearch = useCallback((value: string | number) => {
    fetchPromoCodes(1, String(value));
  }, [fetchPromoCodes]);

  const handleToggle = useCallback(
    async (promo: PromoCodeRecord) => {
      setTogglingId(promo.id);
      try {
        await togglePromoCode(promo.id, !promo.isActive);
        toast.success(promo.isActive ? "Promo code deactivated" : "Promo code activated");
      } catch {
        toast.error("Failed to update promo code");
      } finally {
        setTogglingId(null);
      }
    },
    [togglePromoCode],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deletePromoCode(deleteTarget.id);
      toast.success("Promo code deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete promo code");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, deletePromoCode]);

  const columns = useMemo(
    () => [
      {
        title: "Campaign",
        customTableBody: (r: PromoCodeRecord) => (
          <div className="min-w-0">
            <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] truncate")}>{r.campaignName}</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] font-mono mt-0.5")}>{r.code}</p>
          </div>
        ),
      },
      {
        title: "Discount",
        width: 140,
        customTableBody: (r: PromoCodeRecord) => (
          <span className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151]")}>
            {r.discountType === "percent"
              ? `${r.discountValue}% off`
              : `₦${r.discountValue.toLocaleString()} off`}
          </span>
        ),
      },
      {
        title: "Uses",
        width: 70,
        customTableBody: (r: PromoCodeRecord) => (
          <span className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.usageCount}</span>
        ),
      },
      {
        title: "Status",
        width: 100,
        customTableBody: (r: PromoCodeRecord) => (
          <StatusChip status={r.isActive ? "active" : "inactive"} />
        ),
      },
      {
        title: "Created",
        width: 110,
        customTableBody: (r: PromoCodeRecord) => (
          <span className={cn(satoshi.className, "text-[0.8125rem] text-nowrap text-[#9CA3AF]")}>{fmt(r.createdAt)}</span>
        ),
      },
      {
        title: "",
        width: 90,
        customTableBody: (r: PromoCodeRecord) => (
          canWrite ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleToggle(r)}
                disabled={togglingId === r.id}
                title={r.isActive ? "Deactivate" : "Activate"}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
              >
                <Icon
                  icon={togglingId === r.id ? "solar:refresh-bold" : r.isActive ? "solar:eye-closed-bold" : "solar:eye-bold"}
                  className={cn("w-3.5 h-3.5", togglingId === r.id && "animate-spin")}
                />
              </button>
              <button
                onClick={() => setDeleteTarget(r)}
                title="Delete"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null
        ),
      },
    ],
    [canWrite, handleToggle, togglingId],
  );

  const data = useMemo(() => promoCodes.map((r) => [r, r, r, r, r, r]), [promoCodes]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Promo Codes
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>
              ({meta.total})
            </span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>
            Manage discount campaigns for the storefront
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => setShowCreate(true)}
            className={cn(
              satoshi.className,
              "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6EC93E] text-white text-[0.875rem] font-semibold hover:bg-[#5cb535] transition-colors shadow-sm shadow-[#6EC93E]/20",
            )}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            New Code
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={loading}
          pagination
          head
          search={{ show: true, placeholder: "Search code or campaign…", onResolve: handleSearch }}
          metaData={{
            currentPage: (meta.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.page * LIMIT, meta.total),
            totalRecords: meta.total,
            onPageChange: (offset) => fetchPromoCodes(Math.floor(offset / LIMIT) + 1),
          }}
          emptyStateProps={{
            svg: "solar:tag-bold-duotone",
            title: "No promo codes yet",
            text: "Create a campaign discount to get started.",
          }}
        />
      </div>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>

      {deleteTarget && (
        <ConfirmDelete
          promo={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </>
  );
};

export default PromoCodes;
