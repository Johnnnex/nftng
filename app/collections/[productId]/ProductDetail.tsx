/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, parseMarkdown } from "@/lib";
import { api } from "@/lib/api";
import { poppins, satoshi } from "@/app/layout";
import { Input, Tab, Button } from "@/components";
import {
  isEntryAvailableInitial,
  isEntryAvailable,
  getStockForCombo,
  SALE_STATUS_OVERLAY,
  reviewSchema,
} from "@/data";
import { useCartStore } from "@/store";
import type {
  PublicProductDetail,
  PublicVariantGroup,
  ReviewFormData,
} from "@/data";

type SortOption = "Latest" | "Oldest" | "Highest Rating" | "Lowest Rating";
const SORT_OPTIONS: SortOption[] = [
  "Latest",
  "Oldest",
  "Highest Rating",
  "Lowest Rating",
];
const REVIEWS_PER_PAGE = 4;

// ─── Stars ────────────────────────────────────────────────────────────────────

const DisplayStars = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) => (
  <div className="flex items-center gap-px">
    {Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        icon="iconoir:star-solid"
        className={cn(
          size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5",
          i < Math.round(rating) ? "text-[#FFAD33]" : "text-[#757575]",
        )}
      />
    ))}
  </div>
);

// ─── Image overlay on detail page ─────────────────────────────────────────────

const DetailImageOverlay = ({
  saleStatus,
}: {
  saleStatus: PublicProductDetail["saleStatus"];
}) => {
  const overlay = SALE_STATUS_OVERLAY[saleStatus];
  if (!overlay) return null;
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        overlay.bg + "/80",
      )}
    >
      <div className="w-full overflow-hidden">
        <div
          data-animated="true"
          className="marquee-anim"
          style={{ "--marquee-gap": "4rem" } as CSSProperties}
        >
          <div
            className="inner flex items-center w-max"
            style={{ animationDuration: "18s" }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "text-[1.5rem] font-bold tracking-widest uppercase py-5 px-8 whitespace-nowrap shrink-0",
                  overlay.text,
                )}
              >
                {overlay.label} ·
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Review modal ─────────────────────────────────────────────────────────────

const WriteReviewModal = ({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });
  const watchedRating = watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      await api.post("/api/reviews", {
        productId,
        reviewerName: data.name,
        rating: data.rating,
        content: data.review,
      });
      toast.success(
        "Review submitted! It will appear once approved by our team.",
      );
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response
        ?.data?.error;
      toast.error(msg ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative bg-white rounded-[1.25rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={cn(
              poppins.className,
              "text-[1.375rem] font-semibold text-black",
            )}
          >
            Write a Review
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center hover:bg-[#E0E0E0] transition-colors"
          >
            <Icon icon="mdi:close" className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-[#00000099] text-[.875rem] mb-3">Your Rating</p>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() =>
                  setValue("rating", i + 1, { shouldValidate: true })
                }
                className="p-1"
              >
                <Icon
                  icon="iconoir:star-solid"
                  className={cn(
                    "w-8 h-8 transition-colors",
                    (hoverRating || watchedRating) > i
                      ? "text-[#FFAD33]"
                      : "text-[#E0E0E0]",
                  )}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-[#F04438] text-[.8125rem] mt-1.5">
              {errors.rating.message}
            </p>
          )}
        </div>
        <div className="mb-5">
          <Input
            label="Your Name"
            type="text"
            placeholder="e.g. Samantha D."
            error={errors.name?.message}
            className={errors.name ? undefined : "border-[#D0D5DD]"}
            {...register("name")}
          />
        </div>
        <div className="mb-7">
          <Input
            label="Your Review"
            type="textarea"
            placeholder="Share your experience…"
            error={errors.review?.message}
            className={errors.review ? undefined : "border-[#D0D5DD]"}
            {...register("review")}
          />
        </div>
        <Button
          loading={submitting}
          onClick={handleSubmit(onSubmit)}
          className="w-full py-4! bg-[#6EC93E] hover:bg-[#5cb535] text-white font-medium text-[1rem] rounded-[3.875rem] transition-colors"
        >
          Submit Review
        </Button>
      </motion.div>
    </motion.div>
  );
};

