/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { Input } from "@/components";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { Radio } from "@/components";
import { BILLING_FIELDS, SUMMARY_ITEMS, PAYMENT_METHODS, checkoutSchema, type CheckoutFormData } from "@/data";

const SUBTOTAL = SUMMARY_ITEMS.reduce((s, i) => s + i.price, 0);
const SHIPPING_FREE = true;
const TOTAL = SUBTOTAL;

const Checkout = () => {
  const [payment, setPayment] = useState("flutterwave");
  const [promo, setPromo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  const onSubmit = (data: CheckoutFormData) => {
    console.log("Placing order:", { ...data, payment });
  };

  const getError = (name: keyof CheckoutFormData) =>
    errors[name]?.message as string | undefined;

  return (
    <section
      className={cn(
        satoshi.className,
        "pt-32 md:pt-40 pb-20 px-4 lg:px-7.5 max-w-375 mx-auto",
      )}
    >
      <h1
        className={cn(
          poppins.className,
          "text-[1.75rem] md:text-[2.25rem] font-semibold text-black mb-8 md:mb-12",
        )}
      >
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* ── Billing form ──────────────────────────────────────────────── */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col gap-5">
              {BILLING_FIELDS.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  error={getError(field.name)}
                  className={
                    getError(field.name) ? undefined : "border-[#D0D5DD]"
                  }
                  {...register(field.name)}
                />
              ))}
            </div>
          </div>

          {/* ── Right sidebar ──────────────────────────────────────────────── */}
          <div className="w-full lg:w-88 xl:w-104 shrink-0 lg:sticky lg:top-40 flex flex-col gap-0">
            {/* Items card */}
            <div className="border border-[#0000001A] rounded-[1.25rem] overflow-hidden mb-5">
              {SUMMARY_ITEMS.map((item, i) => (
                <div key={i}>
                  <div className="flex gap-4 p-4 sm:p-5 items-center">
                    <figure className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F8F8F8]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </figure>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          poppins.className,
                          "font-semibold text-[.9375rem] text-black leading-snug",
                        )}
                      >
                        {item.name}
                      </p>
                      <p className="text-[.8125rem] text-[#00000099] mt-0.5">
                        Size: {item.size}
                      </p>
                      <p className="text-[.8125rem] text-[#00000099]">
                        Color: {item.color}
                      </p>
                      <p
                        className={cn(
                          "font-bold text-[1rem] text-black mt-1.5",
                        )}
                      >
                        ${item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {i < SUMMARY_ITEMS.length - 1 && (
                    <hr className="border-none h-px bg-[#0000001A] mx-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Summary rows */}
            <div className="flex flex-col gap-4 mb-1">
              <div className="flex justify-between items-center text-[.9375rem]">
                <span className="text-[#00000099]">Subtotal:</span>
                <span className="font-semibold text-black">
                  ${SUBTOTAL.toLocaleString()}
                </span>
              </div>
              <hr className="border-none h-px bg-[#0000001A]" />
              <div className="flex justify-between items-center text-[.9375rem]">
                <span className="text-[#00000099]">Shipping:</span>
                <span className="font-semibold text-black">
                  {SHIPPING_FREE ? "Free" : `$${15}`}
                </span>
              </div>
              <hr className="border-none h-px bg-[#0000001A]" />
              <div className="flex justify-between items-center">
                <span className="text-[.9375rem] text-[#00000099]">Total:</span>
                <span className={cn("font-bold text-[1.125rem] text-black")}>
                  ${TOTAL.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="flex flex-col gap-3 mt-6 mb-5">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPayment(method.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Radio
                    name="payment"
                    value={payment === method.id}
                    onChange={() => setPayment(method.id)}
                    state={payment === method.id ? "correct" : undefined}
                  />
                  <span className="text-[.9375rem] text-black font-medium">
                    {method.label}
                  </span>
                  <div className="ml-auto w-16 h-8 rounded-md bg-[#F0F0F0] flex items-center justify-center border border-[#0000000D]">
                    <span className="text-[.5rem] font-bold text-[#00000040] uppercase tracking-widest">
                      logo
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon + Place Order */}
            <div className="flex gap-2.5 mb-4">
              <div className="flex-1 min-w-0 flex items-center h-12 border border-[#0000001A] rounded-[3.875rem] px-4 gap-2">
                <Icon
                  icon="mdi:tag-outline"
                  className="w-4 h-4 text-[#00000040] shrink-0"
                />
                <input
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Coupon Code"
                  className="flex-1 min-w-0 border-none! bg-transparent text-[.875rem] outline-none text-black placeholder:text-[#00000040]"
                />
              </div>
              <button
                type="button"
                className="h-12 px-4 bg-[#6EC93E] text-white text-[.875rem] font-medium rounded-[3.875rem] hover:bg-[#5cb535] transition-colors shrink-0"
              >
                Apply Coupon
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#6EC93E] text-white font-semibold text-[1rem] rounded-[3.875rem] hover:bg-[#5cb535] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;
