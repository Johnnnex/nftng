import { helveticaNeue } from "@/app/layout";
import { SVGClient } from "@/components";
import { NewsletterForm } from "./NewsletterForm";
import { cn } from "@/lib";
import Link from "next/link";

const Footer = () => {
  return (
    <section className="relative">
      <section className="px-4 lg:px-7.5 relative z-1 pb-6.5 max-w-450 mx-auto">
        <div className="bg-[url(/images/noise-bg.png)] mb-15.25 bg-blend-overlay min-h-70 md:h-100 lg:h-fit! bg-[#6EC93E] rounded-[1.875rem] overflow-hidden relative flex items-center lg:justify-center">
          <div className="flex lg:-mr-10 flex-col pl-5 w-[70%] md:w-[60%] gap-6">
            <h2
              className={cn(
                "max-w-216.5 font-bold text-white text-[1.25rem] md:text-[2rem] lg:text-[3.75rem]",
                helveticaNeue.className,
              )}
            >
              Stay Connected, Let&apos;s Do Something Great Together.
            </h2>
            <NewsletterForm />
          </div>
          <SVGClient
            className="lg:-ml-10 absolute lg:relative hidden bottom-0 translate-x-[29%] right-0 lg:translate-x-0 md:block"
            src="/svg/newsletter-illustration.svg"
          />
          <SVGClient
            className="absolute bottom-0 right-0 md:hidden"
            src="/svg/newsletter-illustration-sm.svg"
          />
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-10.5 lg:gap-0 justify-between">
          <div className="flex gap-7 flex-col justify-between">
            <SVGClient src="/svg/logo-lg-bl.svg" />
            <div className="flex gap-4">
              {[
                {
                  label: "Phone",
                  content: "+234-703-631-9762",
                  href: "tel:+2347036319762",
                },
                {
                  label: "Email",
                  content: "support@nftng.io",
                  href: "mail:support@nftng.io",
                },
              ]?.map((item, index) => (
                <div
                  key={`__item__${index}__`}
                  className="flex min-w-0 flex-col gap-2.5"
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
                    className="font-medium truncate block w-full text-[.875rem] text-black"
                  >
                    {item?.content}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between lg:gap-20">
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
                  {
                    name: "X (Twitter)",
                    url: "https://x.com/NFT__NG",
                    target: "_blank",
                  },
                  {
                    name: "Telegram",
                    url: "https://t.me/nftng24",
                    target: "_blank",
                  },
                  {
                    name: "LinkedIn",
                    url: "https://www.linkedin.com/company/nft-ng/",
                    target: "_blank",
                  },
                  {
                    name: "Instagram",
                    url: "https://www.instagram.com/nft__ng",
                    target: "_blank",
                  },
                ],
              },
              {
                title: "Legal",
                children: [
                  { name: "Terms of service", url: "/tos" },
                  { name: "Privacy Policies", url: "/policy" },
                ],
              },
            ]?.map((item, index) => (
              <div key={`__item__${index}__`}>
                <label
                  className={cn(
                    "mb-4 text-[1rem] block text-black text-nowrap font-normal",
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
                      target={
                        (childItem as { target: string })?.target || "_self"
                      }
                      className="text-[#000000B2] text-nowrap text-[.875rem] font-medium"
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

      <div className="absolute h-[75%] md:h-[60%] bottom-0 left-0 w-full bg-[#F1F1F1]" />
    </section>
  );
};

export { Footer };
