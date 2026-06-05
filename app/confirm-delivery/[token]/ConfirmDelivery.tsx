/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useState, useRef, useCallback, type KeyboardEvent, type ClipboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { Button } from "@/components";
import { useConfirmDeliveryStore } from "@/store";
import { api } from "@/lib/api";

const CODE_LENGTH = 8;

// ─── OTP input ────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "success" | "error";

const OtpInput = ({
  value,
  status,
  onChange,
}: {
  value: string;
  status: Status;
  onChange: (v: string) => void;
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (idx: number) => {
    inputsRef.current[Math.max(0, Math.min(CODE_LENGTH - 1, idx))]?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        const next = value.slice(0, idx) + value.slice(idx + 1);
        onChange(next.padEnd(value.length > idx ? value.length : idx, "").slice(0, CODE_LENGTH));
      } else {
        focus(idx - 1);
      }
    } else if (e.key === "ArrowLeft") { focus(idx - 1); }
    else if (e.key === "ArrowRight") { focus(idx + 1); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const char = e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(-1);
    if (!char) return;
    const chars = value.split("");
    chars[idx] = char;
    const next = chars.join("").slice(0, CODE_LENGTH);
    onChange(next);
    focus(idx + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").slice(0, CODE_LENGTH);
    onChange(pasted);
    focus(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const borderColor = {
    idle: "border-[#E5E7EB] focus:border-[#6EC93E]",
    loading: "border-[#6EC93E] animate-pulse-green",
    success: "border-[#6EC93E] bg-[#6EC93E]/5",
    error: "border-red-400 bg-red-50",
  }[status];

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length: CODE_LENGTH }, (_, i) => {
        const char = value[i] ?? "";
        const isFilled = !!char;
        return (
          <motion.div
            key={i}
            animate={isFilled && status === "idle" ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.18, ease: "backOut" }}
            className="relative"
          >
            <input
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKey(e, i)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              disabled={status === "loading" || status === "success"}
              className={cn(
                satoshi.className,
                "w-10 h-12 sm:w-12 sm:h-14 text-center text-[1.125rem] sm:text-[1.25rem] font-bold rounded-xl border-2 outline-none transition-all duration-150 tracking-widest",
                isFilled ? "text-black" : "text-[#9CA3AF]",
                borderColor,
                status === "loading" && "border-[#6EC93E]",
                status === "success" && "text-[#3a7a1e]",
                status === "error" && "text-red-600",
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ConfirmDelivery({ token }: { token: string }) {
  const { data } = useConfirmDeliveryStore();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const submitRef = useRef(false);

  const handleConfirm = useCallback(async (codeVal: string) => {
    if (submitRef.current || codeVal.length < CODE_LENGTH) return;
    submitRef.current = true;
    setStatus("loading");
    try {
      await api.post("/api/confirm-delivery", { token, code: codeVal });
      setStatus("success");
      toast.success("Delivery confirmed! Thank you 🎉");
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Invalid code — please try again";
      setStatus("error");
      toast.error(msg);
      submitRef.current = false;
      // Reset to idle after a moment so user can retry
      setTimeout(() => setStatus("idle"), 1800);
    }
  }, [token]);

  const handleCodeChange = useCallback((v: string) => {
    setCode(v);
    if (status === "error") setStatus("idle");
    if (v.length === CODE_LENGTH) {
      handleConfirm(v);
    }
  }, [status, handleConfirm]);

  if (!data) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F2F4F7] to-white flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 pt-28 pb-20 flex flex-col gap-8">

        {/* Hero */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.22, ease: "backOut" }}
              className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 transition-colors",
                status === "success" ? "bg-[#6EC93E]/15 border border-[#6EC93E]/30" :
                status === "error" ? "bg-red-50 border border-red-200" :
                "bg-[#6EC93E]/10 border border-[#6EC93E]/20",
              )}
            >
              <Icon
                icon={
                  status === "success" ? "solar:check-circle-bold-duotone" :
                  status === "error" ? "solar:close-circle-bold-duotone" :
                  "solar:delivery-bold-duotone"
                }
                className={cn(
                  "w-10 h-10",
                  status === "success" ? "text-[#6EC93E]" :
                  status === "error" ? "text-red-500" :
                  "text-[#6EC93E]",
                )}
              />
            </motion.div>
          </AnimatePresence>

          <h1 className={cn(poppins.className, "text-[1.75rem] font-bold text-black mb-2")}>
            {status === "success" ? "Delivery Confirmed!" : "Confirm Your Delivery"}
          </h1>
          <p className={cn(satoshi.className, "text-[#6B7280] text-[0.9375rem] max-w-sm mx-auto leading-relaxed")}>
            {status === "success"
              ? "Your items have been marked as delivered. Thank you!"
              : "Enter the 8-character code from your rider to confirm receipt."}
          </p>
        </div>

        {/* Order info */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className={cn(poppins.className, "font-semibold text-[0.9375rem] text-black")}>{data.orderRef}</p>
              <p className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280]")}>{data.userName} · {data.userAddress}</p>
            </div>
            {data.riderName && (
              <div className="flex items-center gap-1.5 text-[0.8125rem] text-[#6B7280]">
                <Icon icon="solar:user-bold-duotone" className="w-4 h-4" />
                <span className={satoshi.className}>Rider: <span className="font-medium text-black">{data.riderName}</span></span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {data.items.map((item) => {
              const combo = Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ");
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.productImage
                      ? <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                      : <Icon icon="solar:image-bold-duotone" className="w-4 h-4 text-[#D0D0D0]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-black truncate")}>{item.productTitle}</p>
                    {combo && <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{combo}</p>}
                  </div>
                  <p className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280] shrink-0")}>×{item.quantity}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* OTP input + submit */}
        {status !== "success" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full">
              <p className={cn(satoshi.className, "text-[0.75rem] font-semibold text-[#9CA3AF] uppercase tracking-widest text-center mb-4")}>
                Enter Rider Code
              </p>
              <OtpInput value={code} status={status} onChange={handleCodeChange} />
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] text-center mt-3")}>
                {code.length}/{CODE_LENGTH} · Auto-confirms when complete
              </p>
            </div>

            <Button
              loading={status === "loading"}
              onClick={() => handleConfirm(code)}
              disabled={code.length < CODE_LENGTH || status === "loading"}
              className={cn(
                satoshi.className,
                "w-full max-w-xs h-12 rounded-xl font-semibold text-[1rem] transition-all",
                status === "error"
                  ? "bg-red-500! hover:bg-red-600! text-white!"
                  : "bg-[#6EC93E]! hover:bg-[#5cb535]! text-white!",
              )}
            >
              {status === "error" ? "Try Again" : "Confirm Delivery"}
            </Button>
          </div>
        )}

        {/* Success state */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="grid grid-cols-8 gap-1.5">
              {code.split("").map((char, i) => (
                <div key={i} className="w-9 h-11 sm:w-11 sm:h-13 flex items-center justify-center rounded-xl border-2 border-[#6EC93E] bg-[#6EC93E]/5 text-[#3a7a1e] font-bold font-mono text-[1rem] sm:text-[1.125rem]">
                  {char}
                </div>
              ))}
            </div>
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#6B7280] text-center")}>
              All items on this trip have been marked as delivered.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
