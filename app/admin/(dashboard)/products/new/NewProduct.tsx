/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { cn, toLocalInputValue } from "@/lib";
import {
  createDebouncedUploader,
  type DebouncedUploader,
} from "@/lib/image-upload";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useProductStore } from "@/store";
import { Input, Button, CheckBox } from "@/components";
import { PRODUCT_STEPS, productBasicsSchema } from "@/data";
import type {
  ProductStep,
  DraftVariantGroup,
  DraftVariantEntry,
  DraftStockRow,
  DraftFaq,
  ProductBasicsData,
  ProductFormState,
} from "@/data";

// ─── Module-level image registries ───────────────────────────────────────────
// Survive component unmounts so in-progress uploads persist across step switches.
// Cleared on draft reset or successful submit. Keys: "baseImage" | entry._id.

const FILE_REGISTRY = new Map<string, File>();
// Always holds the latest onChange for each key — never deleted, just overwritten.
// This means the old uploader can call the latest handler even after a remount.
const HANDLER_REGISTRY = new Map<string, (url: string | null) => void>();

// ─── Edit-mode helper ────────────────────────────────────────────────────────

function productDetailToDraft(
  detail: NonNullable<ReturnType<typeof useProductStore.getState>["originalDetail"]>,
): ProductFormState {
  return {
    title: detail.title,
    about: detail.about ?? "",
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

// ─── Animation ───────────────────────────────────────────────────────────────

const step = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as any },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as any },
  },
};

// ─── Step indicator ──────────────────────────────────────────────────────────

