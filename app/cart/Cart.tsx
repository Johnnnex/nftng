/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { MOCK_CART_ITEMS, type CartItem, DISCOUNT_PCT, DELIVERY_FEE } from "@/data";

const Cart = () => {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(MOCK_CART_ITEMS);
  const [promo, setPromo] = useState("");

  const updateQty = useCallback((id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = Math.round(subtotal * (DISCOUNT_PCT / 100));
  const total = subtotal - discount + (items.length > 0 ? DELIVERY_FEE : 0);

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
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center">
            <Icon
              icon="mdi:cart-outline"
              className="w-8 h-8 text-[#00000040]"
            />
          </div>
          <p className="text-[1.125rem] font-medium text-black">
            Your cart is empty
          </p>
          <p className="text-[.9375rem] text-[#00000066]">
            Looks like you haven&apos;t added anything yet.
          </p>
          <button
            onClick={() => router.push("/collections")}
            className="mt-2 py-3.5 px-8 bg-[#6EC93E] text-white font-medium rounded-[3.875rem] hover:bg-[#5cb535] transition-colors"
          >
            Browse Collections
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* ── Items card ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 border border-[#0000001A] rounded-[1.25rem] overflow-hidden">
            {items.map((item, index) => (
              <div key={item.id}>
                <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 items-start">
                  {/* Product image */}
                  <figure className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-[.875rem] overflow-hidden shrink-0 bg-[#F8F8F8]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </figure>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col h-28 sm:h-36 lg:h-40">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={cn(
                          poppins.className,
                          "font-semibold text-[.9375rem] sm:text-[1rem] lg:text-[1.0625rem] text-black leading-snug",
                        )}
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 text-[#DB4444] hover:opacity-70 transition-opacity"
                        aria-label="Remove item"
                      >
                        <Icon icon="mdi:trash-can" className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-[.8125rem] sm:text-[.875rem] text-[#00000099] mt-1.5">
                      Size:{" "}
                      <span className="text-[#00000099]">{item.size}</span>
                    </p>
                    <p className="text-[.8125rem] sm:text-[.875rem] text-[#00000099]">
                      Color:{" "}
                      <span className="text-[#00000099]">{item.color}</span>
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <span
                        className={cn(
                          "font-bold text-[1.125rem] sm:text-[1.25rem] text-black",
                        )}
                      >
                        ${(item.price * item.qty).toLocaleString()}
                      </span>

                      <div className="flex items-center rounded-[3.875rem] bg-[#F0F0F0] px-3.5 py-2 gap-4">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="text-black flex items-center justify-center"
                        >
                          <Icon icon="mdi:minus" className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-medium text-black text-[.875rem] min-w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="text-black flex items-center justify-center"
                        >
                          <Icon icon="mdi:plus" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {index < items.length - 1 && (
                  <hr className="border-none h-px bg-[#0000001A] mx-4 sm:mx-5" />
                )}
              </div>
            ))}
          </div>

          {/* ── Order summary ───────────────────────────────────────────────── */}
          <div className="w-full lg:w-88 xl:w-96 shrink-0 lg:sticky lg:top-40">
            <div className="border border-[#0000001A] rounded-[1.25rem] p-6 sm:p-7">
              <h2 className={cn("text-[1.25rem] font-bold text-black mb-6")}>
                Order Summary
              </h2>

              <div className="flex flex-col gap-4 mb-5">
                <div className="flex justify-between items-center text-[.9375rem]">
                  <span className="text-[#00000099]">Subtotal</span>
                  <span className="font-semibold text-black">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[.9375rem]">
                  <span className="text-[#00000099]">
                    Discount (-{DISCOUNT_PCT}%)
                  </span>
                  <span className="font-semibold text-[#DB4444]">
                    -${discount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[.9375rem]">
                  <span className="text-[#00000099]">Delivery Fee</span>
                  <span className="font-semibold text-black">
                    ${DELIVERY_FEE}
                  </span>
                </div>
              </div>

              <hr className="border-none h-px bg-[#0000001A] mb-5" />

              <div className="flex justify-between items-center mb-6">
                <span className={cn("text-[1rem] font-semibold text-black")}>
                  Total
                </span>
                <span className={cn("text-[1.25rem] font-bold text-black")}>
                  ${total.toLocaleString()}
                </span>
              </div>

              {/* Promo code */}
              <div className="flex gap-2.5 mb-5">
                <div className="flex-1 min-w-0 flex items-center h-12 bg-[#F0F0F0] rounded-[3.875rem] px-4 gap-2">
                  <Icon
                    icon="mdi:tag-outline"
                    className="w-4 h-4 text-[#00000040] shrink-0"
                  />
                  <input
                    type="text"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Add promo code"
                    className="flex-1 border-none! min-w-0 bg-transparent text-[.875rem] outline-none text-black placeholder:text-[#00000040]"
                  />
                </div>
                <button className="h-12 px-5 bg-[#6EC93E] text-white text-[.875rem] font-medium rounded-[3.875rem] hover:bg-[#5cb535] transition-colors shrink-0">
                  Apply
                </button>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 bg-[#6EC93E] text-white font-medium text-[1rem] rounded-[3.875rem] hover:bg-[#5cb535] transition-colors flex items-center justify-center gap-2"
              >
                Go to Checkout
                <Icon icon="hugeicons:arrow-right-02" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
