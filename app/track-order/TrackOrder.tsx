/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { StatusChip } from "@/components";
import { poppins, satoshi, monumentExtended } from "@/app/layout";
import {
  ORDER_STATUS_STEPS,
  ITEM_STATUS_STEPS,
  orderIdSchema,
  type TrackOrderResult,
  type TrackOrderItem,
} from "@/data";
import { useTrackOrderStore } from "@/store";
import type { ItemStatus, OrderStatus } from "@/components";

// ── Stepper ───────────────────────────────────────────────────────────────────

function OrderStepper({ status }: { status: OrderStatus }) {
  // 'paid' sits at the Payment step position but with payment confirmed (green, not amber)
  const effectiveStatus = status === "paid" ? "pending_payment" : status;
  const currentIdx = ORDER_STATUS_STEPS.findIndex(
    (s) => s.key === effectiveStatus,
  );
  const isPendingPayment = status === "pending_payment";
  const isTerminal = status === "refunded" || status === "cancelled";

  // Play the fill animation after mount so steps fill in sequence on initial load
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center gap-0 w-full">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx && !isPendingPayment;
        const isCurrent = i === currentIdx;
        const isLast = i === ORDER_STATUS_STEPS.length - 1;
        const isBarFilled = i < currentIdx && !isPendingPayment;

        const dotBorder =
          isTerminal && isCurrent
            ? "#f87171"
            : isPendingPayment && isCurrent
              ? "#fbbf24"
              : done
                ? "#6EC93E"
                : "#E5E7EB";
        const dotBg =
          isTerminal && isCurrent
            ? "#f87171"
            : isPendingPayment && isCurrent
              ? "#fbbf24"
              : done
                ? "#6EC93E"
                : "#ffffff";
        const textColor =
          isTerminal && isCurrent
            ? "text-red-400"
            : isPendingPayment && isCurrent
              ? "text-amber-400"
              : done
                ? "text-[#6EC93E]"
                : "text-[#9CA3AF]";

        return (
          <div
            key={step.key}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  borderColor: dotBorder,
                  backgroundColor: dotBg,
                }}
                transition={{
                  duration: 0.35,
                  delay: animated ? 0 : i * 0.18,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: animated ? 0 : i * 0.18 + 0.1,
                      duration: 0.25,
                      ease: "backOut",
                    }}
                  >
                    <Icon
                      icon="solar:check-bold"
                      className="w-3.5 h-3.5 text-white"
                    />
                  </motion.span>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                )}
              </motion.div>
              <span
                className={cn(
                  satoshi.className,
                  "text-[0.6875rem] font-medium whitespace-nowrap",
                  textColor,
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mb-5 mx-1 relative overflow-hidden rounded-full bg-[#E5E7EB]">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#6EC93E] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: isBarFilled ? "100%" : "0%" }}
                  transition={{
                    duration: 0.55,
                    delay: animated ? 0 : i * 0.18 + 0.2,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemStepper({
  status,
  orderPending,
}: {
  status: ItemStatus;
  orderPending?: boolean;
}) {
  const currentIdx = ITEM_STATUS_STEPS.findIndex((s) => s.key === status);
  const activeColor = orderPending ? "#fbbf24" : "#6EC93E";

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center gap-0 w-full mt-3 pt-3 border-t border-[#F3F4F6]">
      {ITEM_STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isLast = i === ITEM_STATUS_STEPS.length - 1;
        const isBarFilled = i < currentIdx;
        return (
          <div
            key={step.key}
            className="flex items-start flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  borderColor: done ? activeColor : "#E5E7EB",
                  backgroundColor: done ? activeColor : "#ffffff",
                }}
                transition={{
                  duration: 0.3,
                  delay: animated ? 0 : i * 0.14,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {done && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: animated ? 0 : i * 0.14 + 0.08,
                      duration: 0.22,
                      ease: "backOut",
                    }}
                  >
                    <Icon
                      icon="solar:check-bold"
                      className="w-2.5 h-2.5 text-white"
                    />
                  </motion.span>
                )}
              </motion.div>
              <span
                className={cn(
                  satoshi.className,
                  "text-[0.5625rem] font-medium whitespace-nowrap hidden sm:block",
                  done
                    ? orderPending
                      ? "text-amber-400"
                      : "text-[#6EC93E]"
                    : "text-[#9CA3AF]",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mt-2.5 mx-0.5 relative overflow-hidden rounded-full bg-[#E5E7EB]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: activeColor }}
                  initial={{ width: "0%" }}
                  animate={{ width: isBarFilled ? "100%" : "0%" }}
                  transition={{
                    duration: 0.45,
                    delay: animated ? 0 : i * 0.14 + 0.15,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({
  item,
  orderPending,
}: {
  item: TrackOrderItem;
  orderPending?: boolean;
}) {
  const comboLabel = Object.entries(item.variantCombo)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  const isReturned = item.status === "returned";
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-colors",
        isReturned ? "border-red-100" : "border-[#F0F0F0]",
      )}
    >
      <div className="flex gap-4 items-start">
        <figure className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F8F8F8] shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/80x80/F8F8F8/9CA3AF?text=+";
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon
                icon="solar:image-bold-duotone"
                className="w-7 h-7 text-[#D0D0D0]"
              />
            </div>
          )}
        </figure>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p
              className={cn(
                poppins.className,
                "font-semibold text-[0.9375rem] text-black leading-snug",
              )}
            >
              {item.name}
            </p>
            <StatusChip status={item.status} />
          </div>
          {comboLabel && (
            <p
              className={cn(
                satoshi.className,
                "text-[0.8125rem] text-[#6B7280] mt-0.5",
              )}
            >
              {comboLabel} · Qty {item.quantity}
            </p>
          )}
          {!comboLabel && (
            <p
              className={cn(
                satoshi.className,
                "text-[0.8125rem] text-[#6B7280] mt-0.5",
              )}
            >
              Qty {item.quantity}
            </p>
          )}
          <p
            className={cn(
              satoshi.className,
              "font-bold text-[0.9375rem] text-black mt-1",
            )}
          >
            ₦{item.price.toLocaleString()}
          </p>
          {isReturned && item.refundAmount != null && (
            <p
              className={cn(
                satoshi.className,
                "text-[0.8125rem] text-red-500 mt-0.5 font-medium",
              )}
            >
              Refunded: ₦{item.refundAmount.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <ItemStepper status={item.status} orderPending={orderPending} />
    </div>
  );
}

// ── Results view ──────────────────────────────────────────────────────────────

function OrderResults({
  order,
  onBack,
  searchRef,
}: {
  order: TrackOrderResult;
  onBack: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { trackOrder } = useTrackOrderStore();

  // Supabase Realtime — re-fetch when order_items or orders rows change
  // Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env
  // and RLS SELECT policies on orders + order_items for the anon role.
  useEffect(() => {
    if (!order.internalId) return;

    let cancelled = false;
    let removeChannel: (() => void) | undefined;

    const setup = async () => {
      const { supabasePublic: client } = await import("@/lib/supabase-public");
      if (cancelled) return;

      const refetch = () => {
        trackOrder(order.id);
      };

      const channel = client
        .channel(`order-${order.internalId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "order_items",
            filter: `order_id=eq.${order.internalId}`,
          },
          refetch,
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${order.internalId}`,
          },
          refetch,
        )
        .subscribe();

      removeChannel = () => {
        client.removeChannel(channel);
      };
    };

    setup();

    return () => {
      cancelled = true;
      removeChannel?.();
    };
  }, [order.internalId, order.id, trackOrder]);

  const isTerminal =
    order.status === "refunded" || order.status === "cancelled";

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F2F4F7] to-white">
      <div className="sticky top-0 pt-19 sm:pt-22 lg:pt-23 z-4 bg-white/95 backdrop-blur border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-10 h-16 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] shrink-0"
          >
            <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  poppins.className,
                  "font-semibold text-[0.9375rem] text-black",
                )}
              >
                {order.id}
              </span>
              <StatusChip status={order.status} />
            </div>
          </div>
          <div className="hidden sm:flex items-center h-9 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full px-3 gap-2 w-44">
            <Icon
              icon="mynaui:search"
              className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0"
            />
            <input
              ref={searchRef}
              placeholder="Track another…"
              className={cn(
                satoshi.className,
                "bg-transparent outline-none text-[0.8125rem] text-black placeholder:text-[#9CA3AF] w-full",
              )}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-10 py-8 flex flex-col gap-6">
        <div
          className={cn(
            "bg-white rounded-2xl border p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-colors",
            isTerminal ? "border-red-100" : "border-[#F0F0F0]",
          )}
        >
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h2
                className={cn(
                  poppins.className,
                  "text-[1.125rem] font-semibold text-black",
                )}
              >
                Order Summary
              </h2>
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.8125rem] text-[#6B7280] mt-0.5",
                )}
              >
                {order.date} · {order.items} item{order.items !== 1 ? "s" : ""}{" "}
                · ₦{order.total.toLocaleString()}
              </p>
              {order.status === "refunded" &&
                order.orderRefundAmount != null && (
                  <p
                    className={cn(
                      satoshi.className,
                      "text-[0.8125rem] text-red-500 font-medium mt-1",
                    )}
                  >
                    Refunded: ₦{order.orderRefundAmount.toLocaleString()}
                  </p>
                )}
            </div>
            <div className="text-right">
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.75rem] text-[#9CA3AF] mb-1",
                )}
              >
                Customer
              </p>
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] font-medium text-black",
                )}
              >
                {order.customer}
              </p>
            </div>
          </div>
          <div>
            <p
              className={cn(
                satoshi.className,
                "text-[0.75rem] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3",
              )}
            >
              Overall Progress
            </p>
            <OrderStepper status={order.status} />
          </div>
        </div>

        <div>
          <p
            className={cn(
              poppins.className,
              "font-semibold text-[1rem] text-black mb-3",
            )}
          >
            Items in your order
          </p>
          <div className="flex flex-col gap-3">
            {order.products.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                orderPending={order.status === "pending_payment"}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#6EC93E]/8 border border-[#6EC93E]/20 rounded-2xl p-4">
          <Icon
            icon="solar:chat-round-bold-duotone"
            className="w-5 h-5 text-[#6EC93E] shrink-0"
          />
          <p
            className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}
          >
            Need help with your order?{" "}
            <Link
              href="/contact"
              className="font-semibold text-[#6EC93E] hover:underline"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Hero / search state ───────────────────────────────────────────────────────

