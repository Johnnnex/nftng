"use client";
import { create } from "zustand";
import { authRequest } from "@/lib/api";
import type { StatusChipStatus } from "@/components";

export type DashboardMetrics = {
  totalOrders: number;
  thisMonthOrders: number;
  netRevenue: number;
  thisMonthNetRevenue: number;
  totalRegistrations: number;
  thisMonthRegistrations: number;
  activeProducts: number;
  changes: { orders: number; revenue: number; registrations: number; activeProducts: number };
  lastMonth: { orders: number; revenue: number; registrations: number };
};

export type ChartPoint = { name: string; Revenue: number; Refunds: number };

export type DashboardRecentOrder = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: StatusChipStatus;
  date: string;
};

type DashboardState = {
  metrics: DashboardMetrics | null;
  chartData: ChartPoint[];
  chartYears: number[];
  selectedYear: number;
  recentOrders: DashboardRecentOrder[];
  chartLoading: boolean;
  fetchChart: (year: number) => Promise<void>;
};

export const useDashboardStore = create<DashboardState>()((set) => ({
  metrics: null,
  chartData: [],
  chartYears: [],
  selectedYear: new Date().getFullYear(),
  recentOrders: [],
  chartLoading: false,

  fetchChart: async (year) => {
    set({ chartLoading: true });
    try {
      const res = await authRequest({ url: `/api/admin/dashboard/chart?year=${year}` });
      const d = res.data as { data: ChartPoint[] };
      set({ chartData: d.data, selectedYear: year });
    } finally {
      set({ chartLoading: false });
    }
  },
}));
