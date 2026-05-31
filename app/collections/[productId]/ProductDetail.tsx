/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type MutableRefObject,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { poppins, satoshi } from "@/app/layout";
import { Input } from "@/components";
import { cn, parseMarkdown } from "@/lib";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tab } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import {
  MOCK_PRODUCTS, ALL_REVIEWS, PRODUCT_DETAILS_MD, PRODUCT_FAQS, type Product, type Review,
  SORT_OPTIONS, type SortOption, SIZES, REVIEWS_PER_PAGE, TAB_ITEMS,
  reviewSchema, type ReviewFormData,
} from "@/data";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabBtnProps = {
  onClick: () => void;
  ref: MutableRefObject<HTMLButtonElement | null> | null;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          i < rating ? "text-[#FFAD33]" : "text-[#757575]",
        )}
      />
    ))}
  </div>
);

const ResultRow = ({
  product,
  active,
  onSelect,
}: {
  product: Product;
  active: boolean;
  onSelect: () => void;
}) => (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={onSelect}
    className={cn(
      "w-full flex items-center gap-3 px-5 py-3 text-left",
      active ? "bg-[#F0F0F0]" : "hover:bg-[#F8F8F8]",
    )}
  >
    <img
      src={product.image}
      alt={product.name}
      className="w-11 h-11 rounded-sm object-cover shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-[.9375rem] font-medium text-black truncate leading-5.5">
        {product.name}
      </p>
      <DisplayStars rating={product.rating} />
    </div>
    <span className="text-[.9375rem] font-semibold text-[#DB4444] shrink-0">
      {product.price}
    </span>
  </button>
);

