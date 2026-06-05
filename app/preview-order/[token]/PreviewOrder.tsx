/* eslint-disable @next/next/no-img-element */
"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { usePreviewOrderStore } from "@/store";

const STATUS_CONFIG = {
  pending:  { label: "Pending Review", bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
  resolved: { label: "Resolved",       bg: "bg-[#6EC93E]/10", text: "text-[#3a7a1e]", dot: "bg-[#6EC93E]" },
  reverted: { label: "Reverted",       bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400"    },
} as const;

export default function PreviewOrder() {
  const { order } = usePreviewOrderStore();
  if (!order) return null;

  const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const items = (order.items ?? []) as {
    productId?: string;
    productTitle: string;
    variantCombo: Record<string, string>;
    qty: number;
    unitPrice: number;
    productImage?: string | null;
  }[];

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F2F4F7] to-white pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className={cn(poppins.className, "text-[1.5rem] font-bold text-black")}>
              International Order Preview
            </h1>
            <span className={cn(satoshi.className, "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-medium", status.bg, status.text)}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.dot)} />
              {status.label}
            </span>
          </div>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#6B7280]")}>
            We'll reach out at <span className="font-semibold text-black">{order.userEmail}</span> with delivery pricing and next steps.
          </p>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className={cn(poppins.className, "font-semibold text-[1rem] text-black mb-4")}>Your Details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Name", value: order.userName },
              { label: "Email", value: order.userEmail },
              { label: "Phone", value: order.userPhone },
              { label: "Country", value: order.userCountryName ?? "—" },
              { label: "Address", value: order.userAddress },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F9FAFB] rounded-xl px-4 py-3">
                <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{label}</p>
                <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-black mt-0.5 break-words")}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className={cn(poppins.className, "font-semibold text-[1rem] text-black mb-4")}>
            Items ({items.length})
          </p>
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => {
              const combo = Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ");
              return (
                <div key={idx} className="flex gap-4 items-start p-3 bg-[#F9FAFB] rounded-xl">
                  <div className="w-14 h-14 rounded-lg bg-[#F0F0F0] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.productImage
                      ? <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                      : <Icon icon="solar:image-bold-duotone" className="w-6 h-6 text-[#D0D0D0]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(satoshi.className, "font-semibold text-[0.9375rem] text-black truncate")}>{item.productTitle}</p>
                    {combo && <p className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280] mt-0.5")}>{combo}</p>}
                    <p className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280]")}>Qty: {item.qty}</p>
                  </div>
                  <p className={cn(satoshi.className, "font-bold text-[0.9375rem] text-black shrink-0")}>
                    ₦{(item.unitPrice * item.qty).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#F0F0F0] flex items-center justify-between">
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#6B7280]")}>Subtotal (excl. int'l delivery)</p>
            <p className={cn(satoshi.className, "font-bold text-[1rem] text-black")}>₦{subtotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-[#6EC93E]/8 border border-[#6EC93E]/20 rounded-2xl p-4">
          <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-[#6EC93E] shrink-0 mt-0.5" />
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151] leading-relaxed")}>
            International delivery is handled manually. Our team will contact you with pricing, timeline, and payment instructions. Keep this page bookmarked — this URL is your order reference.
          </p>
        </div>

      </div>
    </div>
  );
}
