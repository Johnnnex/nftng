/* eslint-disable @next/next/no-img-element */
import { FAQs, SVGClient } from "@/components";
import { helveticaNeue } from "../layout";
import { cn } from "@/lib";

const About = () => {
  return (
    <>
      <section className="md:pt-38.5 pt-31.25 px-4 lg:px-7.5 pb-9 max-w-390 mx-auto">
        <span className="border block mb-4.5 lg:mb-6.75 w-fit border-[#6EC93E] p-[.625rem_1.25rem] md:p-[.625rem_2.5rem] font-medium text-[.875rem] rounded-lg text-black">
          About Us
        </span>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 justify-between items-end">
          <div>
            <h1 className="font-medium text-[2rem] md:text-[2.5rem] text-black mb-4.5 lg:mb-6.75">
              About Us
            </h1>
            <p className="lg:max-w-166.25 font-normal text-[1rem] text-black">
              Unchain Summer is an annual Web3 and blockchain experience powered
              by NFT NG. It brings together founders, developers, creators,
              investors, andemerging talent to explore the future of blockchain
              through education, culture, and community. <br />
              <br />
              Designed to be accessible and engaging, Unchain Summer blends
              technology, creativity, and real world interaction to make Web3
              moreunderstandable and relevant to a broad audience. Since its
              inception,the event has grown into a leading Web3 gathering in
              Nigeria, hosting conferences, competitions, cultural experiences,
              and community driven activities. <br /> <br /> Unchain Summer 2026
              introduces The North Star, a theme centered on clarity, direction,
              and discovery. This edition focuses on creating an open
              environment where participants can learn, connect, and identify
              opportunities within the evolving Web3 ecosystem.
            </p>
          </div>
          <figure className="lg:w-163 aspect-[1.452] rounded-[1.25rem] overflow-hidden">
            <img
              src={"/images/about-img-2.png"}
              className="w-full h-full"
              alt="Unchain Summer 25"
            />
          </figure>
        </div>
      </section>

      <section className="flex flex-wrap lg:flex-nowrap gap-4 md:gap-6 px-4 lg:px-7.5 mb-16 lg:items-center max-w-390 mx-auto">
        <div className="bg-[#003223] w-full sm:w-[calc(50%-0.75rem)] lg:w-[22.4%] order-1 lg:order-0 rounded-xl py-[1.5625rem_1.125rem] flex flex-col">
          <span className="text-white text-center font-medium text-[2.25rem]">
            26+
          </span>
          <span className="font-medium mx-auto max-w-38.75 text-center text-[#FFFFFFB2] text-[1.25rem]">
            Actively dedicated teams across web3 and web2 worlds
          </span>
        </div>
        <div className="bg-[#FF6400] w-full sm:w-[calc(55%-0.75rem)] lg:w-[34.7%] order-3 lg:order-0 flex flex-col bg-blend-overlay rounded-xl bg-[url(/images/noise-bg-black.png)] p-[2.625rem_1.25rem_2.1875rem_1.25rem]">
          <span className="text-white mb-1.25 text-[1rem] font-medium">
            Total attendees
          </span>
          <span className="text-white font-medium text-[2.375rem]">
            238,716+
          </span>
          <span className="text-[#FFFFFFB2] text-[1.125rem] font-medium w-76.25">
            Grown through our trusted platform and community
          </span>
        </div>
        <div className="py-[3.3125rem_2rem] w-full sm:w-[calc(45%-0.75rem)] lg:w-[18.8%] order-4 lg:order-0 flex flex-col bg-[#FFD60A] rounded-xl">
          <span className="text-center text-black font-medium text-[1.75rem]">
            4-10
          </span>
          <span className="w-38.5 mx-auto text-center text-[#000000B2] text-[1.25rem] font-normal">
            Years of proven team experience
          </span>
        </div>
        <div className="py-[4.875rem_.875rem] w-full sm:w-[calc(50%-0.75rem)] lg:w-[24%] order-2 lg:order-0 bg-[#74FF6B] bg-[url(/images/noise-bg-black.png)] text-center rounded-xl text-black text-[1.25rem] font-medium bg-blend-overlay relative">
          <span className="w-65.25 block mx-auto">
            Known as the No. 1 blockchain events host and engager in Nigeria and
            across Africa, bringing together Web2 and Web3 minds
          </span>
          <SVGClient
            className="top-0 right-14.75 absolute"
            src="/svg/ball.svg"
          />
        </div>
      </section>

      <section className="max-w-390 px-4 lg:px-7.5 mx-auto">
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
      </section>

      <section className="max-w-390 px-4 lg:px-7.5 mx-auto">
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
            <SVGClient className="sm:hidden" src="/svg/african-chart-sm.svg" />
          </div>
          <div className="lg:flex-1">
            <h3 className="text-black font-medium text-[1.5rem] mb-[.75] lg:mb-0 md:text-[2rem]">
              Vision Statement
            </h3>
            <p className="text-black font-normal md:text-[1.0625rem] text-[.875rem] max-w-120.5">
              To position Africa as an active and influential participant in the
              global Web3 ecosystem.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-450 px-4 lg:px-7.5 mx-auto pt-14.25 lg:pt-16 pb-6.75">
        <h2
          className={cn(
            "text-black max-w-[90%] text-[2.25rem] mb-2.25 lg:mb-4 leading-10 font-normal",
            helveticaNeue.className,
          )}
        >
          The Unchain Summer Team
        </h2>
        <p className="max-w-174.5 font-normal text-[#000000B2] mb-8 lg:mb-10 text-[1rem] md:text-[1.125rem]">
          Unchain Summer is powered by a dedicated group of Web3 pioneers and
          community builders committed to empowering Africa&apos;s creative
          talent.
        </p>
        <div className="grid mb-3.75 md:grid-cols-6 sm:grid-cols-4 gap-3.75 lg:grid-cols-10">
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
              className: "lg:col-start-8 col-span-2 sm:col-start-2 md:col-start-auto",
            },
          ]?.map((item, index) => (
            <figure
              key={`__item__${index}__`}
              style={{ backgroundImage: `url(/images/${item?.image})` }}
              className={cn(
                "aspect-[.73] relative rounded-2xl bg-center overflow-hidden bg-cover bg-no-repeat",
                item?.className,
              )}
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
            </figure>
          ))}
        </div>
      </section>

      <FAQs />
    </>
  );
};

export default About;
