/* eslint-disable @next/next/no-img-element */
import { CountDown } from "../common";
import { FadeIn, FadeUp } from "../motion";

const UpcomingEvent = ({ title }: { title?: string }) => {
  return (
    <section className="w-fit mx-auto">
      {title && (
        <h3 className="text-black font-medium hidden sm:block text-[1.25rem] md:text-[1.5rem] leading-16.25 max-w-275 w-[90%] mx-auto">
          {title}
        </h3>
      )}
      <FadeIn>
        <figure className="max-w-275 mb-1 sm:mb-0 w-[90%] mx-auto rounded-[1.125rem] overflow-hidden">
          <img
            src="/images/unchain-summer-banner.png"
            alt="Unchain Summer Banner"
            className="sm:block hidden"
          />
          <img
            src="/images/unchain-summer-banner-sm.png"
            alt="Unchain Summer Banner"
            className="sm:hidden"
          />
        </figure>
      </FadeIn>
      <FadeUp>
        <div className="bg-[#1D1D1D] w-[90%] sm:w-[96%] mx-auto lg:w-300 md:rounded-[1.0625rem] rounded-[.9375rem] flex items-center justify-center sm:translate-y-[-12%] md:translate-y-[-10%] py-5.5 md:py-8.75">
          <CountDown
            targetDate="2026-08-02T00:00:00"
            className="gap-1 min-[361px]:gap-1.75 md:gap-9"
            boxClassName="md:rounded-[1.25rem] md:w-24.25 w-16.75 md:h-24.25 h-16.75"
            numberClassName="text-[1.125rem] md:text-[1.6875rem]"
            labelClassName="text-[.75rem]"
            separatorClassName="text-[1.8125rem]"
          />
        </div>
      </FadeUp>
    </section>
  );
};

export { UpcomingEvent };
