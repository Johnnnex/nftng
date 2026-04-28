/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";

type ProductCardProps = {
  image: string;
  title: string;
  price: string;
  rating: number;
  reviewCount: number;
  badge?: string;
};

const ProductCard = ({
  image,
  title,
  price,
  rating,
  reviewCount,
  badge,
}: ProductCardProps) => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div>
      <figure className="aspect-[1.08] rounded-sm overflow-hidden relative group">
        <img className="object-cover w-full h-full" src={image} alt={title} />

        {badge && (
          <span className="absolute left-3 top-3 p-[.25rem_.75rem] text-[.75rem] font-normal text-[#FAFAFA] bg-[#6EC93E] rounded-sm leading-4.5">
            {badge}
          </span>
        )}

        <button
          className="w-8.5 h-8.5 rounded-[50%] absolute right-3 top-3 flex items-center justify-center bg-white z-1"
          aria-label="Add to wishlist"
        >
          <Icon icon="hugeicons:favourite" />
        </button>

        {/* Mobile toggle — hidden on md+ where hover takes over */}
        <button
          onClick={() => setCartOpen((prev) => !prev)}
          aria-label={cartOpen ? "Hide add to cart" : "Show add to cart"}
          className={cn(
            "md:hidden absolute right-3 bottom-10 z-1 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center transition-transform duration-300",
            cartOpen ? "rotate-180" : "",
          )}
        >
          <Icon icon="hugeicons:arrow-up-01" className="w-4 h-4" />
        </button>

        {/* Add to Cart — slides up on desktop hover, on mobile via toggle */}
        <button
          className={cn(
            "absolute bottom-0 left-0 w-full py-2 bg-black text-white text-[1rem] leading-6 font-medium transition-transform duration-300",
            cartOpen
              ? "translate-y-0"
              : "translate-y-full md:group-hover:translate-y-0",
          )}
        >
          Add To Cart
        </button>
      </figure>

      <div className="pt-4 bg-white">
        <p className="text-[1rem] font-medium text-black leading-6 mb-2">
          {title}
        </p>
        <div className="flex gap-2 items-center">
          <span className="text-[#DB4444] text-[1rem] leading-6 font-medium">
            {price}
          </span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < rating ? "text-[#FFAD33]" : "text-[#757575]",
                )}
                icon="iconoir:star-solid"
              />
            ))}
          </div>
          <span className="text-[#757575] text-[.875rem] font-semibold leading-5.25">
            ({reviewCount})
          </span>
        </div>
      </div>
    </div>
  );
};

export { ProductCard };
