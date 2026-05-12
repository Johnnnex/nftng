/* eslint-disable @next/next/no-img-element */
import {
  Button,
  FAQs,
  SVGClient,
  BrandSlider,
  MagneticButton,
  FadeUp,
  FadeIn,
  WordByWord,
  StaggerContainer,
  StaggerItem,
  UpcomingEvent,
  SponsorsSlider,
  Panorama,
  SpeakerMarquee,
} from "@/components";
import { cn } from "@/lib";
import { helveticaNeue } from "./layout";

export default function Home() {
  return (
    <>
      <section className="md:pt-47.25 pt-29.25 pb-14.25 md:pb-18.25 relative">
        <figure className="absolute inset-0 z-[-1] h-full w-full bg-[url(/images/main-hero-bg.png)] bg-cover bg-center" />

        <FadeIn>
          <h1 className="text-black font-medium max-w-90.75 w-[95%] md:max-w-188.75 text-center mx-auto text-[1.5rem] mb-1 md:mb-0 md:text-[3.125rem] leading-7.25 md:leading-16.25">
            Empowering Africa&apos;s{" "}
            <span className="bg-linear-to-r from-black via-[#114815] to-[#F6DF0B] bg-clip-text text-transparent relative">
              Creative
              <SVGClient
                src="/svg/pen-drawing.svg"
                className="absolute hidden md:block z-[-1] translate-y-full bottom-6 -right-2"
              />
              <SVGClient
                src="/svg/pen-drawing-sm.svg"
                className="absolute md:hidden z-[-1] translate-y-full bottom-3.5 -right-1"
              />
            </span>{" "}
            Future With{" "}
            <span className="bg-linear-to-r from-black via-[#003223] to-[#F7DF08] bg-clip-text text-transparent">
              Blockchain
            </span>
          </h1>
        </FadeIn>
        <FadeUp delay={0.1}>
          <p className="text-[#000000B2] max-w-86 w-[95%] md:max-w-133.5 mx-auto text-center font-normal text-[.875rem] md:text-[1.125rem] mb-6">
            At Unchain Summer, we harness the power of Blockchain to drive
            innovation, creativity, and opportunity across Africa
          </p>
        </FadeUp>
        <FadeUp delay={0.2} className="flex justify-center">
          <div className="flex gap-4 items-center">
            <MagneticButton>
              <Button className="md:min-w-36.75">Register</Button>
            </MagneticButton>
            <MagneticButton>
              <Button className="md:min-w-36.75" variant="secondary">
                Sponsor
              </Button>
            </MagneticButton>
          </div>
        </FadeUp>
        <figure className="lg:w-fit w-[95%] mx-auto mt-6.75 md:mt-16.75 md:mb-14.5 mb-13">
          <img
            className="hidden w-full md:block"
            src="/svg/main-hero-illustration.svg"
            alt="Main Hero Illustration"
          />
          <img
            className="md:hidden max-w-100 w-full mx-auto"
            src="/svg/main-hero-illustration-sm.svg"
            alt="Main Hero Illustration"
          />
        </figure>

        <UpcomingEvent title="Upcoming Event" />
      </section>

      <SponsorsSlider />

      <BrandSlider />

      <section className="max-w-450 lg:px-7.5 px-4 pt-12.25 lg:pt-24 pb-12.25 lg:pb-5.5 mx-auto">
        <WordByWord
          text="Get A Grasp Of Our Ecosystem"
          as="h2"
          className={cn(
            "text-black text-[1.5rem] md:text-[2.25rem] mb-2.5 md:mb-2 font-normal",
            helveticaNeue.className,
          )}
        />
        <FadeUp
          delay={0.5}
          className="max-w-191.5 font-normal text-[#000000B2] lg:mb-12 mb-7 text-[1rem] md:text-[1.125rem]"
        >
          Explore the comprehensive framework of our ecosystem, showcasing our
          proven track record in the Web3 space and the strategic impact of our
          global events.
        </FadeUp>
        <Panorama />

        <FadeUp className="w-fit mx-auto">
          <Button>Become a Sponsor</Button>
        </FadeUp>
      </section>

      <section className="max-w-450 px-4 lg:px-7.5 mx-auto pt-10 pb-6.75">
        <WordByWord
          text="Why attend?"
          as="h2"
          className={cn(
            "text-black text-[1.5rem] md:text-[2.25rem] mb-2.25 md:mb-2 font-normal",
            helveticaNeue.className,
          )}
        />
        <FadeUp>
          <p className="max-w-142 font-normal text-[#000000B2] mb-5.75 lg:mb-10 text-[1rem] md:text-[1.125rem]">
            Find direction, build the right connections, and grow within
            Africa&apos;s Web3 ecosystem.
          </p>
        </FadeUp>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 gap-3.5 md:gap-4">
          {[
            {
              title: "Navigate",
              subTitle: `Helping participants and brands find direction in
                  Africa's Web3 ecosystem.`,
              jpeg: "sinusoid",
              alt: "Sinusoid",
            },
            {
              title: "Network",
              subTitle: `Connect with high-intent builders, founders, users, and partners.`,
              jpeg: "network-mesh",
              alt: "Network Mesh",
            },
            {
              title: "Nurture",
              subTitle: `Grow within the ecosystem. Access the support, insights, and  environment needed growth, adoption, and long-term ecosystem  impact.`,
              jpeg: "mesh",
              alt: "Mesh",
            },
          ]?.map((item, index) => (
            <StaggerItem
              key={`__item__${index}__`}
              className={cn(
                "border lg:col-span-1 sm:col-span-2 border-[#0000000D] bg-[#F1F1F1] rounded-[1.25rem]",
                index === 2 ? "lg:col-start-3 sm:col-start-2" : "",
              )}
            >
              <figure className="h-52.5 md:h-62.5">
                <img
                  className="h-full w-full object-cover"
                  src={`/images/${item?.jpeg}.png`}
                  alt={item?.alt}
                />
              </figure>
              <div className="px-6.75 pb-6.75">
                <h4 className="text-black font-medium text-[1.125rem] max-w-85 mb-2 leading-6.75">
                  {item?.title}
                </h4>
                <p className="text-[#000000A6] font-normal text-[.9375rem] max-w-104.5">
                  {item?.subTitle}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="md:pb-42.75 pb-12.5">
        <div className="max-w-450 px-4 lg:px-7.5 pt-8.75 mx-auto">
          <FadeUp>
            <h2
              className={cn(
                "text-black text-[1.5rem] md:text-[2.25rem] mb-4.25 lg:mb-0 font-medium",
              )}
            >
              Past Speakers
            </h2>
          </FadeUp>
          <FadeUp>
            <p className="font-normal text-[#000000B2] mb-4.25 lg:mb-6.75 text-[1rem] md:text-[1.125rem]">
              The voices of builders, founders, and leaders defining Web3 at
              Unchain Summer
            </p>
          </FadeUp>
        </div>
        <SpeakerMarquee />
      </section>

      <FAQs />
    </>
  );
}
