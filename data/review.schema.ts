import { z } from "zod";

export const reviewSubmitSchema = z.object({
  productId: z.string().uuid(),
  reviewerName: z.string().min(2, "Name must be at least 2 characters"),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

export type ReviewSubmitData = z.infer<typeof reviewSubmitSchema>;

export type ReviewRecord = {
  id: string;
  productId: string | null;
  productTitle: string | null;
  reviewerName: string;
  rating: number;
  content: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
};

export type ReviewAction = "verify" | "unverify" | "approve" | "unapprove";
