/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Input, Radio } from "@/components";
import { cn } from "@/lib";
import { api } from "@/lib/api";
import { poppins, satoshi } from "@/app/layout";
import { checkoutSchema, PAYMENT_METHODS } from "@/data";
import { useCartStore, useCheckoutStore } from "@/store";
import type { CheckoutFormData, AppliedPromo } from "@/data";

// ─── Promo input — owns its own input state, applied state lives in cart store ─

function PromoInput({
  appliedPromo,
  onApply,
  onRemove,
}: {
  appliedPromo: AppliedPromo | null;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
}) {
  const [input, setInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    setError("");
    try {
      await onApply(code);
      setInput("");
    } catch {
      setError("Invalid or inactive promo code");
    } finally {
      setApplying(false);
    }
  };

  if (appliedPromo) {
    return (
      <div className="mb-4 flex items-center justify-between h-12 px-4 bg-[#6EC93E]/10 border border-[#6EC93E]/30 rounded-[3.875rem]">
        <div className="flex items-center gap-2">
          <Icon
            icon="mdi:tag-check"
            className="w-4 h-4 text-[#6EC93E] shrink-0"
          />
          <span className="text-[.875rem] font-medium text-[#3a7a1e]">
            {appliedPromo.code} applied
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[#9CA3AF] hover:text-red-500 text-[.75rem] transition-colors"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0 flex items-center h-12 border border-[#0000001A] rounded-[3.875rem] px-4 gap-2">
          <Icon
            icon="mdi:tag-outline"
            className="w-4 h-4 text-[#00000040] shrink-0"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleApply())
            }
            placeholder="Promo Code"
            className="flex-1 min-w-0 border-none! bg-transparent text-[.875rem] outline-none text-black placeholder:text-[#00000040] uppercase"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={applying || !input.trim()}
          className="h-12 px-4 bg-[#6EC93E] text-white text-[.875rem] font-medium rounded-[3.875rem] hover:bg-[#5cb535] transition-colors shrink-0 disabled:opacity-50"
        >
          {applying ? (
            <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-[.8125rem] pl-4">{error}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Checkout = () => {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  // Promo is session-only local state — cleared automatically when user leaves checkout
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const {
    countries,
    states,
    cities,
    deliveryConfigs,
    loadingStates,
    loadingCities,
    loadingConfigs,
    fetchCountries,
    fetchStates,
    fetchCities,
    fetchDeliveryConfigs,
    resetGeo,
    applyPromo,
  } = useCheckoutStore();

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { countryCode: "", countryId: "", stateId: "", cityId: "" },
  });

  const countryId = useWatch({ control, name: "countryId" });
  const countryCode = useWatch({ control, name: "countryCode" });
  const stateId = useWatch({ control, name: "stateId" });
  const cityId = useWatch({ control, name: "cityId" });
  const deliveryMethod = useWatch({ control, name: "deliveryMethod" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const isNigeria = countryCode === "NG";

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    if (!countryId || !isNigeria) return;
    fetchStates(countryId);
    setValue("stateId", "");
    setValue("cityId", "");
    setValue("deliveryMethod", undefined);
  }, [countryId, isNigeria, fetchStates, setValue]);

  useEffect(() => {
    if (!stateId) return;
    fetchCities(stateId);
    setValue("cityId", "");
    setValue("deliveryMethod", undefined);
  }, [stateId, fetchCities, setValue]);

  useEffect(() => {
    if (!cityId) return;
    fetchDeliveryConfigs(cityId);
    setValue("deliveryMethod", undefined);
  }, [cityId, fetchDeliveryConfigs, setValue]);

  const handleCountryChange = useCallback(
    (id: string) => {
      const country = countries.find((c) => c.id === id);
      setValue("countryId", id);
      setValue("countryCode", country?.code ?? "");
      setValue("stateId", "");
      setValue("cityId", "");
      setValue("deliveryMethod", undefined);
      resetGeo();
    },
    [countries, setValue, resetGeo],
  );

  const handleApplyPromo = useCallback(
    async (code: string) => {
      const promo = await applyPromo(code, subtotal);
      setAppliedPromo(promo);
    },
    [applyPromo, subtotal],
  );

  const selectedConfig = deliveryConfigs.find(
    (c) => c.method === deliveryMethod,
  );
  const deliveryFee = selectedConfig?.price ?? null;
  const discount = appliedPromo?.discountAmount ?? 0;
  const total = deliveryFee != null ? subtotal - discount + deliveryFee : null;

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;
    try {
      if (!isNigeria) {
        // International order — no payment, save to outside_nigeria_orders
        const res = await api.post<{ data: { previewToken: string } }>("/api/outside-orders", {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          streetAddress: data.streetAddress,
          countryId: data.countryId,
          items: items.map((i) => ({
            productId: i.productId,
            productTitle: i.title,
            variantCombo: i.variantCombo,
            qty: i.qty,
            unitPrice: i.price,
            productImage: i.image,
          })),
        });
        clearCart();
        router.push(`/preview-order/${res.data.data.previewToken}`);
        return;
      }

      // Nigerian order — payment gateway
      const res = await api.post<{
        data: { orderRef: string; paymentUrl: string };
      }>("/api/orders", {
        ...data,
        promoCode: appliedPromo?.code ?? undefined,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          image: i.image,
          variantCombo: i.variantCombo,
          price: i.price,
          qty: i.qty,
        })),
      });
      clearCart();
      window.location.assign(res.data.data.paymentUrl);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response
        ?.data?.error;
      toast.error(msg ?? "Something went wrong — please try again");
    }
  };

  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.code})`,
  }));
  const stateOptions = states.map((s) => ({ value: s.id, label: s.name }));
  const cityOptions = cities.map((c) => ({ value: c.id, label: c.name }));
  const methodOptions = deliveryConfigs.map((c) => ({
    value: c.method,
    label: `${c.method.charAt(0).toUpperCase() + c.method.slice(1)} delivery — ₦${c.price.toLocaleString()}${c.estimatedDays ? ` (${c.estimatedDays})` : ""}`,
  }));

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
          {/* ── Billing form ─────────────────────────────────── */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-5">
            <Input
              label="Full Name *"
              type="text"
              placeholder="e.g. Johnex Doe"
              error={errors.fullName?.message}
              className={errors.fullName ? undefined : "border-[#D0D5DD]"}
              {...register("fullName")}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              className={errors.email ? undefined : "border-[#D0D5DD]"}
              {...register("email")}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  type="tel"
                  label="Phone Number *"
                  name="phone"
                  value={field.value ?? ""}
                  onChange={(e: { target: { name?: string; value: string } }) =>
                    field.onChange(e.target.value as string)
                  }
                  onBlur={field.onBlur}
                  placeholder="801 234 5678"
                  defaultCountry="ng"
                  error={errors.phone?.message}
                  className={errors.phone ? undefined : "border-[#D0D5DD]"}
                />
              )}
            />
            <Input
              label="Street Address *"
              type="text"
              placeholder="e.g. 12 Admiralty Way"
              error={errors.streetAddress?.message}
              className={errors.streetAddress ? undefined : "border-[#D0D5DD]"}
              {...register("streetAddress")}
            />

            <div>
              <label
                className={cn(
                  satoshi.className,
                  "block text-[0.875rem] font-medium text-black mb-1.5",
                )}
              >
                Country *
              </label>
              <Controller
                name="countryId"
                control={control}
                render={({ field }) => (
                  <Input
                    type="select"
                    value={field.value}
                    placeholder="Select country"
                    selectOptions={countryOptions}
                    onChange={(e: { target: { name?: string; value: string | string[] } }) =>
                      handleCountryChange(e.target.value as string)
                    }
                    error={errors.countryId?.message}
                    className={
                      errors.countryId ? undefined : "border-[#D0D5DD]"
                    }
                  />
                )}
              />
            </div>

            {isNigeria && (
              <>
                <div>
                  <label
                    className={cn(
                      satoshi.className,
                      "block text-[0.875rem] font-medium text-black mb-1.5",
                    )}
                  >
                    State *
                  </label>
                  <Controller
                    name="stateId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="select"
                        value={field.value ?? ""}
                        placeholder={
                          loadingStates ? "Loading states…" : "Select state"
                        }
                        selectOptions={stateOptions}
                        disabled={!countryId || loadingStates}
                        onChange={(e: { target: { name?: string; value: string | string[] } }) =>
                          field.onChange(e.target.value as string)
                        }
                        error={
                          (errors as { stateId?: { message?: string } }).stateId
                            ?.message
                        }
                        className={
                          (errors as { stateId?: { message?: string } }).stateId
                            ? undefined
                            : "border-[#D0D5DD]"
                        }
                      />
                    )}
                  />
                </div>

                <div>
                  <label
                    className={cn(
                      satoshi.className,
                      "block text-[0.875rem] font-medium text-black mb-1.5",
                    )}
                  >
                    City / Town *
                  </label>
                  <Controller
                    name="cityId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="select"
                        value={field.value ?? ""}
                        placeholder={
                          loadingCities ? "Loading cities…" : "Select city"
                        }
                        selectOptions={cityOptions}
                        disabled={!stateId || loadingCities}
                        onChange={(e: { target: { name?: string; value: string | string[] } }) =>
                          field.onChange(e.target.value as string)
                        }
                        error={
                          (errors as { cityId?: { message?: string } }).cityId
                            ?.message
                        }
                        className={
                          (errors as { cityId?: { message?: string } }).cityId
                            ? undefined
                            : "border-[#D0D5DD]"
                        }
                      />
                    )}
                  />
                </div>

                {cityId && (
                  <div>
                    <label
                      className={cn(
                        satoshi.className,
                        "block text-[0.875rem] font-medium text-black mb-1.5",
                      )}
                    >
                      Delivery Method *
                    </label>
                    <Controller
                      name="deliveryMethod"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="select"
                          value={field.value ?? ""}
                          placeholder={
                            loadingConfigs
                              ? "Loading delivery options…"
                              : methodOptions.length === 0
                                ? "No options for this city yet"
                                : "Select delivery method"
                          }
                          selectOptions={methodOptions}
                          disabled={
                            loadingConfigs || methodOptions.length === 0
                          }
                          onChange={(e: { target: { name?: string; value: string | string[] } }) =>
                            field.onChange(e.target.value as string)
                          }
                          error={
                            (
                              errors as {
                                deliveryMethod?: { message?: string };
                              }
                            ).deliveryMethod?.message
                          }
                          className={
                            (
                              errors as {
                                deliveryMethod?: { message?: string };
                              }
                            ).deliveryMethod
                              ? undefined
                              : "border-[#D0D5DD]"
                          }
                        />
                      )}
                    />
                  </div>
                )}

                {cityId && (
                  <div className="rounded-2xl bg-[#6EC93E]/8 border border-[#6EC93E]/20 p-5">
                    <div className="flex gap-3">
                      <Icon
                        icon="solar:info-circle-bold-duotone"
                        className="w-5 h-5 text-[#6EC93E] shrink-0 mt-0.5"
                      />
                      <p className="text-[.9375rem] text-[#00000099] leading-relaxed">
                        This is a{" "}
                        <strong className="text-black font-semibold">
                          preorder
                        </strong>{" "}
                        &mdash; deliveries start on{" "}
                        <strong className="text-black font-semibold">
                          July 1st, 2026
                        </strong>
                        . We&rsquo;ll notify you once your order ships.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {countryId && !isNigeria && (
              <div className="rounded-2xl bg-[#6EC93E]/8 border border-[#6EC93E]/20 p-5">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:info-circle-bold-duotone"
                    className="w-5 h-5 text-[#6EC93E] shrink-0 mt-0.5"
                  />
                  <p className="text-[.9375rem] text-[#00000099] leading-relaxed">
                    We&rsquo;ll reach out to you by email with delivery details
                    and pricing. Click below to submit your order — no payment
                    required yet.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────────────── */}
          <div className="w-full lg:w-88 xl:w-104 shrink-0 lg:sticky lg:top-40 flex flex-col gap-0">
            {/* Items */}
            <div className="border border-[#0000001A] rounded-[1.25rem] overflow-hidden mb-5">
              {items.map((item, i) => {
                const comboLabel = Object.entries(item.variantCombo)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ");
                return (
                  <div
                    key={`${item.productId}:${JSON.stringify(item.variantCombo)}`}
                  >
                    <div className="flex gap-4 p-4 sm:p-5 items-center">
                      <figure className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F8F8F8]">
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
                              className="w-6 h-6 text-[#D0D0D0]"
                            />
                          </div>
                        )}
                      </figure>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            poppins.className,
                            "font-semibold text-[.9375rem] text-black leading-snug",
                          )}
                        >
                          {item.title}
                        </p>
                        {comboLabel && (
                          <p className="text-[.8125rem] text-[#00000099] mt-0.5">
                            {comboLabel}
                          </p>
                        )}
                        <p className="text-[.8125rem] text-[#00000099]">
                          Qty: {item.qty}
                        </p>
                        <p className="font-bold text-[1rem] text-black mt-1">
                          ₦{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {i < items.length - 1 && (
                      <hr className="border-none h-px bg-[#0000001A] mx-4" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between items-center text-[.9375rem]">
                <span className="text-[#00000099]">Subtotal:</span>
                <span className="font-semibold text-black">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
              <hr className="border-none h-px bg-[#0000001A]" />
              <div className="flex justify-between items-center text-[.9375rem]">
                <span className="text-[#00000099]">Delivery:</span>
                <span className="font-semibold text-black">
                  {deliveryFee != null ? (
                    `₦${deliveryFee.toLocaleString()}`
                  ) : (
                    <span className="italic text-[#00000066]">₦XXX</span>
                  )}
                </span>
              </div>
              {appliedPromo && (
                <>
                  <hr className="border-none h-px bg-[#0000001A]" />
                  <div className="flex justify-between items-center text-[.9375rem]">
                    <span className="text-[#00000099]">
                      {appliedPromo.discountType === "percent"
                        ? `Discount (${appliedPromo.discountValue}%)`
                        : `Discount (-₦${appliedPromo.discountValue.toLocaleString()})`}
                    </span>
                    <span className="font-semibold text-[#DB4444]">
                      -₦{appliedPromo.discountAmount.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              <hr className="border-none h-px bg-[#0000001A]" />
              <div className="flex justify-between items-center">
                <span className="text-[.9375rem] text-[#00000099]">Total:</span>
                <span className="font-bold text-[1.125rem] text-black">
                  {total != null
                    ? `₦${total.toLocaleString()}`
                    : `₦${(subtotal - discount).toLocaleString()} + delivery`}
                </span>
              </div>
            </div>

            {/* Payment method */}
            {isNigeria && (
              <div className="flex flex-col gap-3 mb-5">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    onClick={() =>
                      setValue(
                        "paymentMethod",
                        method.id as "paystack" | "flutterwave",
                      )
                    }
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Radio
                      name="payment"
                      value={paymentMethod === method.id}
                      onChange={() =>
                        setValue(
                          "paymentMethod",
                          method.id as "paystack" | "flutterwave",
                        )
                      }
                      state={
                        paymentMethod === method.id ? "correct" : undefined
                      }
                    />
                    <span className="text-[.9375rem] text-black font-medium">
                      {method.label}
                    </span>
                    {method.id === "paystack" && (
                      <div className="ml-auto h-7 flex items-center justify-center px-2">
                        <img
                          src="/svg/paystack-logo.svg"
                          alt="Paystack"
                          className="h-5 object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))}
                {(errors as { paymentMethod?: { message?: string } })
                  .paymentMethod && (
                  <p className="text-[#F04438] text-[.8125rem]">
                    {
                      (errors as { paymentMethod?: { message?: string } })
                        .paymentMethod?.message
                    }
                  </p>
                )}
              </div>
            )}

            {isNigeria && (
              <PromoInput
                appliedPromo={appliedPromo}
                onApply={handleApplyPromo}
                onRemove={() => setAppliedPromo(null)}
              />
            )}

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 bg-[#6EC93E] text-white font-semibold text-[1rem] rounded-[3.875rem] hover:bg-[#5cb535] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
              ) : countryId && !isNigeria ? (
                "Submit International Order"
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
