import { Button, EventsCarousel, FAQs, ProductCard } from "@/components";
import { Icon } from "@iconify/react";

const Events = () => {
  return (
    <>
      <section className="md:pt-38.5 pt-33.75 lg:px-7.5 px-4 pb-9 max-w-450 mx-auto">
        <h1 className="text-black text-[1.75rem] md:text-[3.125rem] md:w-[90%] font-medium max-w-274.75 mb-2.25">
          Creating memorable experiences and meaningful mentorship through our
          events
        </h1>
        <p className="text-[#000000B2] font-normal max-w-141 text-[1rem] md:text-[1.125rem] mb-6.25">
          Unchain Summer harnesses blockchain to spark creativity and innovation
          across Africa, spotlighting the talent shaping the African Web3
          community.
        </p>
        <Button>Get Tickets</Button>
      </section>

      <section className="pt-22.25 px-4 lg:px-7.5 pb-9 max-w-450 mx-auto">
        <h2 className="text-black font-medium text-[1.5rem] md:text-[2.5rem] mb-4 lg:mb-9.25">
          Events
        </h2>

        <EventsCarousel />
      </section>

      <section className="pt-17.75 px-4 lg:px-7.5 max-w-450 mx-auto">
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
        <div className="mt-4 md:mt-11.75 md:mb-11.75 mb-8 gap-7.5 grid sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => (
            <ProductCard
              key={`__item__${index}`}
              image="/images/demoprod.png"
              title="Unchain Summer (Men merch)"
              price="$100"
              rating={3}
              reviewCount={35}
              badge={index % 5 === 0 ? "NEW" : undefined}
            />
          ))}
        </div>
        <Button className="w-fit mx-auto block sm:py-4! py-2  text-[1rem] rounded-sm font-medium">
          View All Products
        </Button>
      </section>

      <FAQs />
    </>
  );
};

export default Events;
