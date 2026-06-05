// ─── Sale status ──────────────────────────────────────────────────────────────
// API-computed. Frontend never recomputes from raw dates.

export type SaleStatus =
  | "open"
  | "almost_out"
  | "out_of_stock"
  | "opening_soon"
  | "closing_soon"
  | "closed"
  | "inactive";

// Priority for display overlays — higher index = higher priority
export const SALE_STATUS_PRIORITY: SaleStatus[] = [
  "open",
  "opening_soon",
  "closing_soon",
  "almost_out",
  "closed",
  "out_of_stock", // highest — always wins
];

export const SALE_STATUS_OVERLAY: Record<
  SaleStatus,
  { label: string; bg: string; text: string } | null
> = {
  open: null,
  opening_soon: { label: "Coming Soon", bg: "bg-[#6EC93E]", text: "text-white" },
  closing_soon: { label: "Closing Soon", bg: "bg-orange-500", text: "text-white" },
  almost_out: { label: "Almost Out", bg: "bg-amber-400", text: "text-black" },
  closed: { label: "Sales Closed", bg: "bg-[#111827]", text: "text-white" },
  out_of_stock: { label: "Out of Stock", bg: "bg-[#1a1a1a]/80", text: "text-white" },
  inactive: null,
};

// ─── Public product list item ─────────────────────────────────────────────────

export type PublicProduct = {
  id: string;
  title: string;
  basePrice: number;
  baseImage: string | null;
  saleStatus: SaleStatus;
  totalStock: number;
  variantGroupCount: number;
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
};

// ─── Public product detail ────────────────────────────────────────────────────

export type PublicVariantEntry = {
  id: string;
  value: string;
  priceOverride: number | null;
  imageUrl: string | null;
  displayOrder: number;
};

export type PublicVariantGroup = {
  id: string;
  name: string;
  influencesPrice: boolean;
  influencesImage: boolean;
  displayOrder: number;
  entries: PublicVariantEntry[];
};

export type PublicStockRow = {
  id: string;
  combo: Record<string, string>;
  quantity: number;
};

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
};

export type PublicReview = {
  id: string;
  reviewerName: string;
  rating: number;
  content: string;
  isVerified: boolean;
  createdAt: string;
};

export type PublicProductDetail = {
  id: string;
  title: string;
  description: string | null;
  about: string | null;
  basePrice: number;
  baseImage: string | null;
  saleStatus: SaleStatus;
  salesOpenAt: string | null;
  salesCloseAt: string | null;
  totalStock: number;
  variantGroups: PublicVariantGroup[];
  stocks: PublicStockRow[];
  faqs: PublicFaq[];
  reviews: PublicReview[];
  avgRating: number | null;
  reviewCount: number;
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export type CartItem = {
  productId: string;
  title: string;
  image: string | null;
  variantCombo: Record<string, string>; // keys sorted alphabetically
  price: number; // unit price at add-to-cart time
  qty: number;
  maxQty: number; // stock at add-to-cart time — used to cap qty in cart UI
};

export type AppliedPromo = {
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  discountAmount: number; // computed at apply time against subtotal
};

// ─── Delivery ─────────────────────────────────────────────────────────────────

export type DeliveryCountry = {
  id: string;
  name: string;
  code: string;
};

export type DeliveryState = {
  id: string;
  name: string;
  countryId: string;
};

export type DeliveryCity = {
  id: string;
  name: string;
  stateId: string;
};

// ─── Variant greying logic ────────────────────────────────────────────────────
// All client-side — no per-selection API calls. Works with the full stocks array.

// Stage 1: initial — no selections yet
export function isEntryAvailableInitial(
  stocks: PublicStockRow[],
  groupName: string,
  entryValue: string,
): boolean {
  return stocks.some((s) => s.quantity > 0 && s.combo[groupName] === entryValue);
}

// Stage 2: with partial selection
export function isEntryAvailable(
  stocks: PublicStockRow[],
  groupName: string,
  entryValue: string,
  currentSelection: Record<string, string>,
): boolean {
  return stocks.some(
    (s) =>
      s.quantity > 0 &&
      s.combo[groupName] === entryValue &&
      Object.entries(currentSelection).every(([k, v]) => s.combo[k] === v),
  );
}

// Full combo selected: look up exact stock row
export function getStockForCombo(
  stocks: PublicStockRow[],
  combo: Record<string, string>,
): PublicStockRow | null {
  const sortedCombo = Object.keys(combo).sort().reduce(
    (acc, k) => ({ ...acc, [k]: combo[k] }),
    {} as Record<string, string>,
  );
  const key = JSON.stringify(sortedCombo);
  return stocks.find((s) => {
    const sorted = Object.keys(s.combo).sort().reduce(
      (acc, k) => ({ ...acc, [k]: s.combo[k] }),
      {} as Record<string, string>,
    );
    return JSON.stringify(sorted) === key;
  }) ?? null;
}

// Cart item identity key
export function cartItemKey(productId: string, variantCombo: Record<string, string>): string {
  const sorted = Object.keys(variantCombo).sort().reduce(
    (acc, k) => ({ ...acc, [k]: variantCombo[k] }),
    {} as Record<string, string>,
  );
  return `${productId}:${JSON.stringify(sorted)}`;
}
