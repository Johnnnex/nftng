"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { SVGClient } from "./SVGClient";

const faqs = [
  {
    question: "What is the NFTNG Unchain Summer Event?",
    answer:
      "The NFTNG Unchain Summer Event is Nigeria's premier Web3 gathering — a full-day experience blending keynotes, panel sessions, live demos, and networking designed to push the blockchain ecosystem forward in Africa.",
  },
  {
    question: "What is EchoFi?",
    answer:
      "EchoFi is a decentralized finance protocol built on transparency and community governance. It enables users to earn, lend, and grow digital assets while participating in an open, permissionless financial ecosystem.",
  },
  {
    question: "When and where is the Unchain Summer Event happening?",
    answer:
      "The Unchain Summer Event is scheduled for Summer 2026 in Lagos, Nigeria. Stay tuned to our socials and this page for the confirmed date, venue, and ticket details.",
  },
  {
    question: "When Next?",
    answer:
      "We run events year-round. Subscribe to our newsletter or follow @NFTNG on X to be the first to know about upcoming events, drops, and activations.",
  },
];

export const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="lg:px-7.5 px-4 w-fit lg:pb-2 pb-8 pt-22.5 md:pt-7.5 relative flex items-center mx-auto">
      <SVGClient className="hidden lg:block" src="/svg/faq-illustration.svg" />
      <SVGClient
        className="md:hidden absolute top-4"
        src="/svg/faq-illustration-sm.svg"
      />
      <div>
        <h2 className="font-normal text-[1.875rem] md:text-[2.25rem] text-center lg:mb-4 mb-2">
          FAQs
        </h2>
        <p className="text-[#000000B2] text-[1rem] md:text-[1.125rem] font-normal max-w-96 text-center mx-auto mb-8">
          Decoding the System: Clear Answers for Strategic Impact.
        </p>
        <div className="flex flex-col gap-2">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={`__item__${index}`}
                className="bg-[#F1F1F1] border border-[#0000000D] rounded-[.625rem] max-w-154 overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex text-black items-center justify-between cursor-pointer w-full p-[1rem_1.4375rem_.8125rem_1.25rem]"
                >
                  <span className="font-medium text-[.875rem] text-left">
                    {item.question}
                  </span>
                  <Icon
                    icon={"uiw:down"}
                    color="inherit"
                    height={"1.25rem"}
                    width={"1.25rem"}
                    className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
                >
                  <p className="text-[#000000B2] text-[.875rem] font-normal px-5 pb-4 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
