import { z } from "zod";

export const geoCountrySchema = z.object({
  name: z.string().min(1, "Country name is required"),
  code: z
    .string()
    .length(2, "Code must be exactly 2 characters")
    .transform((v) => v.toUpperCase()),
});
export type GeoCountryFormData = z.infer<typeof geoCountrySchema>;

export const geoStateSchema = z.object({
  name: z.string().min(1, "State name is required"),
});
export type GeoStateFormData = z.infer<typeof geoStateSchema>;

export const geoCitySchema = z.object({
  name: z.string().min(1, "City name is required"),
});
export type GeoCityFormData = z.infer<typeof geoCitySchema>;

export const geoDeliveryPriceSchema = z.object({
  method: z.enum(["park", "gig", "direct"] as const),
  price: z.number().min(0, "Price must be 0 or greater"),
  estimatedDays: z.string().optional(),
});
export type GeoDeliveryPriceFormData = z.infer<typeof geoDeliveryPriceSchema>;