const StepBar = ({ currentStep }: { currentStep: ProductStep }) => {
  const idx = PRODUCT_STEPS.findIndex((s) => s.key === currentStep);
  return (
    <div className="flex items-center gap-0 mb-8">
      {PRODUCT_STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[0.8125rem] font-semibold transition-all duration-300 shrink-0",
                  done
                    ? "bg-[#6EC93E] text-white"
                    : active
                      ? "bg-[#111827] text-white"
                      : "bg-[#F3F4F6] text-[#9CA3AF]",
                )}
              >
                {done ? (
                  <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  satoshi.className,
                  "text-[0.6875rem] whitespace-nowrap",
                  active ? "text-[#111827] font-semibold" : "text-[#9CA3AF]",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < PRODUCT_STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-2 mt-[-1rem] transition-all duration-300",
                  done ? "bg-[#6EC93E]" : "bg-[#E5E7EB]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Image upload button ──────────────────────────────────────────────────────
// Tracks the File in FILE_REGISTRY so it survives step switches.
// Upload is NOT cancelled on unmount — it completes and updates the draft via HANDLER_REGISTRY.
// On remount, restores preview from the tracked File.

type ImageUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  size?: "lg" | "sm";
  uploaderRef?: React.RefObject<DebouncedUploader | null>;
  fileKey?: string; // required for persistence across step switches
};

const ImageUpload = ({
  value,
  onChange,
  label,
  size = "lg",
  uploaderRef,
  fileKey,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const uploader = useRef<DebouncedUploader>(createDebouncedUploader(8_000));
  // onChangeRef: always points to latest onChange so stale closures call the right handler
  const onChangeRef = useRef(onChange);

  // Restore preview if there was a pending upload on a previous mount
  const [pendingPreview, setPendingPreview] = useState<string | null>(() => {
    const pendingFile = fileKey ? FILE_REGISTRY.get(fileKey) : null;
    return pendingFile && !value ? URL.createObjectURL(pendingFile) : null;
  });

  // Keep registries current on every render
  useEffect(() => {
    onChangeRef.current = onChange;
    if (fileKey) HANDLER_REGISTRY.set(fileKey, onChange);
  });

  useEffect(() => {
    isMountedRef.current = true;
    if (uploaderRef)
      (
        uploaderRef as React.RefObject<DebouncedUploader | null> & {
          current: DebouncedUploader | null;
        }
      ).current = uploader.current;

    // If a pending file was restored on mount, resume the upload
    const restoredFile = fileKey ? FILE_REGISTRY.get(fileKey) : null;
    if (restoredFile && !value && pendingPreview) {
      const blobUrl = pendingPreview;
      uploader.current.queue(
        restoredFile,
        (url) => {
          if (fileKey) FILE_REGISTRY.delete(fileKey);
          const h =
            (fileKey ? HANDLER_REGISTRY.get(fileKey) : undefined) ??
            onChangeRef.current;
          h(url);
          if (isMountedRef.current) {
            setPendingPreview(null);
            URL.revokeObjectURL(blobUrl);
          }
        },
        () => {
          toast.error("Upload failed — will retry on submit");
          if (isMountedRef.current) setPendingPreview(null);
          URL.revokeObjectURL(blobUrl);
        },
      );
    }

    return () => {
      isMountedRef.current = false;
      if (uploaderRef)
        (
          uploaderRef as React.RefObject<DebouncedUploader | null> & {
            current: DebouncedUploader | null;
          }
        ).current = null;
      // Intentionally NOT cancelling — let the upload finish and update the draft via HANDLER_REGISTRY.
      // The File stays in FILE_REGISTRY so the next mount can restore the preview.
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = "";
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);

    const blobUrl = URL.createObjectURL(file);
    setPendingPreview(blobUrl);
    if (fileKey) FILE_REGISTRY.set(fileKey, file);

    uploader.current.queue(
      file,
      (url) => {
        if (fileKey) FILE_REGISTRY.delete(fileKey);
        const h =
          (fileKey ? HANDLER_REGISTRY.get(fileKey) : undefined) ??
          onChangeRef.current;
        h(url);
        if (isMountedRef.current) {
          setPendingPreview(null);
          URL.revokeObjectURL(blobUrl);
        }
      },
      () => {
        toast.error("Image upload failed");
        // Keep file in registry — flush() on submit will retry
        if (isMountedRef.current) setPendingPreview(null);
        URL.revokeObjectURL(blobUrl);
      },
    );
  };

  const handleClear = () => {
    uploader.current.cancel();
    if (fileKey) {
      FILE_REGISTRY.delete(fileKey);
      HANDLER_REGISTRY.delete(fileKey);
    }
    onChangeRef.current(null);
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
      setPendingPreview(null);
    }
  };

  const displayUrl = pendingPreview ?? value;
  const isLg = size === "lg";

  return (
    <div>
      {label && (
        <label
          className={cn(
            satoshi.className,
            "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
          )}
        >
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {displayUrl ? (
        <div
          className={cn(
            "relative rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB]",
            isLg ? "h-40" : "h-24",
          )}
        >
          <img src={displayUrl} alt="" className="w-full h-full object-cover" />
          {pendingPreview && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span
                className={cn(
                  satoshi.className,
                  "text-white text-[0.75rem] bg-black/50 px-2 py-1 rounded-lg",
                )}
              >
                Uploading…
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
          >
            <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#6EC93E] transition-colors flex flex-col items-center justify-center gap-2 text-[#9CA3AF] hover:text-[#6EC93E]",
            isLg ? "h-40" : "h-24",
          )}
        >
          <Icon
            icon="solar:cloud-upload-bold-duotone"
            className={isLg ? "w-8 h-8" : "w-5 h-5"}
          />
          <span
            className={cn(satoshi.className, "text-[0.8125rem] font-medium")}
          >
            {isLg ? "Click to upload image" : "Upload"}
          </span>
        </button>
      )}
    </div>
  );
};

// ─── Step 1: The Basics (react-hook-form + zod) ───────────────────────────────

type StepBasicsProps = {
  onValid: (data: ProductBasicsData) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
  baseImageUploaderRef: React.RefObject<DebouncedUploader | null>;
};

const StepBasics = ({
  onValid,
  formRef,
  baseImageUploaderRef,
}: StepBasicsProps) => {
  const { draft, setDraft } = useProductStore();

  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductBasicsData>({
    resolver: zodResolver(productBasicsSchema),
    defaultValues: {
      title: draft.title,
      about: draft.about,
      basePrice: draft.basePrice,
      description: draft.description,
      salesOpenAt: toLocalInputValue(draft.salesOpenAt),
      salesCloseAt: toLocalInputValue(draft.salesCloseAt),
    },
  });

  // Re-apply form values on mount in case draft was populated AFTER useForm initialized
  // (edit-mode: isReady gate guarantees draft is set, but Controllers need reset() to reflect it)
  useEffect(() => {
    reset({
      title: draft.title,
      about: draft.about,
      basePrice: draft.basePrice,
      description: draft.description,
      salesOpenAt: toLocalInputValue(draft.salesOpenAt),
      salesCloseAt: toLocalInputValue(draft.salesCloseAt),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: ProductBasicsData) => {
    // Sync to persisted draft so Zustand localStorage keeps up
    setDraft({
      title: data.title,
      description: data.description ?? "",
      about: data.about ?? "",
      basePrice: data.basePrice,
      salesOpenAt: data.salesOpenAt
        ? new Date(data.salesOpenAt).toISOString()
        : null,
      salesCloseAt: data.salesCloseAt
        ? new Date(data.salesCloseAt).toISOString()
        : null,
    });
    onValid(data);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      <div>
        <label
          className={cn(
            satoshi.className,
            "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
          )}
        >
          Product Title *
        </label>
        <Input
          type="text"
          placeholder="e.g. NFTNG Collection Tee"
          error={errors.title?.message}
          className={errors.title ? undefined : "border-[#D0D5DD]"}
          {...register("title")}
        />
      </div>

      <div>
        <label
          className={cn(
            satoshi.className,
            "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
          )}
        >
          Short Description
        </label>
        <Input
          type="text"
          placeholder="e.g. Premium cotton tee with NFTNG branding"
          error={errors.description?.message}
          className={errors.description ? undefined : "border-[#D0D5DD]"}
          {...register("description")}
        />
        <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>
          Plain text — shown below price on product page. Max 300 chars.
        </p>
      </div>

      <div>
        <label
          className={cn(
            satoshi.className,
            "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
          )}
        >
          Base Price (₦) *
        </label>
        <Input
          type="number"
          placeholder="5000"
          error={errors.basePrice?.message}
          className={errors.basePrice ? undefined : "border-[#D0D5DD]"}
          {...register("basePrice")}
        />
        <p
          className={cn(
            satoshi.className,
            "text-[0.75rem] text-[#9CA3AF] mt-1",
          )}
        >
          Used when no size variant is selected, or as fallback.
        </p>
      </div>

      <div>
        <label
          className={cn(
            satoshi.className,
            "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
          )}
        >
          About This Product
        </label>
        <Controller
          name="about"
          control={control}
          render={({ field }) => (
            <Input
              type="rich-text"
              name="about"
              value={field.value ?? ""}
              onChange={(e: any) => field.onChange(e.target.value)}
            />
          )}
        />
      </div>

      <ImageUpload
        value={draft.baseImage}
        onChange={(url) => setDraft({ baseImage: url })}
        label="Base Product Image"
        uploaderRef={baseImageUploaderRef}
        fileKey="baseImage"
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="salesOpenAt"
          control={control}
          render={({ field }) => (
            <div>
              <label
                className={cn(
                  satoshi.className,
                  "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
                )}
              >
                Sales Open At
              </label>
              <Input
                type="datetime-local"
                value={field.value ?? ""}
                onChange={(e: any) =>
                  field.onChange((e as any).target.value || "")
                }
                placeholder="Select open date & time"
              />
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.75rem] text-[#9CA3AF] mt-1",
                )}
              >
                Leave blank = always open
              </p>
            </div>
          )}
        />
        <Controller
          name="salesCloseAt"
          control={control}
          render={({ field }) => (
            <div>
              <label
                className={cn(
                  satoshi.className,
                  "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
                )}
              >
                Sales Close At
              </label>
              <Input
                type="datetime-local"
                value={field.value ?? ""}
                onChange={(e: any) =>
                  field.onChange((e as any).target.value || "")
                }
                placeholder="Select close date & time"
              />
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.75rem] text-[#9CA3AF] mt-1",
                )}
              >
                Leave blank = never closes
              </p>
            </div>
          )}
        />
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
        <CheckBox
          value={draft.isActive}
          onChange={(v) => setDraft({ isActive: v })}
        />
        <div>
          <p
            className={cn(
              satoshi.className,
              "text-[0.875rem] font-medium text-[#374151]",
            )}
          >
            Publish immediately
          </p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>
            Make this product visible on the storefront
          </p>
        </div>
      </div>
    </form>
  );
};

// ─── Step 2: Variant Groups ───────────────────────────────────────────────────

const VariantEntryRow = ({
  entry,
  influencesPrice,
  influencesImage,
  onChange,
  onRemove,
}: {
  entry: DraftVariantEntry;
  influencesPrice: boolean;
  influencesImage: boolean;
  onChange: (e: DraftVariantEntry) => void;
  onRemove: () => void;
}) => (
  <div className="flex flex-col gap-1.5 py-2">
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Value (e.g. M, Red, Cotton)"
          value={entry.value}
          onChange={(ev) =>
            onChange({ ...entry, value: (ev.target as HTMLInputElement).value })
          }
          className="border-[#D0D5DD] text-[0.8125rem]"
        />
      </div>
      {influencesPrice && (
        <div className="w-32">
          <Input
            type="number"
            placeholder="₦ price"
            value={entry.priceOverride}
            onChange={(ev) =>
              onChange({
                ...entry,
                priceOverride: (ev.target as HTMLInputElement).value,
              })
            }
            className="border-[#D0D5DD] text-[0.8125rem]"
          />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors shrink-0"
      >
        <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
      </button>
    </div>
    {influencesImage && (
      <ImageUpload
        value={entry.imageUrl}
        onChange={(url) => onChange({ ...entry, imageUrl: url })}
        label=""
        size="sm"
        fileKey={entry._id}
      />
    )}
  </div>
);

const GroupCard = ({
  group,
  hasPriceGroup,
  hasImageGroup,
  onChange,
  onRemove,
}: {
  group: DraftVariantGroup;
  hasPriceGroup: boolean;
  hasImageGroup: boolean;
  onChange: (g: DraftVariantGroup) => void;
  onRemove: () => void;
}) => {
  const addEntry = () =>
    onChange({
      ...group,
      entries: [
        ...group.entries,
        {
          _id: nanoid(),
          value: "",
          priceOverride: "",
          imageUrl: null,
          displayOrder: group.entries.length,
        },
      ],
    });

  return (
    <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Group name (e.g. Size, Color, Material)"
            value={group.name}
            onChange={(e) =>
              onChange({ ...group, name: (e.target as HTMLInputElement).value })
            }
            className="border-[#D0D5DD] text-[0.875rem]"
          />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <label
            className={cn(
              "flex items-center gap-1.5 cursor-pointer",
              !group.influencesPrice && hasPriceGroup
                ? "opacity-40 pointer-events-none"
                : "",
            )}
          >
            <CheckBox
              value={group.influencesPrice}
              onChange={(v) =>
                onChange({
                  ...group,
                  influencesPrice: v,
                  influencesImage: v ? false : group.influencesImage,
                })
              }
            />
            <span
              className={cn(
                satoshi.className,
                "text-[0.75rem] text-[#374151] whitespace-nowrap",
              )}
            >
              Changes price
            </span>
          </label>
          <label
            className={cn(
              "flex items-center gap-1.5 cursor-pointer",
              !group.influencesImage && hasImageGroup
                ? "opacity-40 pointer-events-none"
                : "",
            )}
          >
            <CheckBox
              value={group.influencesImage}
              onChange={(v) =>
                onChange({
                  ...group,
                  influencesImage: v,
                  influencesPrice: v ? false : group.influencesPrice,
                })
              }
            />
            <span
              className={cn(
                satoshi.className,
                "text-[0.75rem] text-[#374151] whitespace-nowrap",
              )}
            >
              Changes image
            </span>
          </label>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
        >
          <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pb-2">
        {group.influencesPrice && (
          <p
            className={cn(
              satoshi.className,
              "text-[0.75rem] text-[#6EC93E] pt-2",
            )}
          >
            Add a price for each entry — customers see this price when they pick
            this option.
          </p>
        )}
        {group.influencesImage && (
          <p
            className={cn(
              satoshi.className,
              "text-[0.75rem] text-[#6EC93E] pt-2",
            )}
          >
            Upload an image for each entry — the product image swaps when
            selected.
          </p>
        )}
        {group.entries.map((entry) => (
          <VariantEntryRow
            key={entry._id}
            entry={entry}
            influencesPrice={group.influencesPrice}
            influencesImage={group.influencesImage}
            onChange={(e) =>
              onChange({
                ...group,
                entries: group.entries.map((x) => (x._id === e._id ? e : x)),
              })
            }
            onRemove={() =>
              onChange({
                ...group,
                entries: group.entries.filter((x) => x._id !== entry._id),
              })
            }
          />
        ))}
        <button
          type="button"
          onClick={addEntry}
          className={cn(
            satoshi.className,
            "flex items-center gap-1.5 text-[0.8125rem] text-[#6EC93E] hover:text-[#5cb535] py-2 transition-colors",
          )}
        >
          <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
          Add entry
        </button>
      </div>
    </div>
  );
};

const StepVariants = () => {
  const { draft, setDraft } = useProductStore();

  const hasPriceGroup = draft.variantGroups.some((g) => g.influencesPrice);
  const hasImageGroup = draft.variantGroups.some((g) => g.influencesImage);

  const addGroup = (
    name = "",
    influencesPrice = false,
    influencesImage = false,
  ) => {
    setDraft({
      variantGroups: [
        ...draft.variantGroups,
        {
          _id: nanoid(),
          name,
          influencesPrice,
          influencesImage,
          displayOrder: draft.variantGroups.length,
          entries: [],
        },
      ],
    });
  };

  const updateGroup = (g: DraftVariantGroup) =>
    setDraft({
      variantGroups: draft.variantGroups.map((x) => (x._id === g._id ? g : x)),
    });

  const removeGroup = (id: string) =>
    setDraft({
      variantGroups: draft.variantGroups.filter((g) => g._id !== id),
    });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className={cn(
            poppins.className,
            "text-[0.9375rem] font-semibold text-[#111827] mb-0.5",
          )}
        >
          Variant Groups
        </p>
        <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>
          Group variants by dimension. Each group requires the user to pick one
          entry before adding to cart.
        </p>
      </div>

      {/* Quick add */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}
        >
          Quick add:
        </span>
        {!draft.variantGroups.some((g) => g.name === "Size") && (
          <button
            type="button"
            onClick={() => addGroup("Size", !hasPriceGroup, false)}
            className={cn(
              satoshi.className,
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[0.8125rem] text-[#374151] hover:bg-[#F3F4F6] transition-colors",
            )}
          >
            <Icon icon="solar:ruler-bold" className="w-3.5 h-3.5" />+ Size
          </button>
        )}
        {!draft.variantGroups.some((g) => g.name === "Color") && (
          <button
            type="button"
            onClick={() => addGroup("Color", false, !hasImageGroup)}
            className={cn(
              satoshi.className,
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[0.8125rem] text-[#374151] hover:bg-[#F3F4F6] transition-colors",
            )}
          >
            <Icon icon="solar:palette-bold" className="w-3.5 h-3.5" />+ Color
          </button>
        )}
        <button
          type="button"
          onClick={() => addGroup()}
          className={cn(
            satoshi.className,
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#D0D5DD] text-[0.8125rem] text-[#9CA3AF] hover:border-[#6EC93E] hover:text-[#6EC93E] transition-colors",
          )}
        >
          <Icon icon="solar:add-circle-linear" className="w-3.5 h-3.5" />
          Custom group
        </button>
      </div>

      {draft.variantGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-[#E5E7EB] text-center gap-2">
          <Icon
            icon="solar:tuning-2-bold-duotone"
            className="w-10 h-10 text-[#D1D5DB]"
          />
          <p
            className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}
          >
            No variant groups yet
          </p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#D1D5DB]")}>
            Skip this step if your product has no variants
          </p>
        </div>
      )}

      <AnimatePresence>
        {draft.variantGroups.map((g) => (
          <motion.div
            key={g._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <GroupCard
              group={g}
              hasPriceGroup={hasPriceGroup && !g.influencesPrice}
              hasImageGroup={hasImageGroup && !g.influencesImage}
              onChange={updateGroup}
              onRemove={() => removeGroup(g._id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─── Step 3: Stock ────────────────────────────────────────────────────────────

const StepStock = () => {
  const { draft, setDraft } = useProductStore();
  const hasGroups = draft.variantGroups.length > 0;

  const buildEmptyCombo = () => {
    const combo: Record<string, string> = {};
    draft.variantGroups.forEach((g) => {
      combo[g.name] = "";
    });
    return combo;
  };

  const addRow = () =>
    setDraft({
      stocks: [
        ...draft.stocks,
        {
          _id: nanoid(),
          combo: hasGroups ? buildEmptyCombo() : {},
          quantity: "",
        },
      ],
    });

  const updateRow = (r: DraftStockRow) =>
    setDraft({ stocks: draft.stocks.map((x) => (x._id === r._id ? r : x)) });
  const removeRow = (id: string) =>
    setDraft({ stocks: draft.stocks.filter((r) => r._id !== id) });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className={cn(
            poppins.className,
            "text-[0.9375rem] font-semibold text-[#111827] mb-0.5",
          )}
        >
          Stock
        </p>
        <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>
          {hasGroups
            ? "Add one row per available combination. Only combos you add here can be purchased."
            : "No variants — enter the total stock quantity."}
        </p>
      </div>

      {!hasGroups ? (
        <div className="flex items-center gap-3">
          <div className="w-40">
            <label
              className={cn(
                satoshi.className,
                "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
              )}
            >
              Quantity
            </label>
            <Input
              type="number"
              placeholder="0"
              value={draft.stocks[0]?.quantity ?? ""}
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                if (draft.stocks.length === 0) {
                  setDraft({
                    stocks: [{ _id: nanoid(), combo: {}, quantity: val }],
                  });
                } else {
                  setDraft({ stocks: [{ ...draft.stocks[0], quantity: val }] });
                }
              }}
              className="border-[#D0D5DD]"
            />
          </div>
        </div>
      ) : (
        <>
          {draft.stocks.length > 0 && (
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              {/* Header row */}
              <div
                className="grid bg-[#F9FAFB] border-b border-[#E5E7EB] px-4 py-2"
                style={{
                  gridTemplateColumns: `repeat(${draft.variantGroups.length}, 1fr) 120px 40px`,
                }}
              >
                {draft.variantGroups.map((g) => (
                  <span
                    key={g._id}
                    className={cn(
                      satoshi.className,
                      "text-[0.75rem] font-semibold text-[#6B7280] uppercase tracking-wide",
                    )}
                  >
                    {g.name}
                  </span>
                ))}
                <span
                  className={cn(
                    satoshi.className,
                    "text-[0.75rem] font-semibold text-[#6B7280] uppercase tracking-wide",
                  )}
                >
                  Qty
                </span>
                <span />
              </div>
              {/* Stock rows */}
              {draft.stocks.map((row) => (
                <div
                  key={row._id}
                  className="grid items-center px-4 py-2 border-b border-[#F3F4F6] last:border-none"
                  style={{
                    gridTemplateColumns: `repeat(${draft.variantGroups.length}, 1fr) 120px 40px`,
                  }}
                >
                  {draft.variantGroups.map((g) => (
                    <div key={g._id} className="pr-2">
                      <Input
                        type="select"
                        value={row.combo[g.name] ?? ""}
                        placeholder={`— ${g.name} —`}
                        selectOptions={g.entries
                          .filter((e) => e.value)
                          .map((e) => ({ value: e.value, label: e.value }))}
                        onChange={(ev: any) =>
                          updateRow({
                            ...row,
                            combo: {
                              ...row.combo,
                              [g.name]: (ev as any).target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className="pr-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow({
                          ...row,
                          quantity: (e.target as HTMLInputElement).value,
                        })
                      }
                      className="border-[#D0D5DD] text-[0.8125rem]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(row._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Icon
                      icon="solar:trash-bin-trash-bold"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {draft.stocks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-[#E5E7EB] gap-2">
              <Icon
                icon="solar:box-bold-duotone"
                className="w-10 h-10 text-[#D1D5DB]"
              />
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] text-[#9CA3AF]",
                )}
              >
                No stock combinations yet
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={addRow}
            className={cn(
              satoshi.className,
              "self-start flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[#D0D5DD] text-[0.8125rem] text-[#9CA3AF] hover:border-[#6EC93E] hover:text-[#6EC93E] transition-colors",
            )}
          >
            <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
            Add combination
          </button>
        </>
      )}
    </div>
  );
};

// ─── Step 4: FAQs ─────────────────────────────────────────────────────────────

const StepFaqs = () => {
  const { draft, setDraft } = useProductStore();

  const addFaq = () =>
    setDraft({
      faqs: [...draft.faqs, { _id: nanoid(), question: "", answer: "" }],
    });
  const updateFaq = (f: DraftFaq) =>
    setDraft({ faqs: draft.faqs.map((x) => (x._id === f._id ? f : x)) });
  const removeFaq = (id: string) =>
    setDraft({ faqs: draft.faqs.filter((f) => f._id !== id) });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className={cn(
            poppins.className,
            "text-[0.9375rem] font-semibold text-[#111827] mb-0.5",
          )}
        >
          Frequently Asked Questions
        </p>
        <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>
          Optional — customers will see these on the product page. Leave empty
          to hide the section.
        </p>
      </div>

      <AnimatePresence>
        {draft.faqs.map((faq, i) => (
          <motion.div
            key={faq._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <span
                  className={cn(
                    satoshi.className,
                    "text-[0.8125rem] font-semibold text-[#374151]",
                  )}
                >
                  FAQ {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFaq(faq._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <label
                    className={cn(
                      satoshi.className,
                      "block text-[0.8125rem] font-medium text-[#374151] mb-1",
                    )}
                  >
                    Question
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. What sizes do you carry?"
                    value={faq.question}
                    onChange={(e) =>
                      updateFaq({
                        ...faq,
                        question: (e.target as HTMLInputElement).value,
                      })
                    }
                    className="border-[#D0D5DD]"
                  />
                </div>
                <div>
                  <label
                    className={cn(
                      satoshi.className,
                      "block text-[0.8125rem] font-medium text-[#374151] mb-1",
                    )}
                  >
                    Answer
                  </label>
                  <Input
                    type="textarea"
                    placeholder="Write the answer here…"
                    value={faq.answer}
                    onChange={(e: any) =>
                      updateFaq({
                        ...faq,
                        answer: (e.target as HTMLTextAreaElement).value,
                      })
                    }
                    className="border-[#D0D5DD]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {draft.faqs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-[#E5E7EB] gap-2">
          <Icon
            icon="solar:chat-round-dots-bold-duotone"
            className="w-10 h-10 text-[#D1D5DB]"
          />
          <p
            className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}
          >
            No FAQs yet — totally optional
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={addFaq}
        className={cn(
          satoshi.className,
          "self-start flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[#D0D5DD] text-[0.8125rem] text-[#9CA3AF] hover:border-[#6EC93E] hover:text-[#6EC93E] transition-colors",
        )}
      >
        <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
        Add FAQ
      </button>
    </div>
  );
};

// ─── Step 5: Review ───────────────────────────────────────────────────────────

const CheckRow = ({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-[#F3F4F6] last:border-none">
    <Icon
      icon={ok ? "solar:check-circle-bold" : "solar:info-circle-bold"}
      className={cn(
        "w-5 h-5 mt-0.5 shrink-0",
        ok ? "text-[#6EC93E]" : "text-amber-400",
      )}
    />
    <div className="flex-1 flex items-center justify-between gap-4">
      <span className={cn(satoshi.className, "text-[0.875rem] text-[#6B7280]")}>
        {label}
      </span>
      <span
        className={cn(
          satoshi.className,
          "text-[0.875rem] font-medium text-[#374151] text-right",
        )}
      >
        {value}
      </span>
    </div>
  </div>
);

const StepReview = () => {
  const { draft } = useProductStore();
  const totalStock = draft.stocks.reduce(
    (s, r) => s + (parseInt(r.quantity) || 0),
    0,
  );
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className={cn(
            poppins.className,
            "text-[0.9375rem] font-semibold text-[#111827] mb-0.5",
          )}
        >
          Review & Publish
        </p>
        <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>
          Check everything before submitting.
        </p>
      </div>
      <div>
        <CheckRow label="Title" value={draft.title || "—"} ok={!!draft.title} />
        <CheckRow
          label="Base price"
          value={
            draft.basePrice
              ? `₦${Number(draft.basePrice).toLocaleString()}`
              : "—"
          }
          ok={!!draft.basePrice && Number(draft.basePrice) > 0}
        />
        <CheckRow
          label="Base image"
          value={draft.baseImage ? "Uploaded ✓" : "None (optional)"}
          ok={!!draft.baseImage}
        />
        <CheckRow
          label="Description"
          value={
            draft.description ? `${draft.description.slice(0, 60)}…` : "None"
          }
          ok={!!draft.description}
        />
        <CheckRow
          label="Variant groups"
          value={
            draft.variantGroups.length === 0
              ? "No variants"
              : `${draft.variantGroups.length} group${draft.variantGroups.length > 1 ? "s" : ""}`
          }
          ok
        />
        <CheckRow
          label="Stock"
          value={`${draft.stocks.length} combination${draft.stocks.length !== 1 ? "s" : ""} · ${totalStock} units total`}
          ok={draft.stocks.length > 0}
        />
        <CheckRow
          label="FAQs"
          value={
            draft.faqs.length === 0
              ? "None (optional)"
              : `${draft.faqs.length} FAQ${draft.faqs.length > 1 ? "s" : ""}`
          }
          ok
        />
        <CheckRow
          label="Publish on create"
          value={
            draft.isActive
              ? "Yes — visible immediately"
              : "No — hidden until you publish"
          }
          ok
        />
        {draft.salesOpenAt && (
          <CheckRow
            label="Sales open at"
            value={new Date(draft.salesOpenAt).toLocaleString()}
            ok
          />
        )}
        {draft.salesCloseAt && (
          <CheckRow
            label="Sales close at"
            value={new Date(draft.salesCloseAt).toLocaleString()}
            ok
          />
        )}
      </div>
    </div>
  );
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(
  currentStep: ProductStep,
  draft: ReturnType<typeof useProductStore.getState>["draft"],
): string | null {
  if (currentStep === "basics") {
    if (!draft.title.trim()) return "Product title is required";
    if (!draft.basePrice || Number(draft.basePrice) <= 0)
      return "A valid base price is required";
  }
  if (currentStep === "variants") {
    const priceGroups = draft.variantGroups.filter((g) => g.influencesPrice);
    const imageGroups = draft.variantGroups.filter((g) => g.influencesImage);
    if (priceGroups.length > 1)
      return "Only one group can change price — uncheck the others";
    if (imageGroups.length > 1)
      return "Only one group can change the image — uncheck the others";
    for (const g of draft.variantGroups) {
      if (!g.name.trim()) return "All variant groups need a name";
      if (g.entries.length === 0)
        return `Group "${g.name}" needs at least one entry`;
      for (const e of g.entries) {
        const hasName = e.value.trim().length > 0;
        const hasPrice = e.priceOverride && Number(e.priceOverride) > 0;
        const hasImage = !!e.imageUrl;
        const anyFilled = hasName || (g.influencesPrice && hasPrice) || (g.influencesImage && hasImage);

        if (!anyFilled) continue; // blank row — caught by entries.length check above

        if (!hasName) return `An entry in "${g.name}" has a ${g.influencesImage ? "image" : "price"} but no name — add a name`;
        if (g.influencesPrice && !hasPrice) return `"${e.value}" in "${g.name}" needs a price`;
        if (g.influencesImage && !hasImage) return `"${e.value}" in "${g.name}" needs an image`;
      }
    }
  }
  if (currentStep === "stock") {
    if (draft.variantGroups.length === 0) {
      if (draft.stocks.length === 0 || !draft.stocks[0]?.quantity)
        return "Enter the stock quantity";
    } else {
      if (draft.stocks.length === 0)
        return "Add at least one stock combination";
      for (const r of draft.stocks) {
        const missingGroup = draft.variantGroups.find((g) => !r.combo[g.name]);
        if (missingGroup)
          return `Select a value for "${missingGroup.name}" in every stock row`;
        if (!r.quantity) return "Every stock row needs a quantity";
      }
    }
  }
  if (currentStep === "faqs") {
    for (const f of draft.faqs) {
      if (!f.question.trim() || !f.answer.trim())
        return "All FAQs need a question and an answer";
    }
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const NewProduct = ({ productId }: { productId?: string }) => {
  const isEdit = !!productId;
  const router = useRouter();
  const { draft, createProduct, updateProduct, clearDraft, setDraft, setDraftProductId, setOriginalDetail, originalDetail } = useProductStore();
  const { admin } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<ProductStep>("basics");
  const [submitting, setSubmitting] = useState(false);
  // isReady: create mode is always ready; edit mode waits until draft is populated from originalDetail
  // so StepBasics mounts AFTER defaultValues are correct (RHF captures them once at mount)
  const [isReady, setIsReady] = useState(!isEdit);
  const basicsFormRef = useRef<HTMLFormElement>(null);
  const baseImageUploaderRef = useRef<DebouncedUploader | null>(null);

  // Edit mode: populate draft from originalDetail when it arrives, then mark ready
  useEffect(() => {
    if (isEdit && originalDetail && originalDetail.id === productId) {
      setDraft(productDetailToDraft(originalDetail));
      setDraftProductId(productId);
      setIsReady(true);
    }
  }, [isEdit, originalDetail, productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount in edit mode
  useEffect(() => {
    if (!isEdit) return;
    return () => { setOriginalDetail(null); };
  }, [isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect changes for "Save Changes" button disable state
  const originalDraftSnapshot = useMemo(
    () => (isEdit && originalDetail ? JSON.stringify(productDetailToDraft(originalDetail)) : null),
    [isEdit, originalDetail],
  );
  const hasChanges = useMemo(() => {
    if (!isEdit) return true;
    return JSON.stringify(draft) !== originalDraftSnapshot;
  }, [isEdit, draft, originalDraftSnapshot]);

  const stepIdx = PRODUCT_STEPS.findIndex((s) => s.key === currentStep);
  const isLast = stepIdx === PRODUCT_STEPS.length - 1;

  const advanceStep = () => setCurrentStep(PRODUCT_STEPS[stepIdx + 1].key);

  const goNext = () => {
    if (currentStep === "basics") {
      baseImageUploaderRef.current?.flush().catch(() => {});
      basicsFormRef.current?.requestSubmit();
      return;
    }

    if (currentStep === "variants") {
      const cleanedGroups = draft.variantGroups.map((g) => ({
        ...g,
        entries: g.entries.filter(
          (e) => e.value.trim() || (e.priceOverride && Number(e.priceOverride) > 0) || !!e.imageUrl,
        ),
      }));
      setDraft({ variantGroups: cleanedGroups });
      const err = validateStep("variants", { ...draft, variantGroups: cleanedGroups });
      if (err) { toast.error(err); return; }
      advanceStep();
      return;
    }

    if (currentStep === "stock") {
      const cleanedStocks = draft.stocks.filter(
        (r) => (r.quantity && r.quantity.trim()) || Object.values(r.combo).some((v) => v),
      );
      setDraft({ stocks: cleanedStocks });
      const err = validateStep("stock", { ...draft, stocks: cleanedStocks });
      if (err) { toast.error(err); return; }
      advanceStep();
      return;
    }

    const err = validateStep(currentStep, draft);
    if (err) { toast.error(err); return; }
    advanceStep();
  };

  const goPrev = () => {
    if (stepIdx > 0) setCurrentStep(PRODUCT_STEPS[stepIdx - 1].key);
  };

  const handleSubmit = useCallback(async () => {
    const err = validateStep("review", draft);
    if (err) { toast.error(err); return; }
    if (!draft.title || !draft.basePrice) { toast.error("Missing required fields"); return; }

    setSubmitting(true);
    if (baseImageUploaderRef.current) {
      await baseImageUploaderRef.current.flush().catch(() => toast.error("Base image upload failed — please re-select"));
    }

    const payload = {
      title: draft.title.trim(),
      about: draft.about || null,
      description: draft.description || null,
      basePrice: Number(draft.basePrice),
      baseImage: draft.baseImage,
      isActive: draft.isActive,
      salesOpenAt: draft.salesOpenAt,
      salesCloseAt: draft.salesCloseAt,
      variantGroups: draft.variantGroups.map((g, i) => ({
        name: g.name,
        influencesPrice: g.influencesPrice,
        influencesImage: g.influencesImage,
        displayOrder: i,
        entries: g.entries.map((e, j) => ({
          value: e.value,
          priceOverride: e.priceOverride ? Number(e.priceOverride) : null,
          imageUrl: e.imageUrl,
          displayOrder: j,
        })),
      })),
      stocks: draft.stocks.map((r) => ({ combo: r.combo, quantity: parseInt(r.quantity) || 0 })),
      faqs: draft.faqs.map((f, i) => ({ question: f.question, answer: f.answer, displayOrder: i })),
    };

    try {
      if (isEdit && productId) {
        await updateProduct(productId, payload as any);
        FILE_REGISTRY.clear();
        HANDLER_REGISTRY.clear();
        clearDraft();
        toast.success("Changes saved!");
        router.push("/admin/products");
      } else {
        await createProduct(payload as any);
        FILE_REGISTRY.clear();
        HANDLER_REGISTRY.clear();
        clearDraft();
        toast.success("Product created!");
        router.push("/admin/products");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? (isEdit ? "Failed to save changes" : "Failed to create product"));
    } finally {
      setSubmitting(false);
    }
  }, [draft, isEdit, productId, createProduct, updateProduct, clearDraft, router]);

  const renderStep = () => {
    switch (currentStep) {
      case "basics":
        return (
          <StepBasics
            formRef={basicsFormRef}
            onValid={advanceStep}
            baseImageUploaderRef={baseImageUploaderRef}
          />
        );
      case "variants":
        return <StepVariants />;
      case "stock":
        return <StepStock />;
      case "faqs":
        return <StepFaqs />;
      case "review":
        return <StepReview />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
        >
          <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4" />
        </button>
        <div>
          <h1 className={cn(poppins.className, "text-[1.125rem] font-bold text-[#111827]")}>
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          {draft.title && (
            <p className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF]")}>{draft.title}</p>
          )}
        </div>
        {isEdit ? (
          hasChanges && (
            <button
              type="button"
              onClick={() => {
                FILE_REGISTRY.clear();
                HANDLER_REGISTRY.clear();
                if (originalDetail) setDraft(productDetailToDraft(originalDetail));
                setCurrentStep("basics");
                toast.success("Changes discarded");
              }}
              className={cn(satoshi.className, "ml-auto text-[0.8125rem] text-[#9CA3AF] hover:text-red-500 transition-colors")}
            >
              Discard changes
            </button>
          )
        ) : (
          (draft.title || draft.basePrice || draft.variantGroups.length > 0) && (
            <button
              type="button"
              onClick={() => {
                FILE_REGISTRY.clear();
                HANDLER_REGISTRY.clear();
                clearDraft();
                setCurrentStep("basics");
                toast.success("Draft cleared");
              }}
              className={cn(satoshi.className, "ml-auto text-[0.8125rem] text-[#9CA3AF] hover:text-red-500 transition-colors")}
            >
              Clear draft
            </button>
          )
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <StepBar currentStep={currentStep} />

        <AnimatePresence mode="wait">
          {isReady ? (
            <motion.div
              key={currentStep}
              variants={step}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderStep()}
            </motion.div>
          ) : (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col gap-4 py-2">
                {[1, 0.8, 0.6, 0.8, 1].map((w, i) => (
                  <div key={i} className="h-10 rounded-xl bg-[#F3F4F6] animate-pulse" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F3F4F6]">
          <Button
            variant="secondary"
            type="button"
            onClick={goPrev}
            disabled={stepIdx === 0}
            className={cn(
              satoshi.className,
              "px-5 py-2.5 rounded-xl text-[0.875rem] font-medium border-[#E5E7EB] disabled:opacity-30",
            )}
          >
            <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4 mr-1.5" />
            Back
          </Button>

          {isLast ? (
            <Button
              loading={submitting}
              disabled={isEdit && !hasChanges}
              onClick={handleSubmit}
              className={cn(
                satoshi.className,
                "flex items-center gap-2 px-6 py-2.5! rounded-xl bg-[#6EC93E] text-white text-[0.875rem] font-semibold hover:bg-[#5cb535] transition-colors shadow-sm shadow-[#6EC93E]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
              )}
            >
              <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
              {isEdit ? "Save Changes" : draft.isActive ? "Create & Publish" : "Create (Draft)"}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className={cn(
                satoshi.className,
                "flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#111827] text-white text-[0.875rem] font-semibold hover:bg-[#1f2937] transition-colors",
              )}
            >
              Next
              <Icon icon="solar:alt-arrow-right-bold" className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {admin && !isEdit && (
        <p
          className={cn(
            satoshi.className,
            "text-center text-[0.75rem] text-[#D1D5DB] mt-4",
          )}
        >
          Draft auto-saved · won't be lost on refresh
        </p>
      )}
    </div>
  );
};

export default NewProduct;
