import {
  CollectionsHeader,
  FAQs,
  ProductCard,
  StaggerContainer,
  StaggerItem,
} from "@/components";
import { CollectionsComingSoon } from "./CollectionsComingSoon";

const Collections = () => {
  return (
    <>
      <CollectionsComingSoon>
        <CollectionsHeader />

        <section className="px-4 lg:px-7.5 max-w-375 mx-auto">
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
        </section>
      </CollectionsComingSoon>

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-2 md:mb-8 lg:mb-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      <FAQs />
    </>
  );
};

export default Collections;
