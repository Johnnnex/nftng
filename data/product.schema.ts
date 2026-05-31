import { z } from "zod";

const variantEntrySchema = z.object({
  value: z.string().min(1, "Value is required"),
  priceOverride: z.number().positive("Must be positive").nullable(),
  imageUrl: z.string().url("Must be a valid URL").nullable(),
  displayOrder: z.number().int().default(0),
});

const variantGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  influencesPrice: z.boolean(),
  influencesImage: z.boolean(),
  displayOrder: z.number().int().default(0),
  entries: z.array(variantEntrySchema).min(1, "At least one entry required"),
});

const stockRowSchema = z.object({
  combo: z.record(z.string(), z.string()),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
});

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  displayOrder: z.number().int().default(0),
});

// Step-1 schema used by react-hook-form — string fields that RHF controls natively
export const productBasicsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 characters"),
  basePrice: z
    .string()
    .min(1, "Base price is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  description: z.string().optional(),
  salesOpenAt: z.string().optional(),
  salesCloseAt: z.string().optional(),
});
export type ProductBasicsData = z.infer<typeof productBasicsSchema>;

export const productCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().nullable().default(null),
  basePrice: z.number().positive("Base price must be positive"),
  baseImage: z.string().url("Must be a valid URL").nullable().default(null),
  isActive: z.boolean().default(false),
  salesOpenAt: z.string().datetime({ offset: true }).nullable().default(null),
  salesCloseAt: z.string().datetime({ offset: true }).nullable().default(null),
  variantGroups: z.array(variantGroupSchema).default([]),
  stocks: z.array(stockRowSchema).default([]),
  faqs: z.array(faqSchema).default([]),
});

export type ProductCreateData = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = productCreateSchema.partial();
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;

export const productToggleSchema = z.object({
  isActive: z.boolean(),
});
export type ProductToggleData = z.infer<typeof productToggleSchema>;

export const ecommerceConfigSchema = z.object({
  salesOpenAt: z.string().datetime({ offset: true }).nullable(),
  salesCloseAt: z.string().datetime({ offset: true }).nullable(),
});
export type EcommerceConfigData = z.infer<typeof ecommerceConfigSchema>;
