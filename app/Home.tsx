/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { Button, FAQs, SVGClient, BrandSlider } from "@/components";
import { cn } from "@/lib";
import { helveticaNeue } from "./layout";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <>
      <section className="md:pt-47.25 pt-29.25 pb-15 relative">
        <figure className="absolute inset-0 z-[-1] h-full w-full bg-[url(/images/main-hero-bg.png)] bg-cover bg-center" />

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
        <p className="text-[#000000B2] max-w-86 w-[95%] md:max-w-133.5 mx-auto text-center font-normal text-[.875rem] md:text-[1.125rem] mb-6">
          At Unchain Summer, we harness the power of Blockchain to drive
          innovation, creativity, and opportunity across Africa
        </p>
        <div className="flex gap-4 mx-auto w-fit items-center">
          <Button className="md:min-w-36.75">Get Tickets</Button>
          <Button className="md:min-w-36.75" variant="secondary">
            View Pitch Deck
          </Button>
        </div>
        <figure className="lg:w-fit w-[95%] mx-auto mt-6.75 md:mt-3 mb-8">
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
        <div className="overflow-hidden">
          <div
            className="marquee-anim"
            data-animated="true"
            style={{ "--marquee-gap": "0.5rem" } as CSSProperties}
          >
            <div className="inner flex md:gap-4 gap-1.25 w-max">
              {Array.from({ length: 20 }, (_, index) => (
                <span
                  className="glare bg-[#F1F1F1] shrink-0 rounded-xl aspect-[.947] w-30 md:w-56.5 md:h-58"
                  key={`__card__${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <BrandSlider />

      <section className="max-w-450 lg:px-7.5 px-4 pt-12.25 lg:pt-24 pb-12.25 lg:pb-5.5 mx-auto">
        <h2
          className={cn(
            "text-black text-[1.5rem] md:text-[2.25rem] mb-2.5 md:mb-2 font-normal",
            helveticaNeue.className,
          )}
        >
          Get A Grasp Of Our System
        </h2>
        <p className="max-w-191.5 font-normal text-[#000000B2] lg:mb-12 mb-7 text-[1rem] md:text-[1.125rem]">
          Explore the comprehensive framework of our ecosystem, showcasing our
          proven track record in the Web3 space and the strategic impact of our
          global events.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 mb-6.5 lg:mb-12 gap-x-3.5 gap-y-3 lg:gap-4">
          {Array.from({ length: 7 }, (_, index) => (
            <figure
              className={cn(
                "overflow-hidden",
                index === 3
                  ? "order-last lg:order-0 aspect-[.92] sm:aspect-auto rounded-[0_1.875rem_0_1.875rem]"
                  : index === 6
                    ? "order-last lg:order-0 aspect-[.92] sm:aspect-auto rounded-[1.875rem_0_1.875rem_0]"
                    : "col-span-2 lg:col-span-2 rounded-xl aspect-[1.778]",
              )}
              key={`__item___${index}`}
            >
              <img
                src={`/images/home-img-${index + 1}.jpg`}
                alt={`Home Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </figure>
          ))}
        </div>
        <Button className="w-fit mx-auto block">View Pitch Deck</Button>
      </section>

      <section className="max-w-450 px-4 lg:px-7.5 mx-auto pt-10 pb-6.75">
        <h2
          className={cn(
            "text-black text-[1.5rem] md:text-[2.25rem] mb-2.25 md:mb-2 font-normal",
            helveticaNeue.className,
          )}
        >
          We&apos;ve Got Mission!
        </h2>
        <p className="max-w-142 font-normal text-[#000000B2] mb-5.75 lg:mb-10 text-[1rem] md:text-[1.125rem]">
          To create inclusive, well-structured experiences that advance Web3
          education, collaboration, and adoption across Africa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 gap-3.5 md:gap-4">
          <div className="p-4 border lg:col-span-1 sm:col-span-2 border-[#0000000D] bg-[#F1F1F1] rounded-[1.25rem]">
            <div className="pt-1 mb-6 flex flex-col gap-2">
              <div className="bg-white w-[70%] lg:w-[59%] items-center shadow-[0_4px_10px_0_rgba(0,0,0,0.25)] p-2 rounded-[.625rem] flex gap-2.5">
                <span className="w-7.5 flex items-center justify-center aspect-square bg-[#F1F1F1] rounded-[50%]">
                  <Icon
                    height={"1.25rem"}
                    width={"1.25rem"}
                    icon={"logos:bitcoin"}
                  />
                </span>
                <div className="flex flex-1 gap-2 pr-4 flex-col">
                  <span className="bg-[#F1F1F1] h-2 animate-pulse [animation-duration:1.5s] [animation-delay:300ms] rounded-[999999px] w-[75%]" />
                  <span className="bg-[#F1F1F1] animate-pulse self-end h-2 [animation-duration:1.5s] rounded-[999999px] w-[75%]" />
                </div>
              </div>
              <div className="bg-white self-end items-center shadow-[0_4px_10px_0_rgba(0,0,0,0.25)] p-2 w-[70%] lg:w-[59%] rounded-[.625rem] flex gap-2.5">
                <span className="w-7.5 flex items-center justify-center aspect-square bg-[#6EC93E] rounded-[50%]">
                  <Icon
                    height={"1.25rem"}
                    width={"1.25rem"}
                    icon={"qlementine-icons:education-16"}
                  />
                </span>
                <div className="flex flex-1 gap-2 pr-4 flex-col">
                  <span className="bg-[#F1F1F1] h-2 animate-pulse [animation-duration:1.5s] [animation-delay:300ms] rounded-[999999px] w-[75%]" />
                  <span className="bg-[#F1F1F1] animate-pulse self-end h-2 [animation-duration:1.5s] rounded-[999999px] w-[75%]" />
                </div>
              </div>
            </div>
            <h4 className="text-black font-medium text-[1.125rem] max-w-85 mb-2 leading-6.75">
              Empowering african creatives through web3 education
            </h4>
            <p className="text-[#000000A6] font-normal text-[.9375rem] max-w-104.5">
              We provide accessible Web3 education to bridge knowledge gaps and
              empower African creatives with the resources they need to thrive.
            </p>
          </div>
          <div className="flex gap-3.5 md:gap-1.25 lg:col-span-1 sm:col-span-2 flex-col justify-between">
            <div className="p-4 border border-[#0000000D] bg-[#F1F1F1] rounded-[1.25rem]">
              <div className="pt-1 mb-5">
                <div className="bg-white w-[65%] md:w-[60%] lg:w-[50%] shadow-[0_4px_10px_0_rgba(0,0,0,0.25)] p-2.5 rounded-[.625rem] flex flex-col gap-1.5">
                  <div className="gap-px flex items-center">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Icon
                        key={`__item___${index}`}
                        height={".75rem"}
                        width={".75rem"}
                        color="#6EC93E"
                        icon={"ic:baseline-star"}
                      />
                    ))}
                  </div>
                  <div className="flex flex-1 gap-1 w-45 flex-col">
                    <span className="bg-[#F1F1F1] h-1.25 animate-pulse [animation-duration:1.5s] [animation-delay:300ms] rounded-[999999px] w-40" />
                    <span className="bg-[#F1F1F1] animate-pulse self-end h-1.25 [animation-duration:1.5s] rounded-[999999px] w-40" />
                  </div>
                </div>
              </div>
              <h4 className="text-black font-medium text-[1.125rem] max-w-85 mb-2 leading-6.75">
                Global africa&apos;s platform
              </h4>
              <p className="text-[#000000A6] font-normal text-[.9375rem] max-w-104.5">
                We offer a platform for African creatives to shine on the global
                stage through events, partnerships, and online channels.
              </p>
            </div>
            <div className="p-4 border border-[#0000000D] bg-[#F1F1F1] rounded-[1.25rem]">
              <h4 className="text-black mt-2.5 font-medium text-[1.125rem] max-w-85 mb-2 leading-6.75">
                Bringing events to communities
              </h4>
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 3 }, (_, index) => (
                    <img
                      key={`__image__${index}`}
                      className={cn(
                        "w-7.5 aspect-square object-cover rounded-[50%] border border-black",
                        index === 1
                          ? "-translate-x-1/2"
                          : index === 2
                            ? "-translate-x-full"
                            : "",
                      )}
                      src="/images/home-img-8.jpg"
                      alt="PFP IMG"
                    />
                  ))}
                </div>
                <span className="font-normal block -ml-4.5 text-[#000000A6] text-[.9375rem]">
                  200k+ people gathered.
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 border border-[#0000000D] lg:col-span-1 lg:col-start-3 sm:col-start-2 sm:col-span-2 bg-[#F1F1F1] rounded-[1.25rem]">
            <div className="pt-1 mb-7">
              <div className="bg-white items-center shadow-[0_4px_10px_0_rgba(0,0,0,0.25)] px-4 py-2.5 rounded-2xl flex gap-3.25">
                <span className="w-10 flex items-center justify-center aspect-square bg-[#6EC93E] rounded-[50%]">
                  <Icon
                    height={"1.25rem"}
                    width={"1.25rem"}
                    icon={"pepicons-pop:internet"}
                  />
                </span>
                <span className="h-[1.4px] flex-1 bg-linear-to-r from-[#A2D187]/0 to-[#A2D187]" />
                <img
                  src="/images/home-img-9.png"
                  className="object-cover h-10 aspect-square rounded-[50%]"
                  alt="NFTNG IMG"
                />
                <span className="h-[1.4px] flex-1 bg-linear-to-l from-[#A2D187]/0 to-[#A2D187]" />
                <span className="w-10 flex items-center justify-center aspect-square bg-[#6EC93E] rounded-[50%]">
                  <Icon height={"1.5rem"} width={"1.5rem"} icon={"bx:world"} />
                </span>
              </div>
            </div>
            <h4 className="text-black font-medium text-[1.125rem] max-w-85 mb-2 leading-6.75">
              Building a Connected Blockchain Community
            </h4>
            <p className="text-[#000000A6] font-normal text-[.9375rem] max-w-104.5">
              At Unchain Summer, we believe in the power of connection. Our
              community initiatives foster collaboration and support, creating a
              network of like-minded individuals passionate about
              Blockchain&apos;s.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-450 px-4 lg:px-7.5 pt-8.75 mx-auto">
        <h2
          className={cn(
            "text-black text-[1.5rem] md:text-[2.25rem] mb-4.25 lg:mb-0 font-medium",
          )}
        >
          Creating Successful events
        </h2>
        <p className="max-w-163.25 font-normal text-[#000000B2] mb-4.25 lg:mb-6.75 text-[1rem] md:text-[1.125rem]">
          We are dedicated to hosting impactful gatherings that foster
          innovation and growth within the digital landscape. Our events serve
          as a hub for education, networking, and community building across the
          continent.
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-4 mb-12.5">
          <figure className="aspect-[1.622] sm:w-[calc(50%-0.5rem)] lg:w-[39%] overflow-hidden rounded-2xl">
            <img
              src="/images/home-img-10.png"
              className="w-full h-full object-cover"
              alt="NFTNG EVENT"
            />
          </figure>
          <div className="bg-[#F1F1F1] pb-11 sm:w-[calc(50%-0.5rem)] lg:w-[26%] rounded-2xl">
            <div className="flex pt-4.75 items-start pr-4.75 mb-5 justify-between">
              <Icon
                icon={"bi:quote"}
                color="#6EC93E"
                width={"8.125rem"}
                height={"8.125rem"}
              />
              <span className="text-black font-medium text-[.8125rem] mt-3.5">
                It all started somewhere
              </span>
            </div>
            <p className="max-w-94.25 text-[1rem] md:text-[1.25rem] font-normal text-[#000000CC] mx-4">
              we provide accessible web3 eductaion to bridge knowledege gaps and
              empower African creatives with the resources they need to thrive
            </p>
          </div>
          <div className="sm:w-[65%] sm:mx-auto lg:w-[35%] lg:mx-0 flex flex-col gap-4 sm:gap-3 justify-between">
            <div className="flex gap-4">
              {["/images/home-img-11.png", "/images/home-img-12.png"]?.map(
                (item, index) => (
                  <figure
                    key={`___item__${index}__`}
                    className="aspect-[1.06] flex-1 overflow-hidden rounded-2xl"
                  >
                    <img
                      src={item}
                      className="w-full h-full object-cover"
                      alt={`Home Image ${index + 10}`}
                    />
                  </figure>
                ),
              )}
            </div>
            <h4 className="font-medium text-black text-[1.875rem]">
              Unchain Summer 2025
            </h4>
            <Button className="p-1.25! pl-5! text-[.875rem] rounded-md items-center font-medium justify-between text-black flex">
              View Gallery
              <span className="h-7.5 w-7.5 rounded-[.1875rem] bg-white flex items-center justify-center">
                <Icon
                  className="text-black rotate-45 w-4.5 h-4.5"
                  icon={"ant-design:arrow-up-outlined"}
                />
              </span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-4 lg:w-[88%] mx-auto">
          <div className="sm:w-[calc(50%-0.5rem)] lg:w-[39%] flex flex-col">
            <h4 className="font-medium text-black text-[2rem] md:text-[2.5rem]">
              Sunset Soirée
            </h4>

            <div className="flex flex-col flex-1 gap-2.75">
              <figure className="flex-1 overflow-hidden rounded-2xl">
                <img
                  src={"/images/home-img-13.png"}
                  className="w-full h-full object-cover"
                  alt={`Home Image 13`}
                />
              </figure>

              <Button className="pr-1.25! hidden sm:flex py-3.25! pl-5! text-[.875rem] rounded-md items-center font-medium justify-between text-white">
                View Gallery
                <span className="h-7.5 w-7.5 rounded-[.1875rem] bg-white flex items-center justify-center">
                  <Icon
                    className="text-black rotate-45 w-4.5 h-4.5"
                    icon={"ant-design:arrow-up-outlined"}
                  />
                </span>
              </Button>
            </div>
          </div>
          <figure className="sm:w-[calc(50%-0.5rem)] lg:w-[29%] rounded-2xl overflow-hidden">
            <img
              src="/images/home-img-14.png"
              className="w-full h-full object-cover"
              alt="Home Image 14"
            />
          </figure>
          <figure className="aspect-[.98] rounded-2xl overflow-hidden sm:w-[50%] sm:mx-auto lg:w-[31%] lg:mx-0">
            <img
              src="/images/home-img-15.png"
              className="w-full h-full object-cover"
              alt="Home Image 15"
            />
          </figure>

          <Button className="pr-1.25! flex sm:hidden py-3.25! pl-5! text-[.875rem] rounded-md items-center font-medium justify-between text-white">
            View Gallery
            <span className="h-7.5 w-7.5 rounded-[.1875rem] bg-white flex items-center justify-center">
              <Icon
                className="text-black rotate-45 w-4.5 h-4.5"
                icon={"ant-design:arrow-up-outlined"}
              />
            </span>
          </Button>
        </div>
      </section>

      <section className="max-w-450 px-4 lg:px-7.5 pt-12.5 pb-2.5 mx-auto">
        <h2
          className={cn(
            "text-black text-[1.75rem] md:text-[2.25rem] mb-5 lg:mb-6.75 font-medium",
          )}
        >
          Upcoming Event
        </h2>
        <figure
          style={{ backgroundImage: "url('/images/home-img-16.png')" }}
          className="aspect-[.98] sm:aspect-[2] lg:aspect-[3.34] flex items-center justify-center bg-center bg-cover rounded-2xl"
        >
          <div className="w-fit h-fit relative">
            <SVGClient src="/svg/logo-ue-lg.svg" />
            <span className="absolute bottom-4.75 bg-linear-to-b from-white to-[#74FF6B] bg-clip-text text-transparent text-[2.5rem] right-18.75 font-semibold">
              2026
            </span>
          </div>
        </figure>
      </section>

      <FAQs />
    </>
  );
}
