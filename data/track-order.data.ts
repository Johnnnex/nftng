import type { ItemStatus, OrderStatus } from "@/components";

export type TrackOrderItem = {
  id: string;
  name: string;
  image: string | null;
  variantCombo: Record<string, string>;
  quantity: number;
  price: number;
  status: ItemStatus;
  refundAmount: number | null;
};

export type TrackOrderResult = {
  id: string;           // order_ref (display)
  internalId: string;   // orders.id UUID — used for Realtime subscription
  customer: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
  products: TrackOrderItem[];
  userAddress?: string;
  cityName?: string;
  stateName?: string;
  orderRefundAmount: number | null; // sum of order-level refunds (order_item_id = null)
};

export const ORDER_STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending_payment", label: "Payment" },
  { key: "in_progress", label: "In Progress" },
  { key: "complete", label: "Complete" },
];

export const ITEM_STATUS_STEPS: { key: ItemStatus; label: string }[] = [
  { key: "pending", label: "Confirmed" },
  { key: "packaged", label: "Packaged" },
  { key: "enroute", label: "En Route" },
  { key: "delivered", label: "Delivered" },
];
