import type { Metadata } from "next";
import { BASE_URL } from "@/lib";
import { Button, SVGClient, FadeUp, FadeIn, WordByWord } from "@/components";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Page Not Found",
  description:
    "The page you're looking for doesn't exist. Head back to Unchain Summer – Africa's most immersive Web3 experience, powered by NFTNG.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="md:py-[6.875rem_4.625rem] py-8 px-4">
      <FadeIn>
        <div className="relative -mx-4 md:mb-27.25">
          <h1 className="font-medium bg-linear-to-b from-[#87AB39] from-15% to-[#ffffff] to-70% lg:to-80% bg-clip-text text-transparent text-[15.5rem] md:text-[25rem] lg:text-[35.6875rem] tracking-[-0.13em] -ml-[0.13em] text-center leading-100 md:leading-120">
            404
          </h1>
          <div className="absolute left-0 w-full bottom-0 md:-bottom-32.5">
            <SVGClient
              className="w-fit scale-80 md:block hidden lg:scale-100 mx-auto"
              src="/svg/not-found-svg.svg"
            />
            <SVGClient
              className="w-fit scale-80 md:hidden lg:scale-100 mx-auto"
              src="/svg/not-found-svg-sm.svg"
            />
          </div>
        </div>
      </FadeIn>

      <WordByWord
        text="Oops! Page Not Found"
        as="h2"
        className="font-medium text-[2rem] md:text-[3.125rem] leading-8.25 md:leading-14.5 text-black text-center mb-3 justify-center"
      />

      <FadeUp delay={0.3}>
        <p className="mb-7 md:mb-11.5 max-w-180 mx-auto text-center text-black text-[1rem] font-normal">
          Looks like this page took an unplanned detour. It may have been moved,
          renamed, or it simply never existed, but your journey doesn&apos;t
          have to end here. Head back home and keep exploring Africa&apos;s Web3
          frontier.
        </p>
      </FadeUp>

      <FadeUp delay={0.45} className="w-fit! mx-auto!">
        <Button url="/" className="p-[1rem_2.125rem]! w-65 md:w-fit">
          Go back home
        </Button>
      </FadeUp>

      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mt-12.5 md:mt-23 mb-6.5 md:mb-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />
    </section>
  );
}
