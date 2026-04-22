import { helveticaNeue } from "@/app/layout";
import React from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { SVGClient } from "./SVGClient";
import { cn } from "@/lib";
import Link from "next/link";

const Footer = () => {
  return (
    <section className="relative">
      <section className="px-7.5 relative z-2 pb-6.5 max-w-450 mx-auto">
        <div className="bg-[url(/images/noise-bg.png)] mb-15.25 bg-blend-overlay  bg-[#6EC93E] rounded-[1.875rem] flex items-center justify-center">
          <div className="flex -mr-10 flex-col gap-6">
            <h2
              className={cn(
                "max-w-216.5 font-bold text-white text-[3.75rem]",
                helveticaNeue.className,
              )}
            >
              Stay Connected, Let&apos;s Do Something Great Together.
            </h2>
            <div className="flex gap-2.25">
              <Input className="w-90" placeholder="Input Email..." />
              <Button className="bg-black font-medium text-[.875rem] rounded-lg min-w-21.75">
                Subscribe
              </Button>
            </div>
          </div>
          <SVGClient
            className="-ml-10"
            src="/svg/newsletter-illustration.svg"
          />
        </div>

        <div className="flex justify-between">
          <div className="flex flex-col justify-between">
            <SVGClient src="/svg/logo-lg-bl.svg" />
            <div className="flex gap-4">
              {[
                {
                  label: "Phone",
                  content: "+234-818-706-2034",
                  href: "tel:+2348187062034",
                },
                {
                  label: "Email",
                  content: "richierammy1016@gmail.com",
                  href: "mail:richierammy1016@gmail.com",
                },
              ]?.map((item, index) => (
                <div
                  key={`__item__${index}__`}
                  className="flex flex-col gap-2.5"
                >
                  <span
                    className={cn(
                      helveticaNeue.className,
                      "font-normal text-[1rem] text-[#000000B2]",
                    )}
                  >
                    {item?.label}
                  </span>
                  <a
                    href={item?.href}
                    className="font-medium text-[.875rem] text-black"
                  >
                    {item?.content}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-20">
            {[
              {
                title: "Quick Links",
                children: [
                  { name: "About us", url: "/about" },
                  { name: "Events", url: "/events" },
                  { name: "Contact Us", url: "/contact" },
                  { name: "Gallery", url: "/gallery" },
                ],
              },
              {
                title: "Socials",
                children: [
                  { name: "X (Twitter)", url: "/twitter" },
                  { name: "Telegram", url: "/telegram" },
                  { name: "LinkedIN", url: "/linkedin" },
                  { name: "Instagram", url: "/instagram" },
                ],
              },
              {
                title: "Legal",
                children: [
                  { name: "Terms of service", url: "/tos" },
                  { name: "Private Policies", url: "/policy" },
                ],
              },
            ]?.map((item, index) => (
              <div key={`__item__${index}__`} className="">
                <label
                  className={cn(
                    "mb-4 text-[1rem] block text-black font-normal",
                    helveticaNeue.className,
                  )}
                >
                  {item?.title}
                </label>
                <div className="flex flex-col gap-2">
                  {item?.children?.map((childItem, childIndex) => (
                    <Link
                      key={`__item__${index}__${childIndex}`}
                      href={childItem?.url}
                      className="text-[#000000B2] text-[.875rem] font-medium"
                    >
                      {childItem?.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="absolute h-[60%] bottom-0 left-0 w-full bg-[#F1F1F1]"></div>
    </section>
  );
};

export { Footer };
