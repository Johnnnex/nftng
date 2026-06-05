"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { CollectionsHeader, FAQs, StaggerContainer, StaggerItem } from "@/components";
import { ProductCard } from "@/components";
import { useCollectionsStore } from "@/store";
import type { PublicProduct } from "@/data";

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

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-2 md:mb-8 lg:mb-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      <FAQs />
    </>
  );
};

export default Collections;
