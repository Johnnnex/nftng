"use client";
import { create } from "zustand";
import { authRequest } from "@/lib/api";
import type { ReviewRecord, ReviewAction } from "@/data";
import type { PaginationMeta } from "@/data";

const LIMIT = 50;

type ReviewsState = {
  reviews: ReviewRecord[];
  meta: PaginationMeta;
  search: string;
  loading: boolean;
  fetchReviews: (page?: number, search?: string) => Promise<void>;
  patchReview: (id: string, action: ReviewAction) => Promise<void>;
};

export const useReviewsStore = create<ReviewsState>()((set, get) => ({
  reviews: [],
  meta: { total: 0, page: 1, limit: LIMIT },
  search: "",
  loading: true,

  fetchReviews: async (page = 1, search) => {
    const s = search !== undefined ? search : get().search;
    set({ loading: true, search: s });
    const params = new URLSearchParams({ page: String(page) });
    if (s) params.set("search", s);
    const res = await authRequest({ url: `/api/admin/products/reviews?${params}` });
    set({ reviews: res.data.data, meta: res.data.meta, loading: false });
  },

  patchReview: async (id, action) => {
    await authRequest({ method: "PATCH", url: `/api/admin/products/reviews/${id}`, data: { action } });
    set((s) => ({
      reviews: s.reviews.map((r) =>
        r.id !== id ? r : {
          ...r,
          isVerified: action === "verify" ? true : action === "unverify" ? false : r.isVerified,
          isApproved: action === "approve" ? true : action === "unapprove" ? false : r.isApproved,
        },
      ),
    }));
  },
}));
