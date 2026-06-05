"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { poppins, satoshi, monumentExtended } from "@/app/layout";
import { CollectionsHeader, FAQs, StaggerContainer, StaggerItem } from "@/components";
import { ProductCard } from "@/components";
import { useCollectionsStore } from "@/store";
import type { PublicProduct } from "@/data";

// ── Empty state ───────────────────────────────────────────────────────────────

function CollectionsEmpty() {
  return (
    <>
      <div className="relative flex flex-col items-center justify-center px-4 py-28 overflow-hidden min-h-[55vh]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-80 rounded-full bg-[#6EC93E]/10 blur-[120px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#6EC93E 1px, transparent 1px), linear-gradient(90deg, #6EC93E 1px, transparent 1px)",
            backgroundSize: "3.5rem 3.5rem",
          }}
        />

        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-[#6EC93E]/10 border border-[#6EC93E]/20 flex items-center justify-center">
            <Icon icon="solar:bag-bold-duotone" className="w-12 h-12 text-[#6EC93E]" />
          </div>
          {[
            { icon: "solar:tag-bold-duotone", pos: "-top-3 -right-3", delay: "0s" },
            { icon: "solar:star-bold-duotone", pos: "-bottom-3 -left-3", delay: "0.4s" },
            { icon: "solar:t-shirt-bold-duotone", pos: "-bottom-3 -right-6", delay: "0.8s" },
          ].map(({ icon, pos, delay }) => (
            <div
              key={icon}
              className={`absolute ${pos} w-9 h-9 rounded-xl bg-white border border-[#6EC93E]/25 shadow-sm flex items-center justify-center`}
              style={{ animation: `float 3s ease-in-out ${delay} infinite alternate` }}
            >
              <Icon icon={icon} className="w-4.5 h-4.5 text-[#6EC93E]" />
            </div>
          ))}
        </div>

        <h2
          className={cn(
            monumentExtended.className,
            "text-[#111827] text-[2rem] sm:text-[2.5rem] font-extrabold text-center leading-tight mb-3",
          )}
        >
          New drops incoming
        </h2>
        <p
          className={cn(
            satoshi.className,
            "text-[#6B7280] text-center text-[1rem] max-w-sm leading-relaxed mb-8",
          )}
        >
          No products are live right now — exclusive Unchain Summer 2026 merchandise is on its way.
        </p>
        <Link
          href="/"
          className={cn(
            poppins.className,
            "px-6 py-3 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem] rounded-2xl transition-colors",
          )}
        >
          Back to home
        </Link>
      </div>
      <style jsx global>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const Collections = () => {
  const { products, total, loading, fetchMore } = useCollectionsStore();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = products.length < total;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) fetchMore(); },
      { rootMargin: "0px 0px 100px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, fetchMore]);

  return (
    <>
      <CollectionsHeader />

      {!loading && total === 0 ? (
        <CollectionsEmpty />
      ) : (
        <section className="px-4 lg:px-7.5 max-w-375 mx-auto">
          <StaggerContainer className="mt-4 md:mt-11.75 md:mb-11.75 mb-8 gap-7.5 grid sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p: PublicProduct, index: number) => (
              <StaggerItem key={p.id + index}>
                <ProductCard
                  id={p.id}
                  image={p.baseImage}
                  title={p.title}
                  price={p.basePrice}
                  avgRating={p.avgRating}
                  reviewCount={p.reviewCount}
                  saleStatus={p.saleStatus}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div ref={sentinelRef} className="h-1" />

          {loading && (
            <div className="flex justify-center mb-8">
              <Icon icon="svg-spinners:ring-resize" className="w-8 h-8 text-[#6EC93E]" />
            </div>
          )}
        </section>
      )}

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-2 md:mb-8 lg:mb-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      <FAQs />
    </>
  );
};

export default Collections;
