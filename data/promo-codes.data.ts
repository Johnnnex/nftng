export type DiscountType = "percent" | "flat";

export const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "percent", label: "Percentage (%)" },
  { value: "flat", label: "Flat Amount (₦)" },
];

export type PromoCodeRecord = {
  id: string;
  campaignName: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  usageCount: number;
  maxUsage: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
