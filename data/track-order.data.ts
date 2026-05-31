import type { ItemStatus, OrderStatus } from "@/components";

export type TrackOrderItem = {
  id: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  status: ItemStatus;
};

export type TrackOrderResult = {
  id: string;
  customer: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
  products: TrackOrderItem[];
};

export const MOCK_ORDERS: Record<string, TrackOrderResult> = {
  "ORD-2609": {
    id: "ORD-2609",
    customer: "Adaeze Nwosu",
    date: "May 25, 2026",
    total: 450,
    items: 3,
    status: "in_progress",
    products: [
      {
        id: "ITEM-001",
        name: "NFTNG Signature Tee",
        image: "/images/products/tee-1.jpg",
        size: "M",
        color: "Midnight Black",
        quantity: 1,
        price: 150,
        status: "packaged",
      },
      {
        id: "ITEM-002",
        name: "Unchain Summer Cap",
        image: "/images/products/cap-1.jpg",
        size: "One Size",
        color: "Arctic White",
        quantity: 2,
        price: 300,
        status: "on_delivery",
      },
    ],
  },
  "ORD-2607": {
    id: "ORD-2607",
    customer: "Chisom Eze",
    date: "May 24, 2026",
    total: 390,
    items: 2,
    status: "complete",
    products: [
      {
        id: "ITEM-003",
        name: "Unchain Summer Tee",
        image: "/images/products/tee-2.jpg",
        size: "L",
        color: "Forest Green",
        quantity: 1,
        price: 150,
        status: "delivered",
      },
      {
        id: "ITEM-004",
        name: "NFTNG Hoodie",
        image: "/images/products/hoodie-1.jpg",
        size: "M",
        color: "Obsidian",
        quantity: 1,
        price: 240,
        status: "delivered",
      },
    ],
  },
};

export const ORDER_STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending_payment", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "in_progress", label: "In Progress" },
  { key: "complete", label: "Complete" },
];

export const ITEM_STATUS_STEPS: { key: ItemStatus; label: string }[] = [
  { key: "paid", label: "Paid" },
  { key: "packaged", label: "Packaged" },
  { key: "on_delivery", label: "On Delivery" },
  { key: "at_destination", label: "Arrived" },
  { key: "delivered", label: "Delivered" },
];
