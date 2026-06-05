import { z } from "zod";

export const checkoutSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a valid phone number"),
    streetAddress: z.string().min(5, "Street address is required"),
    countryId: z.string().min(1, "Select a country"),
    countryCode: z.string(), // 'NG' or other — set programmatically
    // Nigerian-only fields
    stateId: z.string().optional(),
    cityId: z.string().optional(),
    deliveryMethod: z.enum(["park", "gig", "direct"] as const).optional(),
    paymentMethod: z.enum(["paystack", "flutterwave"] as const).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.countryCode === "NG") {
      if (!d.stateId) ctx.addIssue({ code: "custom", message: "Select a state", path: ["stateId"] });
      if (!d.cityId) ctx.addIssue({ code: "custom", message: "Select a city", path: ["cityId"] });
      if (!d.deliveryMethod) ctx.addIssue({ code: "custom", message: "Select a delivery method", path: ["deliveryMethod"] });
      if (!d.paymentMethod) ctx.addIssue({ code: "custom", message: "Select a payment method", path: ["paymentMethod"] });
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
