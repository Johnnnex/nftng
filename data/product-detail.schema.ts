import { z } from "zod";

export const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  review: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
