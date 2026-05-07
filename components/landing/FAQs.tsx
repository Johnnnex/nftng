"use client";

import { type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { SVGClient } from "@/components";

type FAQ = {
  question: string;
  answer: string | ReactNode;
};

const faqs: FAQ[] = [
  {
    question: "What is Unchain Summer?",
    answer:
      "Unchain Summer is a week-long immersive Web3 experience powered by NFTng, happening in Lagos. It is designed to bring together builders, creators, founders, Web3 enthusiasts, and complete beginners into one space to learn, connect, and grow.",
  },
  {
    question: "Who is Unchain Summer for?",
    answer:
      "Unchain Summer is for complete beginners curious about Web3, creators, builders, developers, founders, and anyone looking to understand or grow within Web3.",
  },
  {
    question: "Do I need prior Web3 experience?",
    answer:
      "No. You can attend with zero knowledge and still follow along. There will be beginner-friendly sessions designed to help you understand the fundamentals.",
  },
  {
    question: "What will happen during the event?",
    answer:
      "Throughout the week, attendees will experience keynotes, panel discussions, networking sessions, a 2-day football tournament, and a closing dinner night.",
  },
  {
    question: "Is the event free?",
    answer:
      "Yes. Unchain Summer is completely free to attend, but registration is compulsory.",
  },
  {
    question: "Do I need to register?",
    answer:
      "Yes. Registration is required to secure your spot. Access to the event will be based on confirmed registrations.",
  },
  {
    question: "Where will the event take place?",
    answer:
      "The event will be held in Lagos. Specific venue details will be shared on our socials.",
  },
  {
    question: "Can I join if I'm not based in Lagos?",
    answer:
      "Unchain Summer is a physical event, but you can still participate virtually through a live stream if you're unable to attend in person.",
  },
  {
    question: "How can I partner with or support Unchain Summer?",
    answer: (
      <>
        If you&apos;re interested in sponsoring or partnering with Unchain
        Summer, please send an email to{" "}
        <a
          href="mailto:partnership@nftng.io"
          className="underline font-medium text-black"
        >
          partnership@nftng.io
        </a>
        . The team will review your request and get back to you with the next
        steps.
      </>
    ),
  },
  {
    question: "How do I register for the event?",
    answer:
      "Registration is not open yet, but it will be available soon. Once it goes live, you'll be able to sign up through the official website and receive further details about the event.",
  },
  {
    question: "How is Unchain Summer different from NFTNG?",
    answer:
      "Unchain Summer is a rebrand of NFTNG. While NFTNG started during the NFT era as a community focused on onboarding people into Web3 through events, the vision has expanded beyond NFTs into education, empowerment, and broader ecosystem growth. Unchain Summer reflects this change, serving as the current identity and experience, while still being powered by NFTNG.",
  },
  {
    question: "How do I get updates?",
    answer: (
      <>
        Follow NFTng on X (Twitter){" "}
        <a
          href="https://x.com/NFT__NG"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium text-black"
        >
          @NFT__NG
        </a>{" "}
        for announcements and updates.
      </>
    ),
  },
];

export const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="lg:px-7.5 px-4 w-fit lg:pb-12.5 pb-8 pt-22.5 md:pt-7.5 relative flex items-center mx-auto">
      <SVGClient className="hidden lg:block" src="/svg/faq-illustration.svg" />
      <SVGClient
        className="md:hidden absolute top-4"
        src="/svg/faq-illustration-sm.svg"
      />
      <div>
        <h2 className="font-normal text-[1.875rem] md:text-[2.25rem] text-center lg:mb-4 mb-2">
          FAQs
        </h2>
        <p className="text-[#000000B2] text-[1rem] md:text-[1.125rem] font-normal max-w-121 text-center mx-auto mb-8">
          This section answers the key questions you may have before attending
          Unchain Summer
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
                  {typeof item.answer === "string" ? (
                    <p className="text-[#000000B2] text-[.875rem] font-normal px-5 pb-4 leading-relaxed">
                      {item.answer}
                    </p>
                  ) : (
                    <div className="text-[#000000B2] text-[.875rem] font-normal px-5 pb-4 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
