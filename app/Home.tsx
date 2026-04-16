/* eslint-disable @next/next/no-img-element */
import { Button, SVGClient } from "@/components";

export default function Home() {
  return (
    <>
      <section className="min-h-screen pt-47.25 pb-15 relative">
        <figure className="absolute inset-0 h-full w-full bg-[url(/images/main-hero-bg.png)] bg-cover bg-center" />
        <h1 className="text-black font-medium max-w-188.75 text-center mx-auto text-[3.125rem] leading-16.25">
          Empowering Africa&apos;s Creative Future With Blockchain
        </h1>
        <p className="text-[#000000B2] max-w-133.5 mx-auto text-center font-normal text-[1.125rem] mb-6">
          At Unchain Summer, we harness the power of Blockchain to drive
          innovation, creativity, and opportunity across Africa
        </p>
        <div className="flex gap-4 mx-auto w-fit items-center">
          <Button>Get Tickets</Button>
          <Button variant="secondary">View Pitch Deck</Button>
        </div>
        <figure className="w-fit mx-auto mt-3 mb-8">
          <img
            src="/svg/main-hero-illustration.svg"
            alt="Main Hero Illustration"
          />
        </figure>
        <div className="flex gap-4 overflow-x-hidden">
          {["", "", "", "", "", "", "", "", ""]?.map((item, index) => (
            <span
              className="bg-[#F1F1F1] rounded-xl w-56.5 h-58"
              key={`__item__${item}__${index}`}
            />
          ))}
        </div>
      </section>
      <section className="bg-[#003223] flex items-center gap-50 py-5.25 px-13.25">
        {["pulseng", "sportsbet", "theguardian", "thecable"]?.map(
          (item, index) => (
            <SVGClient
              key={`__item__${item}__${index}`}
              src={`/svg/${item}.svg`}
            />
          ),
        )}
      </section>
    </>
  );
}
