/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { WordByWord, useReducedMotion } from "@/components";
import { SEARCH_PRODUCTS as MOCK_PRODUCTS, type SearchProduct as Product } from "@/app/collections/collections.data";

// ─── Sub-components ───────────────────────────────────────────────────────────

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-px">
    {Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        icon="iconoir:star-solid"
        className={cn(
          "w-3.5 h-3.5",
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
    onMouseDown={(e) => e.preventDefault()} // keep input focused so onBlur delay isn't needed
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
      <Stars rating={product.rating} />
    </div>
    <span className="text-[.9375rem] font-semibold text-[#DB4444] shrink-0">
      {product.price}
    </span>
  </button>
);

const Dropdown = ({
  query,
  results,
  activeResult,
  onSelect,
}: {
  query: string;
  results: Product[];
  activeResult: number;
  onSelect: (name: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#0000001A] rounded-[1.25rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-3"
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
              onSelect={() => onSelect(p.name)}
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

// ─── Main component ───────────────────────────────────────────────────────────
const CollectionsHeader = () => {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Coordinated scroll-driven opacity: hero fades out as compact fades in
  const heroOpacity = useTransform(scrollY, [80, 220], [1, 0]);
  const compactOpacity = useTransform(scrollY, [120, 220], [0, 1]);

  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [heroFocused, setHeroFocused] = useState(false);
  const [compactFocused, setCompactFocused] = useState(false);

  useEffect(() => {
    let prev = false;
    return scrollY.on("change", (v) => {
      const next = v > 180;
      setScrolled(next);
      if (next !== prev) {
        setHeroFocused(false);
        setCompactFocused(false);
        if (!next) setMobileSearchOpen(false);
        prev = next;
      }
    });
  }, [scrollY]);

  const [query, setQuery] = useState("");
  const [activeResult, setActiveResult] = useState(-1);
  const cartCount = 0; // wire to real cart state when ready

  const results =
    query.length >= 1
      ? MOCK_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 6)
      : [];

  const handleChange = useCallback((v: string) => {
    setQuery(v);
    setActiveResult(-1);
  }, []);

  const handleSelect = useCallback((name: string) => {
    setQuery(name);
    setActiveResult(-1);
    setHeroFocused(false);
    setCompactFocused(false);
    setMobileSearchOpen(false);
  }, []);

  const makeKeyHandler =
    (focused: boolean, setFocused: (v: boolean) => void) =>
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveResult((p) => Math.min(p + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveResult((p) => Math.max(p - 1, -1));
      } else if (e.key === "Escape") {
        setFocused(false);
        setMobileSearchOpen(false);
      } else if (
        e.key === "Enter" &&
        activeResult >= 0 &&
        results[activeResult]
      ) {
        handleSelect(results[activeResult].name);
      }
    };

  const compactInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus mobile search when expanded
  useEffect(() => {
    if (mobileSearchOpen) {
      const t = setTimeout(() => compactInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [mobileSearchOpen]);

  // Shared input class (hero size)
  const heroInputCls =
    "bg-[#EBEBEB] text-[.9375rem] md:text-[1rem] w-full outline-none text-[#616161] h-13 md:h-18.5 pr-14 pl-5 md:pr-20 md:pl-9.5 rounded-[.875rem]";
  // Compact header input class
  const compactInputCls =
    "bg-[#EBEBEB] text-[.9375rem] w-full outline-none text-[#616161] h-13 pr-14 pl-5 rounded-[.875rem]";

  return (
    <>
      {/* ── Hero: large centered title + full-height search ──────────────── */}
      <motion.section
        style={{
          opacity: reduced ? (scrolled ? 0 : 1) : heroOpacity,
          pointerEvents: scrolled ? "none" : "auto",
        }}
        className="relative z-2 pt-33.75 md:pt-44.25 pb-8 md:pb-14 px-4 lg:px-7.5 max-w-375 mx-auto"
      >
        <WordByWord
          text="Explore our exclusive collections"
          as="h1"
          className="text-[2.375rem] md:text-[3.125rem] leading-8.5 md:leading-14.5 font-medium max-w-120 md:max-w-186.25 mx-auto mb-10 md:mb-20 text-center justify-center text-black"
        />

        {/* Original-style search bar */}
        <div className="relative w-full md:w-[96%] mx-auto">
          <input
            type="text"
            className={heroInputCls}
            placeholder="Search your preferred products here..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setHeroFocused(true)}
            onBlur={() => setHeroFocused(false)}
            onKeyDown={makeKeyHandler(heroFocused, setHeroFocused)}
          />
          <Icon
            icon="mdi:magnify"
            className="w-5 h-5 md:w-7 md:h-7 lg:w-10 lg:h-10 absolute right-4 md:right-5 lg:right-6 top-1/2 -translate-y-1/2 text-[#616161]"
          />
          <AnimatePresence>
            {heroFocused && query && (
              <Dropdown
                query={query}
                results={results}
                activeResult={activeResult}
                onSelect={handleSelect}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ── Compact fixed header ─────────────────────────────────────────── */}
      {/*
        top-20 (80px) — sits just below the fixed site nav (top-4 + ~64px height).
        Adjust if your nav renders taller at any breakpoint.
        z-[2] keeps it below the nav (z-3); dropdown uses z-[200].
      */}
      <motion.header
        style={{
          opacity: reduced ? (scrolled ? 1 : 0) : compactOpacity,
          pointerEvents: scrolled ? "auto" : "none",
        }}
        className="fixed top-0 left-0 right-0 z-2 bg-white border-b border-[#0000001A]"
        aria-hidden={!scrolled}
      >
        <div className="max-w-375 mx-auto px-4 lg:px-7.5 pt-23 md:pt-26 pb-4">
          {/* Title + actions row */}
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-black text-[1.25rem] lg:text-[1.625rem] mr-auto leading-none">
              Our Products
            </h2>

            {/* Desktop: inline search bar */}
            <div className="hidden lg:block relative flex-1 max-w-xs">
              <input
                type="text"
                className={compactInputCls}
                placeholder="Search products…"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setCompactFocused(true)}
                onBlur={() => setCompactFocused(false)}
                onKeyDown={makeKeyHandler(compactFocused, setCompactFocused)}
              />
              <Icon
                icon="mdi:magnify"
                className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[#616161]"
              />
              <AnimatePresence>
                {compactFocused && query && (
                  <Dropdown
                    query={query}
                    results={results}
                    activeResult={activeResult}
                    onSelect={handleSelect}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Mobile / tablet: search icon toggles a row below */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-[#F0F0F0] transition-colors active:scale-95"
              onClick={() => setMobileSearchOpen((p) => !p)}
              aria-label={mobileSearchOpen ? "Close search" : "Search products"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileSearchOpen ? "x" : "mag"}
                  initial={reduced ? {} : { opacity: 0, rotate: -70 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={reduced ? {} : { opacity: 0, rotate: 70 }}
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

          {/* Mobile: collapsible search row */}
          <div className="lg:hidden">
            <AnimatePresence>
              {mobileSearchOpen && (
                <motion.div
                  initial={reduced ? {} : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? {} : { opacity: 0, y: -6 }}
                  transition={{
                    duration: 0.22,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <div className="pt-3 pb-1 relative">
                    <input
                      ref={compactInputRef}
                      type="text"
                      className={compactInputCls}
                      placeholder="Search products…"
                      value={query}
                      onChange={(e) => handleChange(e.target.value)}
                      onFocus={() => setCompactFocused(true)}
                      onBlur={() => setCompactFocused(false)}
                      onKeyDown={makeKeyHandler(
                        compactFocused,
                        setCompactFocused,
                      )}
                    />
                    <Icon
                      icon="mdi:magnify"
                      className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[#616161]"
                    />
                    <AnimatePresence>
                      {compactFocused && query && (
                        <Dropdown
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
      </motion.header>
    </>
  );
};

export { CollectionsHeader };
