import {
  CollectionsHeader,
  FAQs,
  ProductCard,
  StaggerContainer,
  StaggerItem,
} from "@/components";
import { PRODUCTS } from "./collections.data";

const DISPLAY_PRODUCTS = [...PRODUCTS, ...PRODUCTS];

const Collections = () => {
  return (
    <>
      <CollectionsHeader />

      <section className="px-4 lg:px-7.5 max-w-375 mx-auto">
        <StaggerContainer className="mt-4 md:mt-11.75 md:mb-11.75 mb-8 gap-7.5 grid sm:grid-cols-2 lg:grid-cols-4">
          {DISPLAY_PRODUCTS.map((p, index) => (
            <StaggerItem key={`__item__${index}`}>
              <ProductCard
                image={p.image}
                title={p.title}
                price={`$${p.price}`}
                rating={p.rating}
                reviewCount={p.reviewCount}
                badge={p.isNew ? "NEW" : undefined}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-2 md:mb-8 lg:mb-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      <FAQs />
    </>
  );
};

export default Collections;
