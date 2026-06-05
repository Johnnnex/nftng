export type OrderStatus = "pending_payment" | "paid" | "in_progress" | "complete" | "cancelled" | "refunded";
export type ItemStatus = "pending" | "packaged" | "enroute" | "delivered" | "returned";
export type TripStatus = "draft" | "dispatched" | "completed";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  in_progress: "In Progress",
  complete: "Complete",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  pending: "Pending",
  packaged: "Packaged",
  enroute: "En Route",
  delivered: "Delivered",
  returned: "Returned",
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  draft: "Draft",
  dispatched: "Dispatched",
  completed: "Completed",
};

// Products admin can advance: pending → packaged only. logistics_ready is a separate bool action.
export const ITEM_NEXT_STATUS: Partial<Record<ItemStatus, ItemStatus>> = {
  pending: "packaged",
};

// ─── Order types ──────────────────────────────────────────────────────────────

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  productTitle: string;
  productImage: string | null;
  variantCombo: Record<string, string>;
  quantity: number;
  unitPrice: number;
  status: ItemStatus;
  logisticsReady: boolean;
  refundAmount: number | null;
  packagedAt: string | null;
  enrouteAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  createdAt: string;
};

export type OrderRecord = {
  id: string;
  orderRef: string;
  transactionId: string | null;
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  userAddressLine: string;
  userCityId: string | null;
  userCityName: string | null;
  userStateId: string | null;
  userStateName: string | null;
  deliveryMethod: string | null;
  status: OrderStatus;
  totalAmount: number | null;
  deliveryFee: number | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetail = OrderRecord & {
  items: OrderItem[];
};

// ─── Trip types ───────────────────────────────────────────────────────────────

export type TripRecord = {
  id: string;
  code: string;
  riderName: string;
  riderPhone: string;
  riderEmail: string | null;
  riderCompany: string | null;
  status: TripStatus;
  createdBy: string | null;
  dispatchedAt: string | null;
  createdAt: string;
  itemCount: number;
};

export type TripItem = {
  id: string; // trip_items.id
  tripId: string;
  orderItemId: string;
  // joined fields
  productTitle: string;
  productImage: string | null;
  variantCombo: Record<string, string>;
  quantity: number;
  itemStatus: ItemStatus;
  orderId: string;
  orderRef: string;
  userName: string;
  userEmail: string;
  userAddress: string;
  userCityName: string | null;
  userStateName: string | null;
};

export type TripDetail = TripRecord & {
  items: TripItem[];
};

// ─── Logistics queue item ─────────────────────────────────────────────────────

export type LogisticsQueueItem = {
  id: string; // order_items.id
  orderId: string;
  orderRef: string;
  productTitle: string;
  productImage: string | null;
  variantCombo: Record<string, string>;
  quantity: number;
  status: ItemStatus;
  logisticsReady: boolean;
  packagedAt: string | null;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  userCityId: string | null;
  userCityName: string | null;
  userStateId: string | null;
  userStateName: string | null;
};

// ─── Outside Nigeria order types ──────────────────────────────────────────────

export type OutsideNigeriaItem = {
  productTitle: string;
  variantCombo: Record<string, string>;
  qty: number;
  unitPrice: number;
  productImage: string | null;
};

export type OutsideNigeriaOrder = {
  id: string;
  previewToken: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCountryId: string | null;
  userCountryName: string | null;
  userAddress: string;
  items: OutsideNigeriaItem[];
  status: "pending" | "resolved" | "reverted";
  resolvedAt: string | null;
  createdAt: string;
};

// ─── Refund types ─────────────────────────────────────────────────────────────

export type RefundRecord = {
  id: string;
  orderId: string;
  orderItemId: string | null;
  amount: number;
  processedBy: string | null;
  processedAt: string;
  notes: string | null;
};

// ─── Geo types ────────────────────────────────────────────────────────────────

export type GeoCountry = { id: string; name: string; code: string };
export type GeoState = { id: string; countryId: string; name: string };
export type GeoCity = { id: string; stateId: string; name: string };
export type DeliveryConfig = {
  id: string;
  cityId: string;
  method: "park" | "gig" | "direct";
  price: number;
  estimatedDays: string | null;
};
