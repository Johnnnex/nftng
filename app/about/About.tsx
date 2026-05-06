/* eslint-disable @next/next/no-img-element */
import { Button, FAQs, SVGClient } from "@/components";
import { helveticaNeue } from "../layout";
import { cn } from "@/lib";
import {
  FadeUp,
  FadeIn,
  WordByWord,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";

const About = () => {
  return (
    <>
      <section className="md:pt-38.5 pt-31.25 px-4 lg:px-7.5 pb-6.5 md:pb-23 max-w-390 mx-auto">
        <FadeIn>
          <span className="border block mb-4.5 lg:mb-6.75 w-fit border-[#6EC93E] p-[.625rem_1.25rem] md:p-[.625rem_2.5rem] font-medium text-[.875rem] rounded-lg text-black">
            About Us
          </span>
        </FadeIn>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 justify-between items-start">
          <div>
            <WordByWord
              text="About Us"
              as="h1"
              className="text-black text-[1.75rem] md:text-[3.125rem] font-medium mb-4.5 lg:mb-6.75"
            />
            <FadeUp>
              <p className="lg:max-w-166.25 font-normal text-[1rem] text-black">
                In November 11, 2022, NFTng was founded on a simple but powerful
                belief; that Africa deserved its own seat at the table in the
                global Web3 conversation. Not as followers or users but as
                builders, creators, and leaders. <br />
                <br />
                What began as a bold idea grew into Africa&apos;s most trusted
                Web3 community. Through education, grassroots organising, and
                relentless commitment to ecosystem growth, NFTng became the
                connective tissue of Africa&apos;s blockchain space bringing
                together developers, founders, investors, creators, and everyday
                users under one mission: make Web3 real for Africa. <br />
                <br />
                Unchain Summer is that mission in its fullest expression.
              </p>
            </FadeUp>
          </div>
          <FadeIn className="lg:w-163 aspect-[1.452] rounded-[1.25rem] overflow-hidden">
            <img
              src={"/images/about-img-2.png"}
              className="w-full h-full"
              alt="Unchain Summer 25"
            />
          </FadeIn>
        </div>
      </section>

      {/* New Component, maybe bgcolor transition/fade in from ltr?  */}
      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-6.5 md:mb-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      {/* New Component  */}
      <section className="px-4 lg:px-7.5 max-w-390 mx-auto">
        <div className="lg:py-22 pt-24 pb-32 bg-[#000000] bg-[url(/images/star-bg-sm.png)] sm:bg-[url(/images/star-bg.png)] bg-cover bg-center rounded-[1.875rem] relative flex flex-col items-center justify-center">
          <h2 className="text-white relative z-1 font-medium md:leading-16.25 mb-5.75 md:mb-7.25 text-[2rem] md:max-w-165 leading-8 text-center lg:max-w-full md:text-[3.125rem]">
            What is Unchain Summer?
          </h2>
          <p className="text-white relative z-1 leading-[115%] md:leading-normal font-normal text-[1rem] sm:w-[75%] md:w-[80%] max-w-78 sm:max-w-199 text-center mb-5.75 md:mb-8">
            Unchain Summer is Africa&apos;s Web3 convergence point. It is not a
            single day conference but a week long experience that blends
            community, culture, education, and onchain innovation into one
            immersive experience. Guiding this experience is Axis, our mascot
            and the heartbeat of Unchain Summer, here to make Web3 feel less
            overwhelming and more like something you belong to.
          </p>
          <Button className="relative z-1">Be part of Unchain Summer</Button>

          <SVGClient
            src="/svg/bridge.svg"
            className="absolute hidden sm:block lg:bottom-0 bottom-[-10%] lg:left-0 left-[-8%]"
          />
          <div className="flex justify-between items-end w-full absolute bottom-0 left-0 sm:hidden">
            <SVGClient src="/svg/bridge-l.svg" />
            <SVGClient src="/svg/bridge-r.svg" />
          </div>
        </div>
      </section>

      {/* New Component, same as hr above  */}
      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mt-6.5 md:mt-8 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mb-6.5 md:mb-15 mx-auto" />

      <section className="max-w-390 px-4 lg:px-7.5 mx-auto">
        <FadeUp>
          <div className="relative border-2 rounded-[.625rem] p-4.5 lg:p-0 border-[#D9D9D9] flex gap-6 lg:gap-20 flex-col lg:flex-row items-center lg:justify-center pt-3.75! overflow-hidden">
            <div className="absolute inset-0 bg-[url(/images/swirly-bg.png)] bg-center opacity-30 -z-10" />
            <div className="lg:flex-1 flex justify-between items-center">
              <span className="w-14.5 hidden lg:block ml-13.5 h-14.5 bg-[#A2D187] rounded-[50%]">
                <span className="h-12.5 w-12.5 bg-white block rounded-[50%]" />
              </span>
              <SVGClient className="hidden sm:block" src="/svg/m4.svg" />
              <SVGClient className="sm:hidden" src="/svg/m4-sm.svg" />
            </div>
            <div className="lg:flex-1">
              <h3 className="text-black font-medium text-[1.5rem] mb-[.75] lg:mb-0 md:text-[2rem]">
                Mission Statement
              </h3>
              <p className="text-black font-normal md:text-[1.0625rem] text-[.875rem] max-w-116.5">
                To create inclusive and well structured experiences that advance
                Web3 education, collaboration, and adoption across Africa.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="max-w-390 px-4 lg:px-7.5 mx-auto">
        <FadeUp>
          <div className="relative border-2 mt-9 rounded-[.625rem] p-4.5 lg:p-0 border-[#D9D9D9] flex gap-6 lg:gap-20 flex-col lg:flex-row items-center lg:justify-center pt-3.75! overflow-hidden">
            <div className="absolute inset-0 bg-[url(/images/swirly-bg.png)] bg-center opacity-30 -z-10" />

            <div className="lg:flex-1 flex justify-between items-center">
              <span className="w-14.5 hidden lg:block ml-13.5 h-14.5 bg-[#A2D187] rounded-[50%]">
                <span className="h-12.5 w-12.5 bg-white block rounded-[50%]" />
              </span>
              <SVGClient
                className="hidden sm:block mr-30"
                src="/svg/african-chart.svg"
              />
              <SVGClient
                className="sm:hidden"
                src="/svg/african-chart-sm.svg"
              />
            </div>
            <div className="lg:flex-1">
              <h3 className="text-black font-medium text-[1.5rem] mb-[.75] lg:mb-0 md:text-[2rem]">
                Vision Statement
              </h3>
              <p className="text-black font-normal md:text-[1.0625rem] text-[.875rem] max-w-120.5">
                To position Africa as an active and influential participant in
                the global Web3 ecosystem.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="max-w-450 px-4 lg:px-7.5 mx-auto pt-14.25 lg:pt-16 pb-6.75">
        <WordByWord
          text="The Unchain Summer Team"
          as="h2"
          className={cn(
            "text-black max-w-[90%] text-[2.25rem] mb-2.25 lg:mb-4 leading-10 font-normal",
            helveticaNeue.className,
          )}
        />
        <FadeUp>
          <p className="max-w-174.5 font-normal text-[#000000B2] mb-8 lg:mb-10 text-[1rem] md:text-[1.125rem]">
            Unchain Summer is powered by a dedicated group of Web3 pioneers and
            community builders committed to empowering Africa&apos;s creative
            talent.
          </p>
        </FadeUp>
        <StaggerContainer className="grid mb-3.75 md:grid-cols-6 sm:grid-cols-4 gap-3.75 lg:grid-cols-10">
          {[
            {
              name: "Teddi / King.sol",
              linkedinUrl: "",
              image: "teddi.jpg",
              title: "Founder",
              className: "col-span-2",
            },
            {
              name: "Amarachi Nwachukwu",
              linkedinUrl: "",
              image: "ama.jpg",
              title: "Program Lead",
              className: "col-span-2",
            },
            {
              name: "Ike Desmond Anthony",
              linkedinUrl: "",
              image: "ike.png",
              title: "Event Coordinator",
              className: "col-span-2",
            },
            {
              name: "Abiola Baloye",
              linkedinUrl: "",
              image: "abiola.png",
              title: "Marketing Lead",
              className: "col-span-2",
            },
            {
              name: "Ifedolapo Gina",
              linkedinUrl: "",
              image: "gina.png",
              title: "Operation Lead",
              className: "col-span-2",
            },
            {
              name: "Toria Dickson",
              linkedinUrl: "",
              image: "toria.jpg",
              title: "Social Media Lead",
              className: "lg:col-start-2 col-span-2",
            },
            {
              name: "Harrison Joseph",
              linkedinUrl: "",
              image: "harrison.png",
              title: "Technical Director",
              className: "lg:col-start-4 col-span-2",
            },
            {
              name: "Giwa Oluwasheedah",
              linkedinUrl: "",
              image: "giwa.png",
              title: "Creative Director",
              className: "lg:col-start-6 col-span-2",
            },
            {
              name: "Praise Okafor",
              linkedinUrl: "",
              image: "praise.png",
              title: "Welfare & Logistics Lead",
              className:
                "lg:col-start-8 col-span-2 sm:col-start-2 md:col-start-auto",
            },
          ]?.map((item, index) => (
            <StaggerItem
              fade
              key={`__item__${index}__`}
              className={cn(
                "aspect-[.73] relative rounded-2xl bg-center overflow-hidden bg-cover bg-no-repeat",
                item?.className,
              )}
              style={{ backgroundImage: `url(/images/${item?.image})` }}
            >
              <div className="absolute p-[1.0625rem_0.9375rem] inset-0 w-full h-full bg-linear-to-b from-black/0 to-black flex items-end">
                <div className="flex justify-between items-end w-full">
                  <div className="flex flex-col gap-2">
                    <span className="text-white text-[1rem] font-normal">
                      {item?.name}
                    </span>
                    <span className="text-[#FFFFFFB2] font-normal text-[.8125rem]">
                      {item?.title}
                    </span>
                  </div>
                  <a target="_blank">
                    <SVGClient src="/svg/devicon_linkedin.svg" />
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* New Component, maybe bgcolor transition/fade in from ltr?  */}
      <hr className="border-none h-[.5px] bg-linear-to-r from-[#1D1D1D]/12 via-black to-black/0 mb-2 md:mb-8 lg:mb-8 md:mt-5 w-[90%] sm:max-w-120 max-w-60.5 md:max-w-[90%] lg:max-w-195 mx-auto" />

      <FAQs />
    </>
  );
};

export default About;
