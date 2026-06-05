/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useCartStore } from "@/store";

const Cart = () => {
  const router = useRouter();
  const { items, removeItem, updateQty } = useCartStore();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleRemove = useCallback(
    (productId: string, variantCombo: Record<string, string>) =>
      removeItem(productId, variantCombo),
    [removeItem],
  );

  const handleQty = useCallback(
    (
      productId: string,
      variantCombo: Record<string, string>,
      delta: number,
      current: number,
    ) => {
      updateQty(productId, variantCombo, current + delta);
    },
    [updateQty],
  );

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
          {/* Items */}
          <div className="flex-1 w-full min-w-0 border border-[#0000001A] rounded-[1.25rem] overflow-hidden">
            {items.map((item, index) => {
              const comboLabel = Object.entries(item.variantCombo)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ");
              return (
                <div
                  key={`${item.productId}:${JSON.stringify(item.variantCombo)}`}
                >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-5 p-4 md:p-5 items-start">
                    <figure className="w-full md:w-36 md:h-36 lg:w-40 lg:h-40 aspect-square md:aspect-auto rounded-[.875rem] overflow-hidden md:shrink-0 bg-[#F8F8F8]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            icon="solar:image-bold-duotone"
                            className="w-8 h-8 text-[#D0D0D0]"
                          />
                        </div>
                      )}
                    </figure>
                    <div className="flex-1 w-full min-w-0 flex flex-col md:h-36 lg:h-40">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            poppins.className,
                            "font-semibold text-[.9375rem] sm:text-[1rem] text-black leading-snug",
                          )}
                        >
                          {item.title}
                        </h3>
                        <button
                          onClick={() =>
                            handleRemove(item.productId, item.variantCombo)
                          }
                          className="shrink-0 text-[#DB4444] hover:opacity-70 transition-opacity"
                          aria-label="Remove item"
                        >
                          <Icon icon="mdi:trash-can" className="w-5 h-5" />
                        </button>
                      </div>
                      {comboLabel && (
                        <p className="text-[.8125rem] sm:text-[.875rem] text-[#00000099] mt-1">
                          {comboLabel}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold text-[1.125rem] sm:text-[1.25rem] text-black">
                          ₦{(item.price * item.qty).toLocaleString()}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          {item.qty >= item.maxQty && (
                            <span className="text-[.6875rem] text-amber-600 font-medium">
                              Max stock reached
                            </span>
                          )}
                          <div className="flex items-center rounded-[3.875rem] bg-[#F0F0F0] px-3.5 py-2 gap-4">
                            <button
                              onClick={() =>
                                handleQty(
                                  item.productId,
                                  item.variantCombo,
                                  -1,
                                  item.qty,
                                )
                              }
                              disabled={item.qty <= 1}
                              className={cn(
                                "text-black flex items-center justify-center transition-opacity",
                                item.qty <= 1 &&
                                  "opacity-30 cursor-not-allowed",
                              )}
                            >
                              <Icon icon="mdi:minus" className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-medium text-black text-[.875rem] min-w-4 text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                handleQty(
                                  item.productId,
                                  item.variantCombo,
                                  1,
                                  item.qty,
                                )
                              }
                              disabled={item.qty >= item.maxQty}
                              className={cn(
                                "text-black flex items-center justify-center transition-opacity",
                                item.qty >= item.maxQty &&
                                  "opacity-30 cursor-not-allowed",
                              )}
                            >
                              <Icon icon="mdi:plus" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < items.length - 1 && (
                    <hr className="border-none h-px bg-[#0000001A] mx-4 sm:mx-5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-88 xl:w-96 shrink-0 lg:sticky lg:top-40">
            <div className="border border-[#0000001A] rounded-[1.25rem] p-6 sm:p-7">
              <h2 className={cn("text-[1.25rem] font-bold text-black mb-6")}>
                Order Summary
              </h2>

              <div className="flex flex-col gap-4 mb-5">
                <div className="flex justify-between items-center text-[.9375rem]">
                  <span className="text-[#00000099]">Subtotal</span>
                  <span className="font-semibold text-black">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[.9375rem]">
                  <span className="text-[#00000099]">Delivery Fee</span>
                  <span className="font-semibold text-[#00000066] italic">
                    ₦XXX
                  </span>
                </div>
              </div>

              <hr className="border-none h-px bg-[#0000001A] mb-5" />

              <div className="flex justify-between items-center mb-2">
                <span className="text-[1rem] font-semibold text-black">
                  Total
                </span>
                <span className="text-[1.25rem] font-bold text-black">
                  ₦{subtotal.toLocaleString()} + delivery
                </span>
              </div>
              <p className="text-[.75rem] text-[#00000066] mb-6">
                Delivery fee calculated at checkout based on your location.
              </p>

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
