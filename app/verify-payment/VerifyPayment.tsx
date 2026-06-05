"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "@/lib";
import { api } from "@/lib/api";
import { poppins, satoshi, monumentExtended } from "@/app/layout";
import { useCartStore } from "@/store";

type VerifyStatus = "checking" | "success" | "pending" | "failed";

const CheckingState = () => (
  <div className="flex flex-col items-center gap-6 py-16 px-4">
    <div className="w-24 h-24 rounded-3xl bg-[#6EC93E]/10 border border-[#6EC93E]/20 flex items-center justify-center">
      <Icon icon="svg-spinners:3-dots-fade" className="w-12 h-12 text-[#6EC93E]" />
    </div>
    <div className="text-center">
      <h1 className={cn(monumentExtended.className, "text-[1.75rem] sm:text-[2.25rem] font-extrabold text-[#111827] mb-2")}>
        Verifying Payment
      </h1>
      <p className={cn(satoshi.className, "text-[#6B7280] text-[1rem] max-w-sm mx-auto")}>
        Confirming your payment with the gateway — hang tight.
      </p>
    </div>
  </div>
);

const PendingState = ({ orderRef }: { orderRef: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 py-16 px-4">
    <div className="w-24 h-24 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center">
      <Icon icon="solar:clock-circle-bold-duotone" className="w-12 h-12 text-amber-500" />
    </div>
    <div className="text-center">
      <h1 className={cn(monumentExtended.className, "text-[1.75rem] sm:text-[2.25rem] font-extrabold text-[#111827] mb-2")}>Payment Pending</h1>
      <p className={cn(satoshi.className, "text-[#6B7280] text-[1rem] max-w-sm mx-auto leading-relaxed")}>
        We haven&apos;t received confirmation yet. Your order is reserved while we wait.
      </p>
    </div>
    {orderRef && (
      <div className="w-full max-w-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-5">
        <p className={cn(satoshi.className, "text-[0.75rem] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1")}>Order ID</p>
        <p className={cn(poppins.className, "text-[1.5rem] font-bold text-[#111827] tracking-tight")}>{orderRef}</p>
      </div>
    )}
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <Link href="/track-order" className={cn(poppins.className, "py-4 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem] rounded-[3.875rem] transition-colors text-center")}>
        Track Order
      </Link>
      <Link href="/contact" className={cn(poppins.className, "py-4 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] font-semibold text-[0.9375rem] rounded-[3.875rem] transition-colors text-center")}>
        Contact Support
      </Link>
    </div>
  </motion.div>
);

const FailedState = ({ onRetry }: { onRetry: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 py-16 px-4">
    <div className="w-24 h-24 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center">
      <Icon icon="solar:close-circle-bold-duotone" className="w-12 h-12 text-red-500" />
    </div>
    <div className="text-center">
      <h1 className={cn(monumentExtended.className, "text-[1.75rem] sm:text-[2.25rem] font-extrabold text-[#111827] mb-2")}>Payment Failed</h1>
      <p className={cn(satoshi.className, "text-[#6B7280] text-[1rem] max-w-sm mx-auto leading-relaxed")}>
        The payment could not be confirmed. No charges were applied. Please try again.
      </p>
    </div>
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <button onClick={onRetry} className={cn(poppins.className, "py-4 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem] rounded-[3.875rem] transition-colors")}>
        Try Again
      </button>
      <Link href="/contact" className={cn(poppins.className, "py-4 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] font-semibold text-[0.9375rem] rounded-[3.875rem] transition-colors text-center")}>
        Contact Support
      </Link>
    </div>
  </motion.div>
);

const VerifyPayment = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { clearCart } = useCartStore();

  const orderRef = params.get("ref") ?? "";
  const gateway = params.get("gateway") ?? "";
  const paystackRef = params.get("reference") ?? params.get("trxref") ?? orderRef;
  const flwTxId = params.get("transaction_id") ?? "";

  const [status, setStatus] = useState<VerifyStatus>("checking");

  useEffect(() => {
    if (!orderRef) { setStatus("failed"); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.post<{ data: { status: string } }>("/api/orders/verify", {
          orderRef,
          gateway: gateway || undefined,
          reference: paystackRef || undefined,
          transactionId: flwTxId || undefined,
        });
        if (!cancelled) {
          const s = res.data.data?.status as VerifyStatus;
          setStatus(s ?? "failed");
          if (s === "success") {
            clearCart();
            router.replace(`/order-success?ref=${encodeURIComponent(orderRef)}`);
          }
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#6EC93E 1px, transparent 1px), linear-gradient(90deg, #6EC93E 1px, transparent 1px)", backgroundSize: "3.5rem 3.5rem" }} />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-60 rounded-full bg-[#6EC93E]/8 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto">
        {status === "checking" && <CheckingState />}
        {status === "pending" && <PendingState orderRef={orderRef} />}
        {status === "failed" && <FailedState onRetry={() => router.push("/checkout")} />}
      </div>
    </div>
  );
};

export default VerifyPayment;
