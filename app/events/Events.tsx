/* eslint-disable @next/next/no-img-element */
import { type CSSProperties } from "react";
import {
  Button,
  CountDown,
  EventsCarousel,
  FAQs,
  FadeUp,
  StaggerContainer,
  StaggerItem,
  UpcomingEvent,
  WordByWord,
} from "@/components";
import { cn } from "@/lib";
import { monumentExtended } from "../layout";

const Events = () => {
  return (
    <>
      <section className="md:pt-38.5 pt-33.75 lg:px-7.5 px-4 pb-9.5 md:pb-16.5 max-w-450 mx-auto">
        <WordByWord
          text="Africa's Most Immersive Web3 Experience"
          as="h1"
          className="text-[2.375rem] md:text-[3.125rem] font-medium md:leading-14.5 leading-8.5 max-w-120 md:max-w-186.25 mx-auto text-center justify-center text-black"
        />
      </section>

      <section className="bg-[#FFAD33] mb-13.25">
        <div
          data-animated="true"
          className="marquee-anim overflow-hidden"
          style={{ "--marquee-gap": "5rem" } as CSSProperties}
        >
          <div
            className="inner flex items-center gap-20 w-max py-1.5 md:py-7.25"
            style={{ animationDuration: "45s" }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <h2
                key={i}
                className={cn(
                  "md:text-[6rem] text-[3rem] text-white font-normal leading-16.25 uppercase whitespace-nowrap shrink-0",
                  monumentExtended.className,
                )}
              >
                UPCOMING EVENT
              </h2>
            ))}
          </div>
        </div>
      </section>

      <UpcomingEvent />

      <section className="md:pt-14 px-4 pt-15.25 w-fit mx-auto">
        <FadeUp>
          <h3 className="mb-7.25 text-black text-[2rem] md:text-[3.125rem] text-center font-medium leading-8.25 sm:w-full w-[90%] mx-auto md:leading-16.25">
            Unchain Summer 2026: The North Star
          </h3>
        </FadeUp>
        <FadeUp delay={0.15}>
          <p className="text-center text-black font-normal text-[1rem] max-w-199 mx-auto">
            The 2026 edition is not just another year. It marks five years of
            NFTNG&apos;s leadership in Africa&apos;s Web3 ecosystem and we are
            celebrating it the way it deserves.
            <br />
            <br />
            The theme is <b className="font-bold">The North Star</b>. A symbol
            of direction, clarity, and long-term vision in a world full of
            noise. Unchain Summer 2026 positions builders, brands, and ecosystem
            leaders as guides steering Africa&apos;s Web3 journey toward real,
            sustainable impact. <br />
            <br />
            This is our biggest chapter yet.
          </p>
        </FadeUp>
      </section>

      <FadeUp className="flex flex-col sm:flex-row mt-12.75 mb-6.5 md:mb-8 w-fit mx-auto gap-2 sm:gap-4">
        <Button className="w-65 sm:w-full">Register</Button>
        <Button className="w-65 sm:w-full" variant="secondary">
          Sponsor
        </Button>
      </FadeUp>

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 lg:mb-21.75 mx-auto" />

      <section className="pt-16.25 md:pt-20 px-4 lg:px-7.5 pb-16.25 md:pb-9 max-w-450 mx-auto">
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 gap-9.25 sm:gap-2.5">
          {[
            { countdownDate: "" },
            { countdownDate: "" },
            { countdownDate: "" },
          ].map((_, index) => (
            <StaggerItem
              key={`__item__${index}__`}
              className={cn(
                "rounded-[1.875rem] aspect-[.9064] relative overflow-hidden",
                index === 2
                  ? "sm:col-start-2 lg:col-start-auto lg:col-span-1 sm:col-span-2"
                  : "sm:col-span-2 lg:col-span-1",
              )}
            >
              <img
                src={`/images/events-img-${index + 5}.png`}
                alt={`Events Image ${index + 5}`}
              />
              <div className="py-6 absolute bottom-0 left-0 w-full flex justify-center bg-black">
                <CountDown
                  className="gap-1.25"
                  boxClassName="rounded-2xl md:w-20 w-16.75 md:h-20 h-16.75"
                  numberClassName="text-[1.125rem] md:text-[1.375rem]"
                  labelClassName="text-[.75rem] md:text-[.875rem]"
                  separatorClassName="text-[1.25rem] md:text-[1.4375rem]"
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 lg:mt-21.75 mx-auto" />

      <section className="pt-20 px-4 lg:px-7.5 pb-9 max-w-450 mx-auto">
        <FadeUp>
          <h2 className="text-black font-medium text-[1.5rem] md:text-[2.5rem] mb-4 lg:mb-9.25">
            Past Events
          </h2>
        </FadeUp>

        <EventsCarousel />
      </section>

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-6.5 md:mb-8 lg:mb-8 mt-12.5 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      <FAQs />
    </>
  );
};

export default Events;
