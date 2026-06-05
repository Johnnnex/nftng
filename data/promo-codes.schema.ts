import { z } from "zod";

export const promoCodeSchema = z
  .object({
    campaignName: z.string().min(1, "Campaign name is required").max(100),
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code must be at most 20 characters")
      .regex(/^[A-Z0-9_-]+$/, "Uppercase letters, numbers, dashes, or underscores only")
      .transform((v) => v.toUpperCase()),
    discountType: z.enum(["percent", "flat"] as const, {
      error: "Select a discount type",
    }),
    discountValue: z
      .number({ error: "Enter a valid number" })
      .positive("Must be greater than 0"),
    maxUsage: z
      .number({ error: "Enter a valid number" })
      .int("Must be a whole number")
      .positive("Must be greater than 0")
      .nullable()
      .optional(),
    startsAt: z.string().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
  })
  .refine((d) => d.discountType !== "percent" || d.discountValue <= 100, {
    message: "Percentage cannot exceed 100",
    path: ["discountValue"],
  })
  .refine(
    (d) => !d.startsAt || !d.expiresAt || new Date(d.startsAt) < new Date(d.expiresAt),
    { message: "Expiry must be after start date", path: ["expiresAt"] },
  );

export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

export const promoCodeUpdateSchema = z
  .object({
    isActive: z.boolean().optional(),
  })
  .passthrough();
