"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "@/lib";
import { poppins, satoshi, monumentExtended } from "@/app/layout";

const OrderSuccess = () => {
  const params = useSearchParams();
  const orderRef = params.get("ref") ?? "";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!orderRef) return;
    await navigator.clipboard.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#6EC93E 1px, transparent 1px), linear-gradient(90deg, #6EC93E 1px, transparent 1px)", backgroundSize: "3.5rem 3.5rem" }} />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-60 rounded-full bg-[#6EC93E]/8 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 py-16 px-4"
        >
          {/* Ripple icon */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full bg-[#6EC93E]/8 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute w-28 h-28 rounded-full bg-[#6EC93E]/12" />
            <div className="w-24 h-24 rounded-3xl bg-[#6EC93E] flex items-center justify-center shadow-xl shadow-[#6EC93E]/30 relative z-10">
              <Icon icon="solar:check-circle-bold" className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h1 className={cn(monumentExtended.className, "text-[1.75rem] sm:text-[2.5rem] font-extrabold text-[#111827] mb-2")}>
              Order Confirmed!
            </h1>
            <p className={cn(satoshi.className, "text-[#6B7280] text-[1rem] max-w-sm mx-auto leading-relaxed")}>
              Your payment was successful. We&apos;re already getting your items ready.
            </p>
          </div>

          {orderRef && (
            <div className="w-full max-w-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-5">
              <p className={cn(satoshi.className, "text-[0.75rem] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1")}>Your Order ID</p>
              <div className="flex items-center justify-between gap-3">
                <p className={cn(poppins.className, "text-[1.5rem] font-bold text-[#111827] tracking-tight")}>{orderRef}</p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-[#6EC93E] hover:text-[#5cb535] transition-colors shrink-0"
                >
                  <Icon icon={copied ? "solar:check-circle-bold" : "solar:copy-bold-duotone"} className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] mt-1")}>Save this to track your order</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Link href="/track-order"
              className={cn(poppins.className, "flex-1 py-4 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem] rounded-[3.875rem] transition-colors text-center")}
            >
              Track Order
            </Link>
            <Link href="/collections"
              className={cn(poppins.className, "flex-1 py-4 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] font-semibold text-[0.9375rem] rounded-[3.875rem] transition-colors text-center")}
            >
              Keep Shopping
            </Link>
          </div>

          <div className="flex items-center gap-2.5 bg-[#6EC93E]/8 border border-[#6EC93E]/20 rounded-2xl px-4 py-3 w-full max-w-sm">
            <Icon icon="solar:letter-bold-duotone" className="w-5 h-5 text-[#6EC93E] shrink-0" />
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>
              A confirmation email is on its way to you.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
