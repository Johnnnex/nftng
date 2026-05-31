/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { StatusChip } from "@/components";
import { poppins, satoshi, monumentExtended } from "@/app/layout";
import {
  MOCK_ORDERS,
  ORDER_STATUS_STEPS,
  ITEM_STATUS_STEPS,
  orderIdSchema,
  type TrackOrderResult,
  type TrackOrderItem,
} from "@/data";
import type { ItemStatus, OrderStatus } from "@/components";

// ── Stepper ──────────────────────────────────────────────────────────────────

function OrderStepper({ status }: { status: OrderStatus }) {
  const currentIdx = ORDER_STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0 w-full">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isLast = i === ORDER_STATUS_STEPS.length - 1;
        return (
          <div
            key={step.key}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors",
                  done
                    ? "border-[#6EC93E] bg-[#6EC93E]"
                    : "border-[#E5E7EB] bg-white",
                )}
              >
                {done ? (
                  <Icon
                    icon="solar:check-bold"
                    className="w-3.5 h-3.5 text-white"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
                )}
              </div>
              <span
                className={cn(
                  satoshi.className,
                  "text-[0.6875rem] font-medium whitespace-nowrap",
                  done ? "text-[#6EC93E]" : "text-[#9CA3AF]",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mb-5 mx-1 transition-colors",
                  i < currentIdx ? "bg-[#6EC93E]" : "bg-[#E5E7EB]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemStepper({ status }: { status: ItemStatus }) {
  const currentIdx = ITEM_STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0 w-full mt-3 pt-3 border-t border-[#F3F4F6]">
      {ITEM_STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isLast = i === ITEM_STATUS_STEPS.length - 1;
        return (
          <div
            key={step.key}
            className="flex items-start flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                  done
                    ? "border-[#6EC93E] bg-[#6EC93E]"
                    : "border-[#E5E7EB] bg-white",
                )}
              >
                {done && (
                  <Icon
                    icon="solar:check-bold"
                    className="w-2.5 h-2.5 text-white"
                  />
                )}
              </div>
              <span
                className={cn(
                  satoshi.className,
                  "text-[0.5625rem] font-medium whitespace-nowrap hidden sm:block",
                  done ? "text-[#6EC93E]" : "text-[#9CA3AF]",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mt-2.5 mx-0.5 transition-colors",
                  i < currentIdx ? "bg-[#6EC93E]" : "bg-[#E5E7EB]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ item }: { item: TrackOrderItem }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex gap-4 items-start">
        <figure className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F8F8F8] shrink-0">
          <img
            src={item.image}
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/80x80/F8F8F8/9CA3AF?text=+";
            }}
            className="w-full h-full object-cover"
          />
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
          <p
            className={cn(
              satoshi.className,
              "text-[0.8125rem] text-[#6B7280] mt-0.5",
            )}
          >
            {item.size} · {item.color} · Qty {item.quantity}
          </p>
          <p
            className={cn(
              satoshi.className,
              "font-bold text-[0.9375rem] text-black mt-1",
            )}
          >
            ${item.price.toLocaleString()}
          </p>
        </div>
      </div>
      <ItemStepper status={item.status} />
    </div>
  );
}

// ── Results view ─────────────────────────────────────────────────────────────

function OrderResults({
  order,
  onBack,
  searchRef,
}: {
  order: TrackOrderResult;
  onBack: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="bg-[#F9FAFB]">
      {/* Compact sub-header — sticks below the fixed main site nav */}
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
          {/* Mini search */}
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

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-10 py-8 flex flex-col gap-6">
        {/* Order summary card */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
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
                · ${order.total.toLocaleString()}
              </p>
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

        {/* Items */}
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
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Help nudge */}
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

// ── Empty / hero state ───────────────────────────────────────────────────────

function HeroState({ onSearch }: { onSearch: (id: string) => void }) {
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
      {/* Light hero */}
      <div className="relative bg-white flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden flex-1">
        {/* Subtle green glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 rounded-full bg-[#6EC93E]/10 blur-[120px] pointer-events-none" />
        {/* Checker grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#6EC93E 1px, transparent 1px), linear-gradient(90deg, #6EC93E 1px, transparent 1px)",
            backgroundSize: "3.5rem 3.5rem",
          }}
        />

        {/* Illustration */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-[#6EC93E]/10 border border-[#6EC93E]/20 flex items-center justify-center">
            <Icon
              icon="solar:box-bold-duotone"
              className="w-12 h-12 text-[#6EC93E]"
            />
          </div>
          {/* Orbit bubbles */}
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

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg flex flex-col gap-2"
        >
          {/* On mobile: stacked. On sm+: single pill row */}
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
              placeholder="e.g. ORD-2609"
              className={cn(
                satoshi.className,
                "flex-1 bg-transparent px-3 py-4 text-[#111827] placeholder:text-[#9CA3AF] outline-none text-[0.9375rem]",
              )}
            />
            <button
              type="submit"
              className={cn(
                poppins.className,
                "m-1.5 px-5 py-2.5 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem] rounded-xl transition-colors whitespace-nowrap",
              )}
            >
              Track Order
            </button>
          </div>

          {/* Mobile layout */}
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
              placeholder="e.g. ORD-2609"
              className={cn(
                satoshi.className,
                "flex-1 bg-transparent px-3 py-3.5 text-[#111827] placeholder:text-[#9CA3AF] outline-none text-[0.875rem] min-w-0",
              )}
            />
          </div>
          <button
            type="submit"
            className={cn(
              poppins.className,
              "sm:hidden w-full py-3.5 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem] rounded-2xl transition-colors",
            )}
          >
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

      {/* Feature strips */}
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

// ── Root ─────────────────────────────────────────────────────────────────────

const TrackOrder = () => {
  const [orderResult, setOrderResult] = useState<TrackOrderResult | null>(null);
  const compactSearchRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = (id: string) => {
    const found = MOCK_ORDERS[id];
    if (found) {
      setOrderResult(found);
    } else {
      toast.error("No order found with that ID. Try again.");
    }
  };

  // Wire compact header search to the same handler
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

  if (orderResult) {
    return (
      <div className="min-h-screen">
        <OrderResults
          order={orderResult}
          onBack={() => setOrderResult(null)}
          searchRef={compactSearchRef}
        />
      </div>
    );
  }

  return (
    <>
      <HeroState onSearch={handleSearch} />
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