function HeroState({
  onSearch,
  searching,
}: {
  onSearch: (id: string) => void;
  searching: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const trimmed = value.trim().toUpperCase();
    const result = orderIdSchema.safeParse(trimmed);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    onSearch(trimmed);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative bg-white flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden flex-1">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 rounded-full bg-[#6EC93E]/10 blur-[120px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#6EC93E 1px, transparent 1px), linear-gradient(90deg, #6EC93E 1px, transparent 1px)",
            backgroundSize: "3.5rem 3.5rem",
          }}
        />

        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-[#6EC93E]/10 border border-[#6EC93E]/20 flex items-center justify-center">
            <Icon
              icon="solar:box-bold-duotone"
              className="w-12 h-12 text-[#6EC93E]"
            />
          </div>
          {[
            {
              icon: "solar:delivery-bold-duotone",
              pos: "-top-3 -right-3",
              delay: "0s",
            },
            {
              icon: "solar:check-circle-bold-duotone",
              pos: "-bottom-3 -left-3",
              delay: "0.4s",
            },
            {
              icon: "solar:map-point-bold-duotone",
              pos: "-bottom-3 -right-6",
              delay: "0.8s",
            },
          ].map(({ icon, pos, delay }) => (
            <div
              key={icon}
              className={`absolute ${pos} w-9 h-9 rounded-xl bg-white border border-[#6EC93E]/25 shadow-sm flex items-center justify-center`}
              style={{
                animation: `float 3s ease-in-out ${delay} infinite alternate`,
              }}
            >
              <Icon icon={icon} className="w-4.5 h-4.5 text-[#6EC93E]" />
            </div>
          ))}
        </div>

        <h1
          className={cn(
            monumentExtended.className,
            "text-[#111827] text-[2rem] sm:text-[2.75rem] font-extrabold text-center leading-tight mb-3",
          )}
        >
          Track Your Order
        </h1>
        <p
          className={cn(
            satoshi.className,
            "text-[#6B7280] text-center text-[1rem] max-w-sm mb-10 leading-relaxed",
          )}
        >
          Enter your order ID below and get real-time updates on every item in
          your order.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg flex flex-col gap-2"
        >
          <div
            className={cn(
              "hidden sm:flex gap-0 bg-white border rounded-2xl overflow-hidden transition-colors shadow-sm",
              error
                ? "border-red-400"
                : "border-[#E5E7EB] focus-within:border-[#6EC93E]/60 focus-within:shadow-[0_0_0_3px_rgba(110,201,62,0.08)]",
            )}
          >
            <div className="flex items-center pl-4 shrink-0">
              <Icon icon="mynaui:search" className="w-5 h-5 text-[#9CA3AF]" />
            </div>
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder="e.g. ORD-123456789"
              className={cn(
                satoshi.className,
                "flex-1 bg-transparent px-3 py-4 text-[#111827] placeholder:text-[#9CA3AF] outline-none text-[0.9375rem]",
              )}
            />
            <button
              type="submit"
              disabled={searching}
              className={cn(
                poppins.className,
                "m-1.5 px-5 py-2.5 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem] rounded-xl transition-colors whitespace-nowrap disabled:opacity-60 flex items-center gap-2",
              )}
            >
              {searching ? (
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
              ) : null}
              Track Order
            </button>
          </div>

          <div
            className={cn(
              "flex sm:hidden items-center bg-white border rounded-2xl overflow-hidden transition-colors shadow-sm",
              error
                ? "border-red-400"
                : "border-[#E5E7EB] focus-within:border-[#6EC93E]/60",
            )}
          >
            <div className="flex items-center pl-4 shrink-0">
              <Icon
                icon="mynaui:search"
                className="w-4.5 h-4.5 text-[#9CA3AF]"
              />
            </div>
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder="e.g. ORD-123456789"
              className={cn(
                satoshi.className,
                "flex-1 bg-transparent px-3 py-3.5 text-[#111827] placeholder:text-[#9CA3AF] outline-none text-[0.875rem] min-w-0",
              )}
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className={cn(
              poppins.className,
              "sm:hidden w-full py-3.5 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem] rounded-2xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2",
            )}
          >
            {searching ? (
              <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
            ) : null}
            Track Order
          </button>

          {error && (
            <p
              className={cn(
                satoshi.className,
                "text-red-500 text-[0.8125rem] pl-1",
              )}
            >
              {error}
            </p>
          )}
        </form>
      </div>

      <div className="bg-white border-t border-[#F0F0F0] px-4 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "solar:refresh-circle-bold-duotone",
              title: "Always Fresh",
              desc: "Status reflects latest update every time you search",
            },
            {
              icon: "solar:box-minimalistic-bold-duotone",
              title: "Item-by-Item",
              desc: "See where each product is individually",
            },
            {
              icon: "solar:history-bold-duotone",
              title: "Full History",
              desc: "Track every order you've ever placed",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#6EC93E]/10 flex items-center justify-center shrink-0">
                <Icon icon={icon} className="w-5 h-5 text-[#6EC93E]" />
              </div>
              <div>
                <p
                  className={cn(
                    poppins.className,
                    "font-semibold text-[0.9375rem] text-black",
                  )}
                >
                  {title}
                </p>
                <p
                  className={cn(
                    satoshi.className,
                    "text-[0.8125rem] text-[#6B7280] mt-0.5 leading-relaxed",
                  )}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

const TrackOrder = () => {
  const { result, loading, error, trackOrder, clear } = useTrackOrderStore();
  const compactSearchRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = (ref: string) => {
    trackOrder(ref);
  };

  // Compact header search also triggers a track
  useEffect(() => {
    const el = compactSearchRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter")
        handleSearch((el.value ?? "").trim().toUpperCase());
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  });

  // Show error as a banner when in results view
  useEffect(() => {
    if (error && result) clear(); // clear stale result on new search error
  }, [error, result, clear]);

  if (result) {
    return (
      <div className="min-h-screen">
        <OrderResults
          order={result}
          onBack={clear}
          searchRef={compactSearchRef}
        />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-5 py-3 rounded-full text-[0.875rem] shadow-lg">
          {error}
        </div>
      )}
      <HeroState onSearch={handleSearch} searching={loading} />
      <style jsx global>{`
        @keyframes float {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </>
  );
};

export default TrackOrder;
