import type { StatusChipStatus } from "@/components";
import type { ModuleName } from "@/lib/permissions";

export type AdminNavChild = {
  label: string;
  href: string;
};

export type AdminNavItem = {
  label: string;
  icon: string;
  href: string;
  module: ModuleName | null; // null = always visible (no permission gate)
  children?: AdminNavChild[];
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", icon: "solar:widget-5-bold-duotone", href: "/admin", module: null },
  {
    label: "Products",
    icon: "solar:bag-bold-duotone",
    href: "/admin/products",
    module: "products",
    children: [
      { label: "Products", href: "/admin/products" },
      { label: "Orders", href: "/admin/orders" },
      { label: "Sales Config", href: "/admin/products/config" },
    ],
  },
  {
    label: "Logistics",
    icon: "solar:delivery-bold-duotone",
    href: "/admin/logistics",
    module: "logistics",
    children: [
      { label: "Items Queue", href: "/admin/logistics/items" },
      { label: "Trips", href: "/admin/logistics/trips" },
      { label: "International", href: "/admin/logistics/international" },
      { label: "Geo Config", href: "/admin/logistics/config" },
    ],
  },
  { label: "Registrations", icon: "solar:users-group-two-rounded-bold-duotone", href: "/admin/registrations", module: "registrations" },
];

export const ADMIN_SUPER_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Admin Management",
    icon: "solar:shield-user-bold-duotone",
    href: "/admin/team",
    module: "adminManagement",
    children: [
      { label: "Admins", href: "/admin/team" },
      { label: "Role Templates", href: "/admin/team/roles" },
    ],
  },
];

export type StatCard = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  color: string;
};

export const MOCK_STATS: StatCard[] = [
  {
    title: "Total Orders",
    value: "1,204",
    change: "+12.4%",
    trend: "up",
    icon: "solar:box-bold-duotone",
    color: "#6EC93E",
  },
  {
    title: "Revenue",
    value: "$48,390",
    change: "+8.1%",
    trend: "up",
    icon: "solar:dollar-minimalistic-bold-duotone",
    color: "#3B82F6",
  },
  {
    title: "Registrations",
    value: "3,812",
    change: "+22.6%",
    trend: "up",
    icon: "solar:users-group-two-rounded-bold-duotone",
    color: "#8B5CF6",
  },
  {
    title: "Active Products",
    value: "47",
    change: "-3",
    trend: "down",
    icon: "solar:bag-bold-duotone",
    color: "#F97316",
  },
];

export const MOCK_REVENUE_DATA = [
  { name: "Jan", Revenue: 8200 },
  { name: "Feb", Revenue: 11400 },
  { name: "Mar", Revenue: 9800 },
  { name: "Apr", Revenue: 14200 },
  { name: "May", Revenue: 13600 },
  { name: "Jun", Revenue: 18900 },
  { name: "Jul", Revenue: 22400 },
  { name: "Aug", Revenue: 19800 },
  { name: "Sep", Revenue: 25100 },
  { name: "Oct", Revenue: 28400 },
  { name: "Nov", Revenue: 31200 },
  { name: "Dec", Revenue: 48390 },
];

export type RecentOrder = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: StatusChipStatus;
  date: string;
};

export const MOCK_RECENT_ORDERS: RecentOrder[] = [
  { id: "ORD-2609", customer: "Adaeze Nwosu", items: 3, total: 450, status: "paid", date: "May 25, 2026" },
  { id: "ORD-2608", customer: "Tunde Akinbiyi", items: 1, total: 180, status: "in_progress", date: "May 25, 2026" },
  { id: "ORD-2607", customer: "Chisom Eze", items: 2, total: 390, status: "complete", date: "May 24, 2026" },
  { id: "ORD-2606", customer: "Olumide Adeyemi", items: 5, total: 820, status: "pending_payment", date: "May 24, 2026" },
  { id: "ORD-2605", customer: "Fatima Bello", items: 2, total: 260, status: "complete", date: "May 23, 2026" },
  { id: "ORD-2604", customer: "Emeka Okonkwo", items: 1, total: 95, status: "cancelled", date: "May 23, 2026" },
  { id: "ORD-2603", customer: "Zainab Hassan", items: 4, total: 610, status: "in_progress", date: "May 22, 2026" },
];