// ─── Sort dropdown ────────────────────────────────────────────────────────────

const SortDropdown = ({
  sort,
  setSort,
}: {
  sort: SortOption;
  setSort: (s: SortOption) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center bg-[#F0F0F0] gap-2 p-[.5rem_.875rem] sm:p-[.8125rem_1.25rem] rounded-[3.875rem] font-medium text-[.875rem] sm:text-[1rem] text-[#6EC93E]"
      >
        {sort}
        <Icon
          icon="uiw:down"
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 bg-white border border-[#0000001A] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-10 min-w-44"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSort(option);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-5 py-3 text-[.9375rem] transition-colors hover:bg-[#F8F8F8]",
                  sort === option
                    ? "text-[#6EC93E] font-medium"
                    : "text-[#00000099] font-normal",
                )}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tab content ──────────────────────────────────────────────────────────────

const ProductDetailsTab = ({ about }: { about: string | null }) => (
  <>
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[#6EC93E] text-[1.25rem] sm:text-[1.5rem] font-bold">
        About This Product
      </span>
    </div>
    {about ? (
      <div
        className={cn(
          "text-[#000000B2] leading-relaxed max-w-2xl",
          "[&_h2]:text-black [&_h2]:font-semibold [&_h2]:text-[1.125rem] [&_h2]:mb-2 [&_h2]:mt-6",
          "[&_p]:text-[.9375rem] [&_p]:mb-3 [&_p]:leading-6",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5",
          "[&_li]:text-[.9375rem] [&_li]:leading-6",
          "[&_strong]:font-semibold [&_strong]:text-black",
        )}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(about) }}
      />
    ) : (
      <p className="text-[#00000099] text-[.9375rem]">
        No description provided.
      </p>
    )}
  </>
);

const ReviewsTab = ({
  product,
  openModal,
}: {
  product: PublicProductDetail;
  openModal: () => void;
}) => {
  const [sort, setSort] = useState<SortOption>("Latest");
  const [page, setPage] = useState(1);
  const sorted = useMemo(
    () =>
      [...product.reviews].sort((a, b) => {
        if (sort === "Latest")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sort === "Oldest")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        if (sort === "Highest Rating") return b.rating - a.rating;
        return a.rating - b.rating;
      }),
    [product.reviews, sort],
  );
  const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE);
  const visible = sorted.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE,
  );

  return (
    <>
      <div className="flex mb-6 flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-[#6EC93E] text-[1.25rem] sm:text-[1.5rem] font-bold">
            All Reviews
          </span>
          <span className="text-[1rem] font-normal text-[#00000099]">
            ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <SortDropdown
            sort={sort}
            setSort={(s) => {
              setSort(s);
              setPage(1);
            }}
          />
          <button
            onClick={openModal}
            className="flex items-center bg-[#6EC93E] font-medium gap-1.5 p-[.5rem_1rem] sm:p-[.8125rem_1.875rem] rounded-[3.875rem] text-[.875rem] sm:text-[1rem] text-white"
          >
            Write a Review
          </button>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="text-[#00000099] text-[.9375rem]">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {visible.map((r) => (
            <div
              key={r.id}
              className="border flex flex-col border-[#0000001A] rounded-[1.25rem] p-[1.25rem_1.25rem] sm:p-[1.75rem_2rem]"
            >
              <div className="flex justify-between items-center mb-3.5">
                <DisplayStars rating={r.rating} size="md" />
              </div>
              <div className="flex items-center mb-3 gap-1">
                <span className="font-bold text-[1.125rem] text-[#6EC93E]">
                  {r.reviewerName}
                </span>
                {r.isVerified && (
                  <Icon
                    className="w-5 h-5 text-[#01AB31]"
                    icon="lets-icons:check-round-fill"
                  />
                )}
              </div>
              <p className="font-normal text-[.9375rem] leading-5.5 text-[#00000099] flex-1">
                &ldquo;{r.content}&rdquo;
              </p>
              <small className="text-[.875rem] font-medium text-[#00000066] mt-5">
                Posted on{" "}
                {new Date(r.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </small>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <span className="text-[.875rem] text-[#00000066] select-none">
            {page} / {totalPages}
          </span>
          {[
            { dir: -1, icon: "hugeicons:arrow-left-02", can: page > 1 },
            {
              dir: 1,
              icon: "hugeicons:arrow-right-02",
              can: page < totalPages,
            },
          ].map(({ dir, icon, can }) => (
            <button
              key={icon}
              onClick={() => setPage((p) => p + dir)}
              disabled={!can}
              className={cn(
                "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
                can
                  ? "border-[#6EC93E] text-[#6EC93E] hover:bg-[#6EC93E] hover:text-white"
                  : "border-[#D9D9D9] text-[#D9D9D9] cursor-not-allowed",
              )}
            >
              <Icon icon={icon} className="w-5 h-5" />
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const FAQsTab = ({ faqs }: { faqs: PublicProductDetail["faqs"] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#6EC93E] text-[1.25rem] sm:text-[1.5rem] font-bold">
          FAQs
        </span>
      </div>
      {faqs.length === 0 ? (
        <p className="text-[#00000099] text-[.9375rem]">
          No FAQs for this product.
        </p>
      ) : (
        <div className="flex flex-col gap-2 lg:gap-3 max-w-2xl lg:max-w-4xl">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.id}
                className="bg-[#F1F1F1] border border-[#0000000D] rounded-[.625rem] lg:rounded-[.875rem] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex text-black items-center justify-between cursor-pointer w-full p-[1rem_1.4375rem_.8125rem_1.25rem] lg:p-[1.25rem_1.75rem_1rem_1.5rem]"
                >
                  <span className="font-medium text-[.875rem] lg:text-[1rem] text-left">
                    {faq.question}
                  </span>
                  <Icon
                    icon="uiw:down"
                    className={cn(
                      "w-5 h-5 shrink-0 ml-4 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "transition-all duration-300 overflow-hidden",
                    isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <p className="text-[#000000B2] text-[.875rem] lg:text-[.9375rem] font-normal px-5 lg:px-7 pb-4 lg:pb-5 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ─── Search sub-components (header) ──────────────────────────────────────────

const SearchDropdown = ({
  query,
  results,
  activeResult,
  loading,
  onSelect,
}: {
  query: string;
  results: PublicProductDetail[];
  activeResult: number;
  loading?: boolean;
  onSelect: (id: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.15 }}
    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#0000001A] rounded-[1.25rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-200"
  >
    {loading ? (
      <div className="flex items-center justify-center py-9">
        <Icon
          icon="svg-spinners:ring-resize"
          className="w-6 h-6 text-[#6EC93E]"
        />
      </div>
    ) : results.length > 0 ? (
      <>
        <p className="text-[.6875rem] font-semibold uppercase tracking-wider text-[#00000055] px-5 pt-3.5 pb-1">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;
          {query}&rdquo;
        </p>
        <div className="pb-2">
          {results.map((p, i) => (
            <button
              key={p.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(p.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3 text-left",
                i === activeResult ? "bg-[#F0F0F0]" : "hover:bg-[#F8F8F8]",
              )}
            >
              {p.baseImage && (
                <img
                  src={p.baseImage}
                  alt={p.title}
                  className="w-11 h-11 rounded-sm object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[.9375rem] font-medium text-black truncate">
                  {p.title}
                </p>
                {p.avgRating && <DisplayStars rating={p.avgRating} />}
              </div>
              <span className="text-[.9375rem] font-semibold text-[#DB4444] shrink-0">
                ₦{p.basePrice.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </>
    ) : (
      <div className="flex flex-col items-center py-9 gap-1.5">
        <div className="w-11 h-11 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-1">
          <Icon
            icon="mdi:magnify-remove-outline"
            className="w-5 h-5 text-[#00000040]"
          />
        </div>
        <p className="text-[.9375rem] font-medium text-black">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-[.8125rem] text-[#00000066] text-center max-w-52">
          Try a different term or browse all products
        </p>
      </div>
    )}
  </motion.div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const ProductDetail = ({ product }: { product: PublicProductDetail }) => {
  const router = useRouter();
  const {
    addItem,
    isFavorite,
    toggleFavorite,
    items: cartItems,
  } = useCartStore();
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  // ── header search state ──
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PublicProductDetail[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);

  const handleSearchChange = useCallback((v: string) => {
    setQuery(v);
    setActiveResult(-1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchIdRef.current++;
    if (!v.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchResults([]);
    setSearchLoading(true);
    const id = searchIdRef.current;
    searchDebounceRef.current = setTimeout(async () => {
      if (searchIdRef.current !== id) return;
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(v.trim())}&limit=6`,
        );
        if (searchIdRef.current !== id) return;
        const json = await res.json();
        setSearchResults(json.data ?? []);
      } catch {
        if (searchIdRef.current === id) setSearchResults([]);
      } finally {
        if (searchIdRef.current === id) setSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchSelect = useCallback(
    (id: string) => {
      router.push(`/collections/${id}`);
      setQuery("");
      setSearchFocused(false);
      setMobileSearchOpen(false);
      setActiveResult(-1);
    },
    [router],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveResult((p) => Math.min(p + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveResult((p) => Math.max(p - 1, -1));
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      setMobileSearchOpen(false);
    } else if (
      e.key === "Enter" &&
      activeResult >= 0 &&
      searchResults[activeResult]
    )
      handleSearchSelect(searchResults[activeResult].id);
  };

  useEffect(() => {
    if (mobileSearchOpen) {
      const t = setTimeout(() => mobileInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [mobileSearchOpen]);

  // ── product interaction state ──
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  const fav = isFavorite(product.id);
  const hasGroups = product.variantGroups.length > 0;
  const allSelected =
    hasGroups && product.variantGroups.every((g) => !!selection[g.name]);

  const activeImage = useMemo(() => {
    const ig = product.variantGroups.find((g) => g.influencesImage);
    if (ig && selection[ig.name]) {
      const e = ig.entries.find((e) => e.value === selection[ig.name]);
      if (e?.imageUrl) return e.imageUrl;
    }
    return product.baseImage;
  }, [product, selection]);

  const activePrice = useMemo(() => {
    const pg = product.variantGroups.find((g) => g.influencesPrice);
    if (pg && selection[pg.name]) {
      const e = pg.entries.find((e) => e.value === selection[pg.name]);
      if (e?.priceOverride != null) return e.priceOverride;
    }
    return product.basePrice;
  }, [product, selection]);

  const currentStock = useMemo(() => {
    if (!hasGroups) return product.stocks[0]?.quantity ?? 0;
    if (!allSelected) return null;
    return getStockForCombo(product.stocks, selection)?.quantity ?? 0;
  }, [hasGroups, allSelected, product.stocks, selection]);

  const canAddToCart = useMemo(() => {
    if (
      product.saleStatus === "closed" ||
      product.saleStatus === "opening_soon"
    )
      return false;
    if (!hasGroups) return (product.stocks[0]?.quantity ?? 0) > 0;
    if (!allSelected) return false;
    return (currentStock ?? 0) > 0;
  }, [
    product.saleStatus,
    product.stocks,
    hasGroups,
    allSelected,
    currentStock,
  ]);

  const maxQty = hasGroups
    ? (currentStock ?? 0)
    : (product.stocks[0]?.quantity ?? 0);

  const handleSelect = useCallback((groupName: string, value: string) => {
    setSelection((prev) => {
      if (prev[groupName] === value) {
        const next = { ...prev };
        delete next[groupName];
        return next;
      }
      return { ...prev, [groupName]: value };
    });
    setQty(1);
  }, []);

  // Cap qty whenever available stock drops below current selection
  const prevMaxRef = useRef(maxQty);
  if (maxQty !== prevMaxRef.current) {
    prevMaxRef.current = maxQty;
    if (maxQty > 0 && qty > maxQty) setQty(maxQty);
  }

  const handleAddToCart = useCallback(() => {
    if (!canAddToCart) return;
    addItem({
      productId: product.id,
      title: product.title,
      image: activeImage,
      variantCombo: selection,
      price: activePrice,
      qty,
      maxQty,
    });
    toast.success(`${product.title} added to cart!`);
    // No redirect — user may want to keep browsing
  }, [
    canAddToCart,
    product,
    activeImage,
    selection,
    activePrice,
    qty,
    maxQty,
    addItem,
  ]);

  const compactInputCls =
    "bg-[#EBEBEB] text-[.9375rem] w-full outline-none text-[#616161] h-13 pr-14 pl-5 rounded-[.875rem]";

  const TAB_ITEMS = ["Product Details", "Rating & Reviews", "FAQs"];
  const mobileTabFn = (label: string) => {
    function TabBtn(
      active: boolean,
      key: string,
      p: {
        onClick: () => void;
        ref: React.MutableRefObject<HTMLButtonElement | null> | null;
      },
    ) {
      return (
        <button
          key={key}
          ref={p.ref}
          onClick={p.onClick}
          className={cn(
            "p-[.75rem_1rem_.5rem_1rem] text-[.875rem] font-medium leading-5.5 whitespace-nowrap shrink-0 transition-colors",
            active ? "text-[#6EC93E]" : "text-[#00000099]",
          )}
        >
          {label}
        </button>
      );
    }
    return TabBtn;
  };

  return (
    <>
      {/* ── Fixed product header ─────────────────────────────────────────────── */}
      <header
        className={cn(
          satoshi.className,
          "fixed top-0 left-0 right-0 z-2 bg-white border-b border-[#0000001A]",
        )}
      >
        <div className="max-w-375 mx-auto px-4 lg:px-7.5 pt-23 md:pt-26 pb-4">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-black text-[1.25rem] lg:text-[1.625rem] mr-auto leading-none">
              {product.title}
            </h2>

            {/* Desktop: inline search */}
            <div className="hidden lg:block relative flex-1 max-w-xs">
              <input
                type="text"
                className={compactInputCls}
                placeholder="Search products…"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={handleKeyDown}
              />
              <Icon
                icon="mdi:magnify"
                className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[#616161]"
              />
              <AnimatePresence>
                {searchFocused && query && (
                  <SearchDropdown
                    query={query}
                    results={searchResults}
                    activeResult={activeResult}
                    loading={searchLoading}
                    onSelect={handleSearchSelect}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Mobile search toggle */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-[#F0F0F0] transition-colors active:scale-95"
              onClick={() => setMobileSearchOpen((p) => !p)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileSearchOpen ? "x" : "mag"}
                  initial={{ opacity: 0, rotate: -70 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 70 }}
                  transition={{ duration: 0.14 }}
                  className="block"
                >
                  <Icon
                    icon={mobileSearchOpen ? "mdi:close" : "mdi:magnify"}
                    className="w-6 h-6 text-black"
                  />
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Cart */}
            <button
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              onClick={() => router.push("/cart")}
              className="relative p-2 rounded-full hover:bg-[#F0F0F0] transition-colors active:scale-95"
            >
              <Icon icon="mdi:cart-outline" className="w-6 h-6 text-black" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-[#6EC93E] rounded-full flex items-center justify-center text-white text-[.6rem] font-bold leading-none"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile collapsible search */}
          <div className="lg:hidden">
            <AnimatePresence>
              {mobileSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    duration: 0.22,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <div className="pt-3 pb-1 relative">
                    <input
                      ref={mobileInputRef}
                      type="text"
                      className={compactInputCls}
                      placeholder="Search products…"
                      value={query}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      onKeyDown={handleKeyDown}
                    />
                    <Icon
                      icon="mdi:magnify"
                      className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[#616161]"
                    />
                    <AnimatePresence>
                      {searchFocused && query && (
                        <SearchDropdown
                          query={query}
                          results={searchResults}
                          activeResult={activeResult}
                          loading={searchLoading}
                          onSelect={handleSearchSelect}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <section
        className={cn(
          satoshi.className,
          "pt-40 md:pt-44 pb-12 max-w-370 mx-auto lg:px-7.5 px-4",
        )}
      >
        {/* Product hero */}
        <div className="flex max-lg:flex-col lg:flex-row mb-10 lg:mb-20 gap-6 lg:gap-10 items-start">
          {/* Image */}
          <figure className="max-lg:w-full lg:w-152.5 aspect-[1.151] shrink-0 relative overflow-hidden rounded-sm">
            {activeImage ? (
              <img
                className="w-full h-full object-cover transition-all duration-500"
                alt={product.title}
                src={activeImage}
              />
            ) : (
              <div className="w-full h-full bg-[#F0F0F0] flex items-center justify-center">
                <Icon
                  icon="solar:image-bold-duotone"
                  className="w-16 h-16 text-[#D0D0D0]"
                />
              </div>
            )}
            <DetailImageOverlay saleStatus={product.saleStatus} />
            <button
              suppressHydrationWarning
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm z-1 transition-transform active:scale-90"
            >
              <Icon
                suppressHydrationWarning
                icon={fav ? "solar:heart-bold" : "solar:heart-outline"}
                className={cn(
                  "w-5 h-5 transition-colors",
                  fav ? "text-[#6EC93E]" : "text-[#374151]",
                )}
              />
            </button>
          </figure>

          {/* Info */}
          <div className="flex-1">
            <h1
              className={cn(
                poppins.className,
                "text-[1.5rem] lg:text-[2rem] text-black font-semibold mb-3.5 leading-tight",
              )}
            >
              {product.title}
            </h1>

            {product.avgRating !== null && (
              <div className="flex mb-3.5 items-center gap-4">
                <DisplayStars rating={product.avgRating} size="md" />
                <span className="text-[1rem] font-normal text-[#00000099]">
                  <span className="text-[#6EC93E]">
                    {product.avgRating.toFixed(1)}/
                  </span>
                  5
                </span>
              </div>
            )}

            <h4 className="text-[2rem] font-bold text-[#DB4444] mb-5">
              ₦{activePrice.toLocaleString()}
            </h4>

            {product.description && (
              <p className="text-[#00000099] leading-5.5 text-[1rem] font-normal mb-6 max-w-[90%] line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Variant groups */}
            <div className="flex flex-col gap-4 mb-4">
              {product.variantGroups.map((g: PublicVariantGroup) => (
                <div key={g.id}>
                  <hr className="h-px w-full bg-[#0000001A] border-[#0000001A] mb-4" />
                  <span className="text-[#00000099] font-normal text-[1rem] block mb-3">
                    Choose{" "}
                    <span className="text-[#6EC93E] font-medium">{g.name}</span>
                    {selection[g.name] && (
                      <span className="text-black font-medium ml-1">
                        : {selection[g.name]}
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2.5 flex-wrap">
                    {g.entries.map((entry) => {
                      // Exclude the current group from the selection check so siblings within
                      // the same group are never incorrectly greyed out.
                      const selectionForCheck = Object.fromEntries(
                        Object.entries(selection).filter(([k]) => k !== g.name),
                      );
                      const available =
                        Object.keys(selectionForCheck).length === 0
                          ? isEntryAvailableInitial(
                              product.stocks,
                              g.name,
                              entry.value,
                            )
                          : isEntryAvailable(
                              product.stocks,
                              g.name,
                              entry.value,
                              selectionForCheck,
                            );
                      const selected = selection[g.name] === entry.value;

                      return (
                        <button
                          key={entry.id}
                          onClick={() =>
                            available && handleSelect(g.name, entry.value)
                          }
                          disabled={!available}
                          className={cn(
                            "text-[.875rem] lg:text-[1rem] font-normal p-[.5rem_1rem] lg:p-[.75rem_1.5rem] transition-all duration-200 rounded-[3.875rem]",
                            selected
                              ? "text-white bg-[#6EC93E]"
                              : available
                                ? "text-[#00000099] bg-[#F0F0F0] hover:bg-[#E8E8E8]"
                                : "text-[#C0C0C0] bg-[#F5F5F5] cursor-not-allowed line-through",
                          )}
                        >
                          {entry.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <hr className="h-px w-full bg-[#0000001A] mb-6 border-[#0000001A]" />

            {/* Stock hints */}
            {currentStock !== null && currentStock <= 5 && currentStock > 0 && (
              <p className="text-amber-600 text-[0.875rem] mb-3 font-medium">
                Only {currentStock} left in stock!
              </p>
            )}
            {currentStock === 0 && allSelected && (
              <p className="text-red-500 text-[0.875rem] mb-3 font-medium">
                This combination is out of stock.
              </p>
            )}
            {!hasGroups &&
              (product.stocks[0]?.quantity ?? 0) <= 5 &&
              (product.stocks[0]?.quantity ?? 0) > 0 && (
                <p className="text-amber-600 text-[0.875rem] mb-3 font-medium">
                  Only {product.stocks[0]?.quantity} left!
                </p>
              )}

            {/* Add to Cart controls */}
            {product.saleStatus !== "closed" &&
              product.saleStatus !== "opening_soon" && (
                <div className="flex gap-5">
                  <div className="flex items-center rounded-[3.875rem] bg-[#F0F0F0] p-[.625rem_.875rem] lg:p-[1rem_1.25rem] gap-5 lg:gap-9.5">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className={cn(
                        "h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center transition-opacity",
                        qty <= 1 && "opacity-30 cursor-not-allowed",
                      )}
                    >
                      <Icon
                        icon="mdi:minus"
                        className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 xl:w-5 xl:h-5 text-[#6EC93E]"
                      />
                    </button>
                    <span className="text-[#6EC93E] font-medium text-[.9375rem] lg:text-[1rem]">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(q + 1, maxQty))}
                      disabled={qty >= maxQty || maxQty === 0}
                      className={cn(
                        "h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center transition-opacity",
                        (qty >= maxQty || maxQty === 0) &&
                          "opacity-30 cursor-not-allowed",
                      )}
                    >
                      <Icon
                        icon="mdi:plus"
                        className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 xl:w-5 xl:h-5 text-[#6EC93E]"
                      />
                    </button>
                  </div>
                  <button
                    suppressHydrationWarning
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className={cn(
                      "py-3 lg:py-4 text-white font-medium rounded-[3.875rem] text-[.875rem] lg:text-[1rem] flex-1 transition-colors",
                      canAddToCart
                        ? "bg-[#6EC93E] hover:bg-[#5cb535]"
                        : "bg-[#D0D0D0] cursor-not-allowed",
                    )}
                  >
                    {!hasGroups || allSelected
                      ? "Add to Cart"
                      : "Select Options"}
                  </button>
                </div>
              )}

            {product.saleStatus === "closed" && (
              <div className="py-4 px-6 bg-[#F3F4F6] rounded-[3.875rem] text-center text-[#6B7280] font-medium">
                Sales have closed for this product
              </div>
            )}
            {product.saleStatus === "opening_soon" && (
              <div className="py-4 px-6 bg-[#6EC93E]/10 rounded-[3.875rem] text-center text-[#3a7a1e] font-medium">
                Coming soon — check back later
              </div>
            )}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden mb-10">
          <Tab
            tabs={[
              mobileTabFn("Product Details"),
              mobileTabFn("Rating & Reviews"),
              mobileTabFn("FAQs"),
            ]}
            tabChildren={[
              <ProductDetailsTab key="details" about={product.about} />,
              <ReviewsTab
                key="reviews"
                product={product}
                openModal={() => setReviewModalOpen(true)}
              />,
              <FAQsTab key="faqs" faqs={product.faqs} />,
            ]}
            activeLineProps={{
              className: "!bg-[#6EC93E] !h-[3px] !rounded-full",
            }}
            buttonContainerProps={{
              className: "border-[#F0F0F0]",
            }}
            scrollerClassName="overflow-x-auto no-scrollbar"
            contentProps={{ className: "pt-6" }}
          />
        </div>

        {/* Desktop tabs */}
        <div className="hidden lg:flex mb-12 w-fit gap-78.5 mx-auto">
          {TAB_ITEMS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={cn(
                "font-normal leading-5.5 text-[1.25rem] transition-colors duration-200",
                activeTab === i ? "text-[#6EC93E]" : "text-[#00000099]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="hidden lg:block mb-17.5">
          <div className={cn(activeTab !== 0 && "hidden")}>
            <ProductDetailsTab about={product.about} />
          </div>
          <div className={cn(activeTab !== 1 && "hidden")}>
            <ReviewsTab
              product={product}
              openModal={() => setReviewModalOpen(true)}
            />
          </div>
          <div className={cn(activeTab !== 2 && "hidden")}>
            <FAQsTab faqs={product.faqs} />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {reviewModalOpen && (
          <WriteReviewModal
            productId={product.id}
            onClose={() => setReviewModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetail;
