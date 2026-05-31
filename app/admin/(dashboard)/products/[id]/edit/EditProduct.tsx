/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useProductStore } from "@/store";
import { Button, Input } from "@/components";
import { Icon } from "@iconify/react";
import type { ProductFormState, DraftVariantGroup, DraftStockRow, DraftFaq } from "@/data";
import { EMPTY_PRODUCT_FORM } from "@/data";

// Re-use the same step UI from NewProduct — we render our own form here with the same visual language.
// All step sub-components are imported from NewProduct via a shared step module would be ideal,
// but since they read from global Zustand draft, we manage local state here and sync only on submit.

function productDetailToDraft(detail: NonNullable<ReturnType<typeof useProductStore.getState>["originalDetail"]>): ProductFormState {
  return {
    title: detail.title,
    description: detail.description ?? "",
    basePrice: String(detail.basePrice),
    baseImage: detail.baseImage,
    isActive: detail.isActive,
    salesOpenAt: detail.salesOpenAt,
    salesCloseAt: detail.salesCloseAt,
    variantGroups: detail.variantGroups.map((g) => ({
      _id: g.id,
      name: g.name,
      influencesPrice: g.influencesPrice,
      influencesImage: g.influencesImage,
      displayOrder: g.displayOrder,
      entries: g.entries.map((e) => ({
        _id: e.id,
        value: e.value,
        priceOverride: e.priceOverride != null ? String(e.priceOverride) : "",
        imageUrl: e.imageUrl,
        displayOrder: e.displayOrder,
      })),
    })),
    stocks: detail.stocks.map((s) => ({
      _id: s.id,
      combo: s.combo,
      quantity: String(s.quantity),
    })),
    faqs: detail.faqs.map((f) => ({
      _id: f.id,
      question: f.question,
      answer: f.answer,
    })),
  };
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const EditProductSkeleton = () => (
  <div className="max-w-2xl animate-pulse flex flex-col gap-5">
    <div className="h-8 w-48 bg-[#F3F4F6] rounded-xl" />
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-12 bg-[#F3F4F6] rounded-xl" />
    ))}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EditProduct({ productId }: { productId: string }) {
  const router = useRouter();
  const { originalDetail, updateProduct, setOriginalDetail } = useProductStore();

  const [form, setForm] = useState<ProductFormState | null>(null);
  const [saving, setSaving] = useState(false);

  // When originalDetail arrives (hydrated by Initializer), convert it to form state
  useEffect(() => {
    if (originalDetail && originalDetail.id === productId) {
      setForm(productDetailToDraft(originalDetail));
    }
  }, [originalDetail, productId]);

  // Cleanup on unmount
  useEffect(() => () => { setOriginalDetail(null); }, [setOriginalDetail]);

  const setField = useCallback(<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form) return;
    const price = parseFloat(form.basePrice);
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!price || price <= 0) { toast.error("Base price must be a positive number"); return; }

    setSaving(true);
    try {
      await updateProduct(productId, {
        title: form.title,
        description: form.description || null,
        basePrice: price,
        baseImage: form.baseImage,
        isActive: form.isActive,
        salesOpenAt: form.salesOpenAt,
        salesCloseAt: form.salesCloseAt,
        variantGroups: form.variantGroups.map((g) => ({
          name: g.name,
          influencesPrice: g.influencesPrice,
          influencesImage: g.influencesImage,
          entries: g.entries.map((e) => ({
            value: e.value,
            priceOverride: e.priceOverride ? parseFloat(e.priceOverride) : null,
            imageUrl: e.imageUrl,
          })),
        })),
        stocks: form.stocks.map((s) => ({ combo: s.combo, quantity: parseInt(s.quantity, 10) || 0 })),
        faqs: form.faqs.map((f) => ({ question: f.question, answer: f.answer })),
      });
      toast.success("Product updated");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to update product");
    } finally {
      setSaving(false);
    }
  }, [form, productId, updateProduct, router]);

  if (!form) return <EditProductSkeleton />;

  const { title, description, basePrice, baseImage, isActive, salesOpenAt, salesCloseAt, variantGroups, stocks, faqs } = form;

  return (
    <div className="max-w-2xl flex flex-col gap-8 pb-16">
      {/* ─── Section: Basics ─────────────────────────────────────────── */}
      <Section title="Product Basics">
        <Field label="Title *">
          <input
            type="text"
            value={title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. NFTNG Collection Tee"
            className={inputCls}
          />
        </Field>

        <Field label="Base Price (₦) *">
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setField("basePrice", e.target.value)}
            placeholder="5000"
            className={inputCls}
          />
        </Field>

        <Field label="Description">
          <Input
            type="rich-text"
            name="description"
            value={description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </Field>

        <Field label="Base Image URL">
          <input
            type="text"
            value={baseImage ?? ""}
            onChange={(e) => setField("baseImage", e.target.value || null)}
            placeholder="https://imagedelivery.net/…"
            className={inputCls}
          />
          {baseImage && (
            <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-[#E5E7EB]">
              <img src={baseImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sales Open At">
            <Input
              type="datetime-local"
              value={salesOpenAt ?? ""}
              onChange={(e) => setField("salesOpenAt", (e as any).target.value || null)}
              placeholder="Select open date & time"
            />
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>Blank = always open</p>
          </Field>
          <Field label="Sales Close At">
            <Input
              type="datetime-local"
              value={salesCloseAt ?? ""}
              onChange={(e) => setField("salesCloseAt", (e as any).target.value || null)}
              placeholder="Select close date & time"
            />
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>Blank = never closes</p>
          </Field>
        </div>

        <label className="flex items-center gap-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
            className="w-4 h-4 rounded accent-[#6EC93E]"
          />
          <div>
            <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>Publish / Active</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>Visible on storefront when checked</p>
          </div>
        </label>
      </Section>

      {/* ─── Section: Variant Groups ──────────────────────────────────── */}
      <Section
        title="Variant Groups"
        action={
          <button
            onClick={() => setField("variantGroups", [...variantGroups, { _id: nanoid(), name: "", influencesPrice: false, influencesImage: false, displayOrder: variantGroups.length, entries: [] }])}
            className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] bg-[#111827] text-white hover:bg-[#1f2937] transition-colors")}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" /> Add Group
          </button>
        }
      >
        {variantGroups.length === 0 && (
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>No variant groups — product uses base price and global stock.</p>
        )}
        {variantGroups.map((g, gi) => (
          <div key={g._id} className="rounded-xl border border-[#E5E7EB] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={g.name}
                onChange={(e) => {
                  const updated = [...variantGroups];
                  updated[gi] = { ...g, name: e.target.value };
                  setField("variantGroups", updated);
                }}
                placeholder="Group name (e.g. Size, Color)"
                className={cn(inputCls, "flex-1")}
              />
              <label className="flex items-center gap-1.5 text-[0.8125rem] text-[#374151] cursor-pointer">
                <input type="checkbox" checked={g.influencesPrice} onChange={(e) => { const u = [...variantGroups]; u[gi] = { ...g, influencesPrice: e.target.checked }; setField("variantGroups", u); }} className="accent-[#6EC93E]" />
                Price
              </label>
              <label className="flex items-center gap-1.5 text-[0.8125rem] text-[#374151] cursor-pointer">
                <input type="checkbox" checked={g.influencesImage} onChange={(e) => { const u = [...variantGroups]; u[gi] = { ...g, influencesImage: e.target.checked }; setField("variantGroups", u); }} className="accent-[#6EC93E]" />
                Image
              </label>
              <button onClick={() => setField("variantGroups", variantGroups.filter((_, i) => i !== gi))} className="text-red-400 hover:text-red-600">
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </button>
            </div>
            {/* Entries */}
            <div className="flex flex-col gap-2">
              {g.entries.map((e, ei) => (
                <div key={e._id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={e.value}
                    onChange={(ev) => {
                      const u = [...variantGroups];
                      u[gi] = { ...g, entries: g.entries.map((en, i) => i === ei ? { ...en, value: ev.target.value } : en) };
                      setField("variantGroups", u);
                    }}
                    placeholder="Value (e.g. M, Red)"
                    className={cn(inputCls, "flex-1")}
                  />
                  {g.influencesPrice && (
                    <input
                      type="number"
                      value={e.priceOverride}
                      onChange={(ev) => {
                        const u = [...variantGroups];
                        u[gi] = { ...g, entries: g.entries.map((en, i) => i === ei ? { ...en, priceOverride: ev.target.value } : en) };
                        setField("variantGroups", u);
                      }}
                      placeholder="Price"
                      className={cn(inputCls, "w-28")}
                    />
                  )}
                  {g.influencesImage && (
                    <input
                      type="text"
                      value={e.imageUrl ?? ""}
                      onChange={(ev) => {
                        const u = [...variantGroups];
                        u[gi] = { ...g, entries: g.entries.map((en, i) => i === ei ? { ...en, imageUrl: ev.target.value || null } : en) };
                        setField("variantGroups", u);
                      }}
                      placeholder="Image URL"
                      className={cn(inputCls, "w-40")}
                    />
                  )}
                  <button onClick={() => {
                    const u = [...variantGroups];
                    u[gi] = { ...g, entries: g.entries.filter((_, i) => i !== ei) };
                    setField("variantGroups", u);
                  }} className="text-red-400 hover:text-red-600 shrink-0">
                    <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const u = [...variantGroups];
                  u[gi] = { ...g, entries: [...g.entries, { _id: nanoid(), value: "", priceOverride: "", imageUrl: null, displayOrder: g.entries.length }] };
                  setField("variantGroups", u);
                }}
                className={cn(satoshi.className, "self-start flex items-center gap-1 text-[0.8125rem] text-[#6EC93E] hover:underline")}
              >
                <Icon icon="solar:add-circle-bold" className="w-3.5 h-3.5" /> Add entry
              </button>
            </div>
          </div>
        ))}
      </Section>

      {/* ─── Section: Stock ───────────────────────────────────────────── */}
      <Section
        title="Stock"
        action={
          <button
            onClick={() => setField("stocks", [...stocks, { _id: nanoid(), combo: {}, quantity: "0" }])}
            className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] bg-[#111827] text-white hover:bg-[#1f2937] transition-colors")}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" /> Add combo
          </button>
        }
      >
        {stocks.length === 0 && (
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>No stock rows — add a combo below.</p>
        )}
        {stocks.map((s, si) => (
          <div key={s._id} className="rounded-xl border border-[#E5E7EB] p-3 flex items-center gap-3">
            <div className="flex-1">
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-1")}>Combo (JSON)</p>
              <input
                type="text"
                value={JSON.stringify(s.combo)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    const u = [...stocks];
                    u[si] = { ...s, combo: parsed };
                    setField("stocks", u);
                  } catch {}
                }}
                className={cn(inputCls, "font-mono text-[0.8125rem]")}
              />
            </div>
            <div className="w-24">
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-1")}>Qty</p>
              <input
                type="number"
                value={s.quantity}
                onChange={(e) => {
                  const u = [...stocks];
                  u[si] = { ...s, quantity: e.target.value };
                  setField("stocks", u);
                }}
                min="0"
                className={inputCls}
              />
            </div>
            <button onClick={() => setField("stocks", stocks.filter((_, i) => i !== si))} className="text-red-400 hover:text-red-600 mt-4 shrink-0">
              <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
            </button>
          </div>
        ))}
      </Section>

      {/* ─── Section: FAQs ────────────────────────────────────────────── */}
      <Section
        title="FAQs"
        action={
          <button
            onClick={() => setField("faqs", [...faqs, { _id: nanoid(), question: "", answer: "" }])}
            className={cn(satoshi.className, "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] bg-[#111827] text-white hover:bg-[#1f2937] transition-colors")}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" /> Add FAQ
          </button>
        }
      >
        {faqs.length === 0 && (
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>No FAQs added.</p>
        )}
        {faqs.map((f, fi) => (
          <div key={f._id} className="rounded-xl border border-[#E5E7EB] p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={f.question}
                  onChange={(e) => {
                    const u = [...faqs];
                    u[fi] = { ...f, question: e.target.value };
                    setField("faqs", u);
                  }}
                  placeholder="Question"
                  className={inputCls}
                />
                <textarea
                  rows={2}
                  value={f.answer}
                  onChange={(e) => {
                    const u = [...faqs];
                    u[fi] = { ...f, answer: e.target.value };
                    setField("faqs", u);
                  }}
                  placeholder="Answer"
                  className={cn(inputCls, "resize-none")}
                />
              </div>
              <button onClick={() => setField("faqs", faqs.filter((_, i) => i !== fi))} className="text-red-400 hover:text-red-600 mt-1 shrink-0">
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </Section>

      {/* ─── Save bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          loading={saving}
          onClick={handleSave}
          className={cn(satoshi.className, "px-6 py-2.5 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem] transition-colors")}
        >
          Save Changes
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className={cn(satoshi.className, "px-6 py-2.5 rounded-xl text-[0.9375rem]")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl border border-[#D0D5DD] px-4 py-2.5 text-[0.875rem] text-[#374151] focus:outline-none focus:border-[#6EC93E] bg-white";

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{label}</label>
      {children}
    </div>
  );
}
