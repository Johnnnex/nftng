"use client";
import { useEffect } from "react";
import { useReviewsStore } from "@/store";
import type { ReviewRecord, PaginationMeta } from "@/data";

type ReviewsPage = { data: ReviewRecord[]; meta: PaginationMeta };

export function ReviewsInitializer({ results }: { results: [ReviewsPage | null] }) {
  useEffect(() => {
    const page = results[0];
    useReviewsStore.setState({
      reviews: page?.data ?? [],
      meta: page?.meta ?? { total: 0, page: 1, limit: 50 },
      loading: false,
    });
  }, []);
  return null;
}
