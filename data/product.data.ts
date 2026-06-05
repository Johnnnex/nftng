import type { SaleStatus } from "./storefront.data";
export type { SaleStatus };

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  open: "On Sale",
  almost_out: "Almost Out",
  out_of_stock: "Out of Stock",
  opening_soon: "Coming Soon",
  closing_soon: "Closing Soon",
  closed: "Sales Closed",
  inactive: "Inactive",
};

// ─── Product types ────────────────────────────────────────────────────────────

export type ProductVariantEntry = {
  id: string;
  productId: string;
  groupId: string;
  value: string;
  priceOverride: number | null;
  imageUrl: string | null;
  displayOrder: number;
};

export type ProductVariantGroup = {
  id: string;
  productId: string;
  name: string;
  influencesPrice: boolean;
  influencesImage: boolean;
  displayOrder: number;
  entries: ProductVariantEntry[];
};

export type ProductStockRow = {
  id: string;
  productId: string;
  combo: Record<string, string>;
  quantity: number;
};

export type ProductFaq = {
  id: string;
  productId: string;
  question: string;
  answer: string;
  displayOrder: number;
};

export type ProductReview = {
  id: string;
  productId: string;
  reviewerName: string;
  rating: number;
  content: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
};

// List view — aggregated
export type ProductRecord = {
  id: string;
  title: string;
  basePrice: number;
  baseImage: string | null;
  isActive: boolean;
  salesOpenAt: string | null;
  salesCloseAt: string | null;
  saleStatus: SaleStatus;
  variantGroupCount: number;
  totalStock: number;
  createdAt: string;
};

// Full detail — for edit form and product detail
export type ProductDetail = {
  id: string;
  title: string;
  about: string | null;
  description: string | null;
  basePrice: number;
  baseImage: string | null;
  isActive: boolean;
  salesOpenAt: string | null;
  salesCloseAt: string | null;
  saleStatus: SaleStatus;
  variantGroups: ProductVariantGroup[];
  stocks: ProductStockRow[];
  faqs: ProductFaq[];
  reviewCount: number;
  avgRating: number | null;
  createdAt: string;
  updatedAt: string;
};

// Ecommerce global config
export type EcommerceConfig = {
  id: string;
  salesOpenAt: string | null;
  salesCloseAt: string | null;
  updatedAt: string;
};

// ─── Draft types for multi-step form ─────────────────────────────────────────

export type DraftVariantEntry = {
  _id: string;
  value: string;
  priceOverride: string;
  imageUrl: string | null;
  displayOrder: number;
};

export type DraftVariantGroup = {
  _id: string;
  name: string;
  influencesPrice: boolean;
  influencesImage: boolean;
  displayOrder: number;
  entries: DraftVariantEntry[];
};

export type DraftStockRow = {
  _id: string;
  combo: Record<string, string>;
  quantity: string;
};

export type DraftFaq = {
  _id: string;
  question: string;
  answer: string;
};

export type ProductFormState = {
  title: string;
  about: string;
  description: string;
  basePrice: string;
  baseImage: string | null;
  isActive: boolean;
  salesOpenAt: string | null;
  salesCloseAt: string | null;
  variantGroups: DraftVariantGroup[];
  stocks: DraftStockRow[];
  faqs: DraftFaq[];
};

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  title: "",
  about: "",
  description: "",
  basePrice: "",
  baseImage: null,
  isActive: false,
  salesOpenAt: null,
  salesCloseAt: null,
  variantGroups: [],
  stocks: [],
  faqs: [],
};

export const PRODUCT_STEPS = [
  { key: "basics", label: "The Basics" },
  { key: "variants", label: "Variant Groups" },
  { key: "stock", label: "Stock" },
  { key: "faqs", label: "FAQs" },
  { key: "review", label: "Review & Publish" },
] as const;

export type ProductStep = (typeof PRODUCT_STEPS)[number]["key"];
