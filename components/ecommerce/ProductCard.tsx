/* eslint-disable @next/next/no-img-element */
"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { SALE_STATUS_OVERLAY } from "@/data";
import { useCartStore } from "@/store";
import type { SaleStatus } from "@/data";

type ProductCardProps = {
  id: string;
  image: string | null;
  title: string;
  price: number;
  avgRating: number | null;
  reviewCount: number;
  saleStatus: SaleStatus;
};

// ─── Status overlay strip ─────────────────────────────────────────────────────
// Inspired by CollectionsComingSoon marquee — bold horizontal strip across the image.

const StatusStrip = ({ saleStatus }: { saleStatus: SaleStatus }) => {
  const overlay = SALE_STATUS_OVERLAY[saleStatus];
  if (!overlay) return null;

  const isFullOverlay =
    saleStatus === "out_of_stock" || saleStatus === "closed";

  if (isFullOverlay) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2",
          overlay.bg,
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
              style={{ animationDuration: "20s" }}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-[1rem] font-bold tracking-widest uppercase py-4 px-8 whitespace-nowrap shrink-0 opacity-80",
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
  }

  // Badge strip — mid-bottom of image for lesser priority states
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 py-2 px-3 flex items-center justify-center gap-1.5",
        overlay.bg,
      )}
    >
      <span
        className={cn(
          "text-[0.75rem] font-bold uppercase tracking-widest",
          overlay.text,
        )}
      >
        {overlay.label}
      </span>
    </div>
  );
};

// ─── Star display ─────────────────────────────────────────────────────────────

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-px">
    {Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        icon="iconoir:star-solid"
        className={cn(
          "w-4 h-4",
          i < Math.round(rating) ? "text-[#FFAD33]" : "text-[#D9D9D9]",
        )}
      />
    ))}
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────

const ProductCard = ({
  id,
  image,
  title,
  price,
  avgRating,
  reviewCount,
  saleStatus,
}: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useCartStore();
  const fav = isFavorite(id);

  // Determine if any overlay should show (hide "View Product" hover CTA for fully overlaid states)
  const blockInteraction =
    saleStatus === "out_of_stock" || saleStatus === "closed";

  return (
    <div>
      <figure className="aspect-[1.08] rounded-sm overflow-hidden relative group">
        {image ? (
          <img
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            src={image}
            alt={title}
          />
        ) : (
          <div className="w-full h-full bg-[#F0F0F0] flex items-center justify-center">
            <Icon
              icon="solar:image-bold-duotone"
              className="w-12 h-12 text-[#D0D0D0]"
            />
          </div>
        )}

        {/* Sale status overlay */}
        <StatusStrip saleStatus={saleStatus} />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(id);
          }}
          className="w-8.5 h-8.5 rounded-full absolute right-3 top-3 flex items-center justify-center bg-white z-1 transition-transform active:scale-90"
          aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Icon
            icon={fav ? "solar:heart-bold" : "solar:heart-outline"}
            className={cn(
              "w-[1.1rem] h-[1.1rem] transition-colors",
              fav ? "text-[#6EC93E]" : "text-[#374151]",
            )}
          />
        </button>

        {/* View Product — slides up on hover, hidden when fully overlaid */}
        {!blockInteraction && (
          <>
            <button
              onClick={() => {}}
              aria-label="Show view product"
              className="lg:hidden absolute right-3 bottom-10 z-10 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
            >
              <Icon icon="hugeicons:arrow-up-01" className="w-4 h-4" />
            </button>
            <Link
              href={`/collections/${id}`}
              className="absolute bottom-0 left-0 w-full py-2.5 bg-black text-white text-[1rem] leading-6 font-medium transition-transform duration-300 translate-y-full lg:group-hover:translate-y-0 text-center z-10"
            >
              View Product
            </Link>
          </>
        )}
      </figure>

      <Link href={`/collections/${id}`} className="block pt-4">
        <p className="text-[1rem] font-medium text-black leading-6 mb-1.5 line-clamp-2">
          {title}
        </p>
        <div className="flex gap-2 items-center flex-wrap">
          <span
            className={cn(
              "text-[1rem] leading-6 font-semibold",
              saleStatus === "out_of_stock"
                ? "text-[#9CA3AF] line-through"
                : "text-[#DB4444]",
            )}
          >
            ₦{price.toLocaleString()}
          </span>
          {avgRating !== null && (
            <>
              <Stars rating={avgRating} />
              <span className="text-[#757575] text-[0.875rem] font-semibold">
                ({reviewCount})
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};

export { ProductCard };
