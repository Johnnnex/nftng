/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useReviewsStore } from "@/store";
import { Table, Button, StatusChip } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { ReviewRecord } from "@/data";

const LIMIT = 50;

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          icon={s <= rating ? "solar:star-bold" : "solar:star-outline"}
          className={cn("w-3.5 h-3.5", s <= rating ? "text-amber-400" : "text-[#D1D5DB]")}
        />
      ))}
    </div>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

const ReviewDrawer = ({ review: initialReview, onClose, canWrite }: { review: ReviewRecord; onClose: () => void; canWrite: boolean }) => {
  const { reviews, patchReview } = useReviewsStore();
  // Always read live data from the store so button states update instantly
  const review = reviews.find((r) => r.id === initialReview.id) ?? initialReview;
  const [acting, setActing] = useState<string | null>(null);

  const handle = useCallback(async (action: "verify" | "unverify" | "approve" | "unapprove") => {
    setActing(action);
    try {
      await patchReview(review.id, action);
      toast.success(
        action === "verify" ? "Marked as verified"
        : action === "unverify" ? "Verification removed"
        : action === "approve" ? "Review published"
        : "Review unpublished",
      );
    } catch { toast.error("Action failed"); }
    finally { setActing(null); }
  }, [review.id, patchReview]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280]">
            <Icon icon="solar:close-square-bold" className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827] truncate")}>{review.reviewerName}</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{review.productTitle ?? "Unknown product"} · {fmt(review.createdAt)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-1")}>Rating</p>
              <StarRating rating={review.rating} />
            </div>
            <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-1")}>Product</p>
              <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151] truncate")}>{review.productTitle ?? "—"}</p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-1")}>Review</p>
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151] leading-relaxed")}>{review.content}</p>
          </div>

          <div className="flex gap-3">
            <div className={cn("flex-1 rounded-xl px-4 py-3 border", review.isVerified ? "border-[#6EC93E]/30 bg-[#6EC93E]/5" : "border-[#E5E7EB]")}>
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-0.5")}>Verified</p>
              <StatusChip status={review.isVerified ? "active" : "inactive"} />
            </div>
            <div className={cn("flex-1 rounded-xl px-4 py-3 border", review.isApproved ? "border-[#6EC93E]/30 bg-[#6EC93E]/5" : "border-[#E5E7EB]")}>
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-0.5")}>Published</p>
              <StatusChip status={review.isApproved ? "active" : "inactive"} />
            </div>
          </div>

          {canWrite && (
            <div className="rounded-xl border border-[#E5E7EB] p-4 flex flex-col gap-3">
              <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151]")}>Actions</p>
              <div className="flex flex-wrap gap-2">
                {review.isVerified ? (
                  <Button loading={acting === "unverify"} onClick={() => handle("unverify")} variant="secondary"
                    className={cn(satoshi.className, "px-4 py-2! rounded-lg! text-[0.875rem]")}>
                    <Icon icon="solar:shield-cross-bold-duotone" className="w-4 h-4 mr-1.5" />
                    Remove Verification
                  </Button>
                ) : (
                  <Button loading={acting === "verify"} onClick={() => handle("verify")}
                    className={cn(satoshi.className, "px-4 py-2! rounded-lg! bg-[#6EC93E]! hover:bg-[#5cb535]! text-white! font-semibold text-[0.875rem]")}>
                    <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 mr-1.5" />
                    Mark Verified
                  </Button>
                )}
                {review.isApproved ? (
                  <Button loading={acting === "unapprove"} onClick={() => handle("unapprove")} variant="secondary"
                    className={cn(satoshi.className, "px-4 py-2! rounded-lg! text-[0.875rem]")}>
                    <Icon icon="solar:eye-closed-bold" className="w-4 h-4 mr-1.5" />
                    Unpublish
                  </Button>
                ) : (
                  <Button loading={acting === "approve"} onClick={() => handle("approve")}
                    className={cn(satoshi.className, "px-4 py-2! rounded-lg! bg-[#111827]! hover:bg-[#1f2937]! text-white! font-semibold text-[0.875rem]")}>
                    <Icon icon="solar:eye-bold" className="w-4 h-4 mr-1.5" />
                    Publish
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const Reviews = () => {
  const { admin } = useAuthStore();
  const { reviews, meta, loading, fetchReviews, patchReview } = useReviewsStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "products", "write");

  const [activeReview, setActiveReview] = useState<ReviewRecord | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSearch = useCallback((value: string | number) => {
    fetchReviews(1, String(value));
  }, [fetchReviews]);

  const handlePublishToggle = useCallback(async (r: ReviewRecord) => {
    setTogglingId(r.id);
    try {
      await patchReview(r.id, r.isApproved ? "unapprove" : "approve");
      toast.success(r.isApproved ? "Review unpublished" : "Review published");
    } catch { toast.error("Failed to update review"); }
    finally { setTogglingId(null); }
  }, [patchReview]);

  const columns = useMemo(() => [
    {
      title: "Reviewer",
      minWidth: 160,
      customTableBody: (r: ReviewRecord) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827]")}>{r.reviewerName}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] truncate max-w-[140px]")}>{r.productTitle ?? "—"}</p>
        </div>
      ),
    },
    {
      title: "Rating",
      width: 110,
      customTableBody: (r: ReviewRecord) => <StarRating rating={r.rating} />,
    },
    {
      title: "Review",
      minWidth: 200,
      customTableBody: (r: ReviewRecord) => (
        <p className={cn(satoshi.className, "text-[0.8125rem] text-[#374151] line-clamp-2 max-w-[240px]")}>{r.content}</p>
      ),
    },
    {
      title: "Verified",
      width: 90,
      customTableBody: (r: ReviewRecord) => (
        <StatusChip status={r.isVerified ? "active" : "inactive"} />
      ),
    },
    {
      title: "Published",
      width: 100,
      customTableBody: (r: ReviewRecord) => (
        <StatusChip status={r.isApproved ? "active" : "inactive"} />
      ),
    },
    {
      title: "Date",
      width: 100,
      customTableBody: (r: ReviewRecord) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] whitespace-nowrap")}>{fmt(r.createdAt)}</span>
      ),
    },
    {
      title: "",
      width: 100,
      customTableBody: (r: ReviewRecord) => canWrite ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePublishToggle(r)}
            disabled={togglingId === r.id}
            title={r.isApproved ? "Unpublish" : "Publish"}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
          >
            <Icon
              icon={togglingId === r.id ? "solar:refresh-bold" : r.isApproved ? "solar:eye-closed-bold" : "solar:eye-bold"}
              className={cn("w-3.5 h-3.5", togglingId === r.id && "animate-spin")}
            />
          </button>
          <button
            onClick={() => setActiveReview(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
          >
            <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
            View
          </button>
        </div>
      ) : (
        <button
          onClick={() => setActiveReview(r)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
        >
          <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ], [canWrite, handlePublishToggle, togglingId]);

  const data = useMemo(() => reviews.map((r) => [r, r, r, r, r, r, r]), [reviews]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Reviews
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>({meta.total})</span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>Approve and verify customer product reviews</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={loading}
          pagination
          head
          search={{ show: true, placeholder: "Search reviewer, product, or review text…", onResolve: handleSearch }}
          metaData={{
            currentPage: (meta.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.page * LIMIT, meta.total),
            totalRecords: meta.total,
            onPageChange: (offset) => fetchReviews(Math.floor(offset / LIMIT) + 1),
          }}
          emptyStateProps={{
            svg: "solar:star-bold-duotone",
            title: "No reviews yet",
            text: "Customer product reviews will appear here once submitted.",
          }}
        />
      </div>

      <AnimatePresence>
        {activeReview && (
          <ReviewDrawer
            review={activeReview}
            onClose={() => setActiveReview(null)}
            canWrite={canWrite}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Reviews;
