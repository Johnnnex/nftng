"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { Chart, StatusChip, Table } from "@/components";
import { MOCK_STATS, MOCK_REVENUE_DATA, MOCK_RECENT_ORDERS } from "@/data";
import type { StatusChipStatus } from "@/components";
import { useAuthStore } from "@/store";

const Bone = ({ className }: { className: string }) => (
  <div className={cn("bg-[#F3F4F6] rounded-full animate-pulse", className)} />
);

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Stat cards */}
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Bone className="h-3.5 w-24" />
            <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] animate-pulse" />
          </div>
          <div className="flex flex-col gap-2">
            <Bone className="h-7 w-28" />
            <Bone className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>

    {/* Chart card */}
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Bone className="h-4 w-36" />
          <Bone className="h-3 w-24" />
        </div>
        <Bone className="h-3.5 w-16" />
      </div>
      <div className="h-56 bg-[#F9FAFB] rounded-xl animate-pulse" />
    </div>

    {/* Orders table */}
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
        <Bone className="h-4 w-32" />
        <Bone className="h-3.5 w-14" />
      </div>
      <div className="flex flex-col">
        {/* Header row */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-[#F3F4F6]">
          {[40, 56, 28, 32, 44, 32].map((w, i) => (
            <Bone key={i} className={`h-3 w-${w} flex-1`} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F9FAFB]">
            <Bone className="h-3 flex-1" />
            <Bone className="h-3 flex-1" />
            <Bone className="h-3 flex-1" />
            <Bone className="h-3 flex-1" />
            <div className="flex-1"><Bone className="h-5 w-20 rounded-full" /></div>
            <Bone className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ORDER_COLUMNS = [
  {
    title: "Order ID",
    customTableBody: (v: string) => (
      <span className={cn(satoshi.className, "font-semibold text-[#111827]")}>{v}</span>
    ),
  },
  "Customer",
  {
    title: "Items",
    customTableBody: (v: number) => (
      <span className={cn(satoshi.className, "text-[#374151]")}>{v} item{v !== 1 ? "s" : ""}</span>
    ),
  },
  {
    title: "Total",
    customTableBody: (v: number) => (
      <span className={cn(satoshi.className, "font-medium text-[#111827]")}>${v.toLocaleString()}</span>
    ),
  },
  {
    title: "Status",
    customTableBody: (v: StatusChipStatus) => <StatusChip status={v} />,
  },
  "Date",
];

const ORDER_ROWS = MOCK_RECENT_ORDERS.map((o) => [
  o.id,
  o.customer,
  o.items,
  o.total,
  o.status,
  o.date,
]);

const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <p className={cn(satoshi.className, "text-[0.8125rem] font-medium text-[#6B7280]")}>{stat.title}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
                <Icon icon={stat.icon} className="w-[1.1rem] h-[1.1rem]" style={{ color: stat.color }} />
              </div>
            </div>
            <div>
              <p className={cn(poppins.className, "text-[1.625rem] font-semibold text-[#111827] leading-tight")}>{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <Icon
                  icon={stat.trend === "up" ? "solar:arrow-up-bold" : "solar:arrow-down-bold"}
                  className={cn("w-3.5 h-3.5", stat.trend === "up" ? "text-[#6EC93E]" : "text-red-500")}
                />
                <span
                  className={cn(
                    satoshi.className,
                    "text-[0.8125rem] font-medium",
                    stat.trend === "up" ? "text-[#6EC93E]" : "text-red-500",
                  )}
                >
                  {stat.change}
                </span>
                <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue chart ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>Revenue Overview</h2>
            <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] mt-0.5")}>Jan – Dec 2026</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6EC93E]" />
            <span className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280]")}>Revenue</span>
          </div>
        </div>
        <div className="h-56">
          <Chart
            type="area"
            data={MOCK_REVENUE_DATA}
            labelProps={[{ title: "Revenue", color: "#6EC93E", colorId: "AdminRevenue" }]}
            prefersToolTip
            cartesianGrid={{ stroke: "#F3F4F6" }}
          />
        </div>
      </div>

      {/* ── Recent orders ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>Recent Orders</h2>
          <a
            href="/admin/orders"
            className={cn(satoshi.className, "text-[0.875rem] text-[#6EC93E] font-medium hover:underline")}
          >
            View all
          </a>
        </div>

        <Table
          columns={ORDER_COLUMNS}
          data={ORDER_ROWS}
          shouldNotHaveBorder
          nonScrollable
          numberColName="#"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