const SearchDropdown = ({
  query,
  results,
  activeResult,
  onSelect,
}: {
  query: string;
  results: Product[];
  activeResult: number;
  onSelect: (product: Product) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#0000001A] rounded-[1.25rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-[200]"
  >
    {results.length > 0 ? (
      <>
        <p className="text-[.6875rem] font-semibold uppercase tracking-wider text-[#00000055] px-5 pt-3.5 pb-1">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;
          {query}&rdquo;
        </p>
        <div className="pb-2">
          {results.map((p, i) => (
            <ResultRow
              key={p.id}
              product={p}
              active={i === activeResult}
              onSelect={() => onSelect(p)}
            />
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
          Try a different term or browse all products below
        </p>
      </div>
    )}
  </motion.div>
);

const SortDropdown = ({
  sort,
  setSort,
}: {
  sort: SortOption;
  setSort: (s: SortOption) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center bg-[#F0F0F0] gap-2 p-[.5rem_.875rem] sm:gap-2.5 sm:p-[.8125rem_1.25rem] rounded-[3.875rem] font-medium text-[.875rem] sm:text-[1rem] text-[#6EC93E]"
      >
        {sort}
        <Icon
          icon="uiw:down"
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 bg-white border border-[#0000001A] rounded-[1rem] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-10 min-w-44"
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

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="border flex flex-col border-[#0000001A] rounded-[1.25rem] p-[1.25rem_1.25rem] sm:p-[1.75rem_2rem]">
    <div className="flex justify-between items-center mb-3.5">
      <DisplayStars rating={review.rating} size="md" />
    </div>
    <div className="flex items-center mb-3 gap-1">
      <span className="font-bold text-[1.125rem] leading-5.5 text-[#6EC93E]">
        {review.name}
      </span>
      {review.verified && (
        <Icon
          className="w-5 h-5 text-[#01AB31]"
          icon="lets-icons:check-round-fill"
        />
      )}
    </div>
    <div className="flex-1 flex flex-col justify-between gap-5">
      <p className="font-normal text-[.9375rem] leading-5.5 text-[#00000099]">
        &ldquo;{review.content}&rdquo;
      </p>
      <small className="text-[.875rem] font-medium leading-5.5 text-[#00000066]">
        Posted on{" "}
        {new Date(review.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </small>
    </div>
  </div>
);

const WriteReviewModal = ({ onClose }: { onClose: () => void }) => {
  const [hoverRating, setHoverRating] = useState(0);

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

  const onSubmit = (data: ReviewFormData) => {
    console.log("Review submitted:", data);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
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
            className={errors.name?.message ? undefined : "border-[#D0D5DD]"}
            {...register("name")}
          />
        </div>

        <div className="mb-7">
          <Input
            label="Your Review"
            type="textarea"
            placeholder="Share your experience with this product..."
            error={errors.review?.message}
            className={errors.review?.message ? undefined : "border-[#D0D5DD]"}
            {...register("review")}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="w-full py-4 bg-[#6EC93E] text-white font-medium text-[1rem] rounded-[3.875rem] hover:bg-[#5cb535] transition-colors"
        >
          Submit Review
        </button>
      </motion.div>
    </motion.div>
  );
};

const ProductDetailsTab = () => {
  const html = parseMarkdown(PRODUCT_DETAILS_MD);
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#6EC93E] text-[1.25rem] sm:text-[1.5rem] font-bold">
          About This Product
        </span>
      </div>
      <div
        className={cn(
          "text-[#000000B2] leading-relaxed max-w-2xl",
          "[&_h2]:text-black [&_h2]:font-semibold [&_h2]:text-[1.125rem] [&_h2]:mb-2 [&_h2]:mt-6",
          "[&_p]:text-[.9375rem] [&_p]:mb-3 [&_p]:leading-6",
          "[&_em]:italic [&_em]:text-[#00000066]",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5",
          "[&_li]:text-[.9375rem] [&_li]:leading-6",
          "[&_strong]:font-semibold [&_strong]:text-black",
          "[&_code]:bg-[#F0F0F0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[.8125rem] [&_code]:font-mono [&_code]:text-[#6EC93E]",
          "[&_hr]:border-none [&_hr]:h-px [&_hr]:bg-[#0000001A] [&_hr]:my-6",
          "[&_a]:text-[#6EC93E] [&_a]:underline [&_a]:underline-offset-2",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
};

const ReviewsTab = ({ openModal }: { openModal: () => void }) => {
  const [sort, setSort] = useState<SortOption>("Latest");
  const [page, setPage] = useState(1);

  const sortedReviews = useMemo(() => {
    return [...ALL_REVIEWS].sort((a, b) => {
      switch (sort) {
        case "Latest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "Oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "Highest Rating":
          return b.rating - a.rating;
        case "Lowest Rating":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }, [sort]);

  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);
  const visibleReviews = sortedReviews.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE,
  );

  const handleSortChange = (s: SortOption) => {
    setSort(s);
    setPage(1);
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <>
      <div className="flex mb-6 flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-[#6EC93E] text-[1.25rem] sm:text-[1.5rem] font-bold">
            All Reviews
          </span>
          <span className="text-[1rem] font-normal text-[#00000099]">
            (451)
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <SortDropdown sort={sort} setSort={handleSortChange} />
          <button
            onClick={openModal}
            className="flex items-center bg-[#6EC93E] font-medium gap-1.5 p-[.5rem_1rem] sm:gap-2 sm:p-[.8125rem_1.875rem] rounded-[3.875rem] text-[.875rem] sm:text-[1rem] text-white"
          >
            Write a Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        <span className="text-[.875rem] text-[#00000066] font-normal select-none">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
            canPrev
              ? "border-[#6EC93E] text-[#6EC93E] hover:bg-[#6EC93E] hover:text-white"
              : "border-[#D9D9D9] text-[#D9D9D9] cursor-not-allowed",
          )}
        >
          <Icon icon="hugeicons:arrow-left-02" className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
            canNext
              ? "border-[#6EC93E] text-[#6EC93E] hover:bg-[#6EC93E] hover:text-white"
              : "border-[#D9D9D9] text-[#D9D9D9] cursor-not-allowed",
          )}
        >
          <Icon icon="hugeicons:arrow-right-02" className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

const FAQsTab = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#6EC93E] text-[1.25rem] sm:text-[1.5rem] font-bold">
          FAQs
        </span>
      </div>
      <div className="flex flex-col gap-2 lg:gap-3 max-w-2xl lg:max-w-4xl">
        {PRODUCT_FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
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
                    isOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </button>
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
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
    </>
  );
};

function mobileTabFn(label: string) {
  function TabBtn(active: boolean, key: string, p: TabBtnProps) {
    return (
      <button
        key={key}
        ref={p.ref}
        onClick={p.onClick}
        className={cn(
          "p-[.75rem_1rem_.5rem_1rem] text-[.875rem] font-medium leading-5.5 transition-colors duration-200 whitespace-nowrap shrink-0",
          active ? "text-[#6EC93E]" : "text-[#00000099]",
        )}
      >
        {label}
      </button>
    );
  }
  return TabBtn;
}

// ─── Main component ───────────────────────────────────────────────────────────

const ProductDetail = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeResult, setActiveResult] = useState(-1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(1);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("Small");
  const [qty, setQty] = useState(1);

  const results = useMemo(
    () =>
      query.length >= 1
        ? MOCK_PRODUCTS.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase()),
          ).slice(0, 6)
        : [],
    [query],
  );

  const handleSelect = useCallback(
    (product: Product) => {
      router.push(`/collections/${product.id}`);
      setQuery("");
      setSearchFocused(false);
      setMobileSearchOpen(false);
      setActiveResult(-1);
    },
    [router],
  );

  const handleChange = useCallback((v: string) => {
    setQuery(v);
    setActiveResult(-1);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveResult((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveResult((p) => Math.max(p - 1, -1));
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      setMobileSearchOpen(false);
    } else if (
      e.key === "Enter" &&
      activeResult >= 0 &&
      results[activeResult]
    ) {
      handleSelect(results[activeResult]);
    }
  };

  useEffect(() => {
    if (mobileSearchOpen) {
      const t = setTimeout(() => mobileInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [mobileSearchOpen]);

  const compactInputCls =
    "bg-[#EBEBEB] text-[.9375rem] w-full outline-none text-[#616161] h-13 pr-14 pl-5 rounded-[.875rem]";

  const openReviewModal = useCallback(() => setReviewModalOpen(true), []);

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
              Product Detail
            </h2>

            {/* Desktop: inline search */}
            <div className="hidden lg:block relative flex-1 max-w-xs">
              <input
                type="text"
                className={compactInputCls}
                placeholder="Search products…"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
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
                    results={results}
                    activeResult={activeResult}
                    onSelect={handleSelect}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Mobile/tablet: search toggle */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-[#F0F0F0] transition-colors active:scale-95"
              onClick={() => setMobileSearchOpen((p) => !p)}
              aria-label={mobileSearchOpen ? "Close search" : "Search products"}
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
              aria-label="Cart"
              className="relative p-2 rounded-full hover:bg-[#F0F0F0] transition-colors active:scale-95"
            >
              <Icon icon="mdi:cart-outline" className="w-6 h-6 text-black" />
            </button>
          </div>

          {/* Mobile: collapsible search row */}
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
                      onChange={(e) => handleChange(e.target.value)}
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
                          results={results}
                          activeResult={activeResult}
                          onSelect={handleSelect}
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
          <figure className="max-lg:w-full lg:w-152.5 aspect-[1.151] shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="Product Image"
              src="/images/product-image.png"
            />
          </figure>

          <div className="flex-1">
            <h1
              className={cn(
                poppins.className,
                "text-[1.5rem] lg:text-[2rem] text-black font-semibold mb-3.5 leading-tight",
              )}
            >
              Unchain Summer (Women Merch)
            </h1>

            <div className="flex mb-3.5 items-center gap-4">
              <DisplayStars rating={3} size="md" />
              <span className="text-[1rem] font-normal text-[#00000099]">
                <span className="text-[#6EC93E]">3/</span>5
              </span>
            </div>

            <h4 className="text-[2rem] font-bold text-[#DB4444] mb-5">$260</h4>

            <p className="text-[#00000099] leading-5.5 text-[1rem] font-normal mb-6 max-w-[90%]">
              This graphic t-shirt which is perfect for any occasion. Crafted
              from a soft and breathable fabric, it offers superior comfort and
              style.
            </p>

            <div className="flex flex-col gap-6 mb-6">
              {Array.from({ length: 2 }, (_, i) => (
                <hr
                  key={i}
                  className="h-px w-full bg-[#0000001A] border-[#0000001A]"
                />
              ))}
            </div>

            <span className="text-[#00000099] font-normal text-[1rem] block mb-4">
              Choose Size
            </span>
            <div className="flex mb-6 gap-3 flex-wrap">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "text-[.875rem] lg:text-[1rem] font-normal p-[.5rem_1rem] lg:p-[.75rem_1.5rem] transition-all duration-200 rounded-[3.875rem]",
                    selectedSize === size
                      ? "text-white bg-[#6EC93E]"
                      : "text-[#00000099] bg-[#F0F0F0]",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            <hr className="h-px w-full bg-[#0000001A] mb-6 border-[#0000001A]" />

            <div className="flex gap-5">
              <div className="flex items-center rounded-[3.875rem] bg-[#F0F0F0] p-[.625rem_.875rem] lg:p-[1rem_1.25rem] gap-5 lg:gap-9.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center"
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
                  onClick={() => setQty((q) => q + 1)}
                  className="h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center"
                >
                  <Icon
                    icon="mdi:plus"
                    className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 xl:w-5 xl:h-5 text-[#6EC93E]"
                  />
                </button>
              </div>
              <button className="py-3 lg:py-4 text-white font-medium rounded-[3.875rem] text-[.875rem] lg:text-[1rem] flex-1 bg-[#6EC93E] hover:bg-[#5cb535] transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab component (max-lg: mobile + tablet) — sliding green line ──── */}
        <div className="lg:hidden mb-10">
          <Tab
            tabs={[
              mobileTabFn("Product Details"),
              mobileTabFn("Rating & Reviews"),
              mobileTabFn("FAQs"),
            ]}
            tabChildren={[
              <ProductDetailsTab key="details" />,
              <ReviewsTab key="reviews" openModal={openReviewModal} />,
              <FAQsTab key="faqs" />,
            ]}
            activeLineProps={{
              className: "!bg-[#6EC93E] !h-[3px] !rounded-full",
            }}
            buttonContainerProps={{
              className: "border-[#F0F0F0] overflow-x-auto no-scrollbar",
            }}
            contentProps={{ className: "pt-6" }}
          />
        </div>

        {/* ── Tab bar (lg: original design) ─────────────────────────────────── */}
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
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab content (lg) — all mounted, hidden/shown */}
        <div className="hidden lg:block mb-17.5">
          <div className={cn(activeTab !== 0 && "hidden")}>
            <ProductDetailsTab />
          </div>
          <div className={cn(activeTab !== 1 && "hidden")}>
            <ReviewsTab openModal={openReviewModal} />
          </div>
          <div className={cn(activeTab !== 2 && "hidden")}>
            <FAQsTab />
          </div>
        </div>
      </section>

      {/* ── Write Review Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {reviewModalOpen && (
          <WriteReviewModal onClose={() => setReviewModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetail;
