/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { Chart, StatusChip, Table, Input } from "@/components";
import { useAuthStore, useDashboardStore } from "@/store";
import { hasPermission } from "@/lib/permissions";
import type { StatusChipStatus } from "@/components";

// ─── CountUp ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  title: string;
  total: number;
  thisMonth: number;
  format: "number" | "currency";
  changePct: number;
  icon: string;
  color: string;
};

function fmtNum(n: number, format: "number" | "currency") {
  if (format === "currency") {
    const abs = Math.abs(n).toLocaleString("en-NG");
    return n < 0 ? `-₦${abs}` : `₦${abs}`;
  }
  return n.toLocaleString();
}

function StatCard({ title, total, thisMonth, format, changePct, icon, color }: StatCardProps) {
  const countTotal = useCountUp(total);
  const countMonth = useCountUp(thisMonth);
  const isUp = changePct > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className={cn(satoshi.className, "text-[0.8125rem] font-medium text-[#6B7280]")}>{title}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon icon={icon} className="w-[1.1rem] h-[1.1rem]" style={{ color }} />
        </div>
      </div>
      <div>
        <p className={cn(poppins.className, "text-[1.625rem] font-semibold text-[#111827] leading-tight")}>
          {fmtNum(countTotal, format)}
        </p>
        <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] mt-0.5")}>
          {fmtNum(countMonth, format)} this month
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Icon
            icon={isUp ? "solar:arrow-up-bold" : "solar:arrow-down-bold"}
            className={cn("w-3.5 h-3.5", isUp ? "text-[#6EC93E]" : "text-red-500")}
          />
          <span className={cn(satoshi.className, "text-[0.8125rem] font-medium", isUp ? "text-[#6EC93E]" : "text-red-500")}>
            {isUp ? "+" : ""}{changePct}%
          </span>
          <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>vs last month</span>
        </div>
      </div>
    </div>
  );
}

// ─── Order columns ────────────────────────────────────────────────────────────

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
      <span className={cn(satoshi.className, "font-medium text-[#111827]")}>₦{v.toLocaleString()}</span>
    ),
  },
  {
    title: "Status",
    customTableBody: (v: StatusChipStatus) => <StatusChip status={v} />,
  },
  "Date",
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { admin } = useAuthStore();
  const canViewOrders = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "products", "read");
  const { metrics, chartData, chartYears, selectedYear, recentOrders, chartLoading, fetchChart } = useDashboardStore();

  const { control, watch } = useForm({ defaultValues: { year: String(selectedYear) } });
  const yearValue = watch("year");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const y = parseInt(yearValue);
    if (isNaN(y) || y === selectedYear) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchChart(y), 300);
  }, [yearValue, selectedYear, fetchChart]);

  if (!metrics) return null;

  const m = metrics;

  const orderRows = recentOrders.map((o) => [o.id, o.customer, o.items, o.total, o.status, o.date]);

  const yearOptions = chartYears.map((y) => ({ value: String(y), label: String(y) }));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          total={m.totalOrders}
          thisMonth={m.thisMonthOrders}
          format="number"
          changePct={m.changes.orders}
          icon="solar:box-bold-duotone"
          color="#6EC93E"
        />
        <StatCard
          title="Net Revenue"
          total={m.netRevenue}
          thisMonth={m.thisMonthNetRevenue}
          format="currency"
          changePct={m.changes.revenue}
          icon="solar:dollar-minimalistic-bold-duotone"
          color="#3B82F6"
        />
        <StatCard
          title="Registrations"
          total={m.totalRegistrations}
          thisMonth={m.thisMonthRegistrations}
          format="number"
          changePct={m.changes.registrations}
          icon="solar:users-group-two-rounded-bold-duotone"
          color="#8B5CF6"
        />
        <StatCard
          title="Active Products"
          total={m.activeProducts}
          thisMonth={m.activeProducts}
          format="number"
          changePct={m.changes.activeProducts}
          icon="solar:bag-bold-duotone"
          color="#F97316"
        />
      </div>

      {/* ── Revenue chart ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>Revenue Overview</h2>
            <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] mt-0.5")}>Revenue vs Refunds</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6EC93E]" />
                <span className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280]")}>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                <span className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280]")}>Refunds</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {chartLoading && (
                <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 text-[#6EC93E]" />
              )}
              <div className="w-28">
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="select"
                      value={field.value}
                      selectOptions={yearOptions}
                      onChange={(e: any) => field.onChange(e.target.value)}
                      className="border-[#D0D5DD] py-1.5! text-[0.875rem]!"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={cn("h-56 transition-opacity duration-200", chartLoading && "opacity-40")}>
          <Chart
            type="area"
            data={chartData}
            labelProps={[
              { title: "Revenue", color: "#6EC93E", colorId: "DashRevenue" },
              { title: "Refunds", color: "#F97316", colorId: "DashRefunds" },
            ]}
            prefersToolTip
            cartesianGrid={{ stroke: "#F3F4F6" }}
          />
        </div>
      </div>

      {/* ── Recent orders ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>Recent Orders</h2>
          {canViewOrders && (
            <Link href="/admin/orders" className={cn(satoshi.className, "text-[0.875rem] text-[#6EC93E] font-medium hover:underline")}>
              View all
            </Link>
          )}
        </div>
        {orderRows.length > 0 ? (
          <Table columns={ORDER_COLUMNS} data={orderRows} shouldNotHaveBorder nonScrollable numberColName="#" />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-8 h-8 text-[#D1D5DB]" />
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
