"use client";

import { Icon } from "@iconify/react";
import { Button } from "./Button";
import { SVGClient } from "./SVGClient";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib";
import { useState } from "react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  {
    name: "Get Involved",
    isDropDown: true,
    dropDownItems: [
      { name: "Apply to Speaker", href: "/speak" },
      { name: "Apply to Sponsor", href: "/sponsor" },
      { name: "Become a Volunteer", href: "/volunteer" },
      { name: "Partner With Us", href: "/partner" },
      { name: "Attend Event", href: "/event" },
    ],
  },
  { name: "Events", href: "/events" },
  { name: "Contact Us", href: "/contact" },
];

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [getInvolvedOpen, setGetInvolvedOpen] = useState(false);


  return (
    <header className="fixed z-3 w-full left-0 top-4">
      <div className="max-w-400 w-[95%] mx-auto">
        {/* Main bar */}
        <div
          className={cn(
            "bg-[#003223] p-[.8125rem_.5625rem] md:p-[.8125rem_1.875rem] flex justify-between items-center transition-[border-radius] duration-300",
            isOpen ? "rounded-t-[.625rem]" : "rounded-[.625rem]",
          )}
        >
          <SVGClient className="hidden md:block" src="/svg/logo-lg.svg" />
          <SVGClient className="md:hidden" src="/svg/logo-sm.svg" />

          {/* Desktop nav */}
          <nav className="hidden lg:block">
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
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-5 z-20 opacity-0 translate-y-2 scale-95 pointer-events-none transition-all duration-250 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto">
                          <div className="bg-[#003223] rounded-[.625rem] min-w-56 overflow-hidden shadow-[0_12px_40px_0_rgba(0,0,0,0.45)] border border-white/10">
                            <div className="h-0.75 w-full bg-linear-to-r from-[#6EC93E]/0 via-[#6EC93E] to-[#6EC93E]/0" />
                            <div className="p-1.5 flex flex-col">
                              {item?.dropDownItems?.map((childItem, childIndex) => (
                                <Link
                                  href={childItem?.href}
                                  className={cn(
                                    "group/item flex items-center justify-between gap-6 px-3 py-2.5 rounded-md text-[.8125rem] font-medium transition-all duration-200",
                                    childItem?.href === pathname
                                      ? "bg-[#6EC93E]/15 text-[#6EC93E]"
                                      : "text-[#FFFFFF80] hover:text-white hover:bg-white/5",
                                  )}
                                  key={`__${childIndex}__${index}__`}
                                >
                                  {childItem?.name}
                                  <Icon
                                    icon={"ant-design:arrow-up-outlined"}
                                    className={cn(
                                      "rotate-45 w-3 h-3 transition-all duration-200 opacity-0 -translate-x-1",
                                      childItem?.href === pathname
                                        ? "opacity-100 translate-x-0 text-[#6EC93E]"
                                        : "group-hover/item:opacity-100 group-hover/item:translate-x-0",
                                    )}
                                  />
                                </Link>
                              ))}
                            </div>
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

          <div className="flex gap-2">
            <Button className="p-1.25 hidden pl-5 text-[.8125rem] rounded-md items-center font-medium gap-3.5 md:flex">
              Launch EchoFi
              <span className="h-7.5 w-7.5 rounded-[.1875rem] bg-white flex items-center justify-center">
                <Icon
                  className="text-[#6EC93E] rotate-45 w-4.5 h-4.5"
                  icon={"ant-design:arrow-up-outlined"}
                />
              </span>
            </Button>

            <Button
              onClick={() => setIsOpen((prev) => !prev)}
              className="rounded-sm lg:hidden w-8.5 h-8.5 md:h-10 md:w-10 flex items-center justify-center p-0"
            >
              <Icon
                className={cn(
                  "text-white w-7.5 h-7.5 transition-transform duration-300",
                  isOpen ? "rotate-90" : "rotate-0",
                )}
                icon={isOpen ? "jam:close" : "jam:menu"}
              />
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={cn(
            "lg:hidden bg-[#003223] rounded-b-[.625rem] overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none",
          )}
        >
          <div className="px-3 pb-5 pt-2 border-t border-white/10">
            <ul className="flex flex-col mb-5">
              {navItems.map((item, index) => {
                const isActive = item.href === pathname;
                return (
                  <li key={`__mob__${item.name}__${index}`}>
                    {item.isDropDown ? (
                      <div>
                        <button
                          onClick={() => setGetInvolvedOpen((prev) => !prev)}
                          className="w-full flex items-center justify-between py-3.5 px-3 rounded-[.5rem] text-[.9375rem] font-medium text-[#FFFFFF99] hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                          {item.name}
                          <Icon
                            className={cn(
                              "transition-transform duration-300",
                              getInvolvedOpen ? "rotate-0" : "rotate-180",
                            )}
                            icon={"bxs:up-arrow"}
                          />
                        </button>

                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            getInvolvedOpen
                              ? "max-h-72 opacity-100"
                              : "max-h-0 opacity-0",
                          )}
                        >
                          <ul className="ml-3 pl-4 border-l-2 border-[#6EC93E]/30 flex flex-col gap-0.5 py-1 mb-1">
                            {item.dropDownItems?.map((child, ci) => (
                              <li key={`__mob_child__${ci}`}>
                                <Link
                                  href={child.href}
                                  onClick={() => { setIsOpen(false); setGetInvolvedOpen(false); }}
                                  className={cn(
                                    "block py-2.5 px-3 rounded-[.375rem] text-[.875rem] font-medium transition-all duration-200",
                                    child.href === pathname
                                      ? "text-[#6EC93E] bg-[#6EC93E]/10"
                                      : "text-[#FFFFFF80] hover:text-white hover:bg-white/5",
                                  )}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block py-3.5 px-3 rounded-[.5rem] text-[.9375rem] font-medium transition-all duration-200",
                          isActive
                            ? "text-[#6EC93E] bg-[#6EC93E]/10"
                            : "text-[#FFFFFF99] hover:text-white hover:bg-white/5",
                        )}
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <Button className="w-full p-1.25 pl-5 text-[.8125rem] rounded-md flex md:hidden items-center font-medium gap-3.5 justify-between">
              Launch EchoFi
              <span className="h-7.5 w-7.5 rounded-[.1875rem] bg-white flex items-center justify-center">
                <Icon
                  className="text-[#6EC93E] rotate-45 w-4.5 h-4.5"
                  icon={"ant-design:arrow-up-outlined"}
                />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
