"use client";

import { Icon } from "@iconify/react";
import { Button } from "./Button";
import { SVGClient } from "./SVGClient";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  {
    name: "Get Involved",
    isDropDown: true,
    dropDownItems: [
      { name: "Apply to Speaker", href: "" },
      { name: "Apply to Sponsor", href: "" },
      { name: "Become a Volunteer", href: "" },
      { name: "Partner With Us", href: "" },
      { name: "Attend Event", href: "" },
    ],
  },
  { name: "Events", href: "/events" },
  { name: "Contact Us", href: "/contact" },
];

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="fixed z-3 w-full left-0 top-4">
      <div className="bg-[#003223] rounded-[.625rem] p-[.8125rem_1.875rem] flex justify-between items-center max-w-400 w-[95%] mx-auto">
        <SVGClient src="/svg/logo-lg.svg" />
        <nav>
          <ul className="flex items-center gap-11.5">
            {navItems?.map((item, index) => {
              const isActive = item.href === pathname;

              return (
                <li
                  key={`__item__${item.name}__${index}`}
                  className={`relative text-[.875rem] font-medium hover:text-white transition-colors duration-300 ${
                    isActive ? "text-[#6EC93E]" : "text-[#FFFFFF99]"
                  } ${item.isDropDown ? "group" : ""}`}
                >
                  {item.isDropDown ? (
                    <>
                      <span className="text-[.875rem] flex items-center font-medium gap-1.25 hover:text-white transition-colors duration-300 text-[#FFFFFF99] cursor-pointer">
                        {item.name}
                        <Icon
                          className="text-inherit rotate-180 transition-transform duration-300 group-hover:rotate-0"
                          icon={"bxs:up-arrow"}
                        />
                      </span>

                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-8 z-20 opacity-0 translate-y-2 scale-95 pointer-events-none transition-all duration-250 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto">
                        <div className="p-[.375rem_.5rem] bg-white rounded-md border border-[#DDDDDD] min-w-58.25 min-h-25 flex flex-col gap-1">
                          {item?.dropDownItems?.map((childItem, childIndex) => (
                            <Link
                              href={childItem?.href}
                              className={cn(
                                "font-medium rounded-[.1875rem] p-[.125rem_.25rem] text-[.8125rem] transition-colors duration-[.4s]",
                                childItem?.href === pathname
                                  ? "bg-[#6EC93E] text-white"
                                  : "bg-transparent text-black",
                              )}
                              key={`__${childIndex}__${index}__`}
                            >
                              {childItem?.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link href={item.href!}>{item.name}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <Button className="p-1.25 pl-5 text-[.8125rem] rounded-md items-center font-medium gap-3.5 flex">
          Launch EchoFi
          <span className="h-7.5 w-7.5 rounded-[.1875rem] bg-white flex items-center justify-center">
            <Icon
              className="text-[#6EC93E] rotate-45 w-4.5 h-4.5"
              icon={"ant-design:arrow-up-outlined"}
            />
          </span>
        </Button>
      </div>
    </header>
  );
};

export { Header };
