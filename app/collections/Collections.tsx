import {
  CollectionsHeader,
  FAQs,
  ProductCard,
  StaggerContainer,
  StaggerItem,
} from "@/components";
import { CollectionsComingSoon } from "./CollectionsComingSoon";

const PRODUCTS = [
  {
    title: "Unchain Summer (Men Merch)",
    image: "/images/demoprod-1.jpg",
    price: 100,
    rating: 2.5,
    reviewCount: 35,
    isNew: false,
  },
  {
    title: "Unchain Summer (Women Merch)",
    image: "/images/demoprod-2.png",
    price: 360,
    rating: 4.5,
    reviewCount: 95,
    isNew: false,
  },
  {
    title: "Unchain Summer (Keyboard)",
    image: "/images/demoprod-3.png",
    price: 700,
    rating: 5,
    reviewCount: 325,
    isNew: false,
  },
  {
    title: "Unchain Summer (Sticker)",
    image: "/images/demoprod-4.png",
    price: 500,
    rating: 4.5,
    reviewCount: 145,
    isNew: false,
  },
  {
    title: "Unchain Summer (Women Merch)",
    image: "/images/demoprod-5.jpg",
    price: 960,
    rating: 5,
    reviewCount: 65,
    isNew: true,
  },
  {
    title: "Unchain Summer (Men Merch)",
    image: "/images/demoprod-6.jpg",
    price: 1160,
    rating: 4.5,
    reviewCount: 35,
    isNew: false,
  },
  {
    title: "US Sticker",
    image: "/images/demoprod-7.png",
    price: 660,
    rating: 4.5,
    reviewCount: 55,
    isNew: true,
  },
  {
    title: "Unchain Summer (Men Merch)",
    image: "/images/demoprod-1.jpg",
    price: 660,
    rating: 4.5,
    reviewCount: 55,
    isNew: false,
  },
];

const DISPLAY_PRODUCTS = [...PRODUCTS, ...PRODUCTS];

const Collections = () => {
  return (
    <>
      <CollectionsComingSoon>
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
      </CollectionsComingSoon>

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-2 md:mb-8 lg:mb-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      <FAQs />
    </>
  );
};

export default Collections;
