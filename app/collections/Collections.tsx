import {
  Button,
  ProductCard,
  FadeUp,
  StaggerItem,
  StaggerContainer,
} from "@/components";

import { Icon } from "@iconify/react";
import React from "react";

const Collections = () => {
  return (
    <>
      <section className="pt-17.75 px-4 lg:px-7.5 max-w-450 mx-auto">
        <FadeUp>
          <div className="flex gap-4 mb-2 md:mb-5 items-center">
            <span className="w-5 h-10 bg-[#6EC93E] rounded-sm" />
            <span className="font-semibold text-[1rem] text-[#6EC93E] leading-5">
              Merch Product
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-black text-[1.5rem] md:text-[2.25rem] leading-12 font-semibold">
              Explore Our Products
            </h2>
            <Icon
              className="w-7 h-7 md:w-10.75 md:h-10.75"
              icon={"mdi:cart-outline"}
            />
          </div>
        </FadeUp>
        <StaggerContainer className="mt-4 md:mt-11.75 md:mb-11.75 mb-8 gap-7.5 grid sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => (
            <StaggerItem key={`__item__${index}`}>
              <ProductCard
                image="/images/demoprod.png"
                title="Unchain Summer (Men merch)"
                price="$100"
                rating={3}
                reviewCount={35}
                badge={index % 5 === 0 ? "NEW" : undefined}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
        <FadeUp className="flex justify-center">
          <Button className="w-fit sm:py-4! py-2 text-[1rem] rounded-sm font-medium">
            View All Products
          </Button>
        </FadeUp>
      </section>
    </>
  );
};

export default Collections;
