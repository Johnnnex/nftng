"use client";

import { Icon } from "@iconify/react";
import { Button } from "./Button";
import { SVGClient } from "./SVGClient";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const navItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Get Involved", isDropDown: true },
    { name: "Events", href: "/events" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <header className="fixed z-1 w-full left-0 top-4">
      <div className="bg-[#003223] rounded-[.625rem] p-[.8125rem_1.875rem] flex justify-between items-center max-w-400 w-[95%] mx-auto">
        <SVGClient src="/svg/logo-lg.svg" />
        <nav>
          <ul className="flex items-center gap-11.5">
            {navItems?.map((item, index) => {
              const isActive = item.href === pathname;

              return (
                <li
                  key={`__item__${item.name}__${index}`}
                  className={`text-[.875rem] font-medium hover:text-white transition-colors duration-300 ${
                    isActive ? "text-[#6EC93E]" : "text-[#FFFFFF99]"
                  }`}
                >
                  {item.isDropDown ? (
                    <span className="text-[.875rem] flex items-center font-medium gap-1.25 hover:text-white transition-colors duration-300 text-[#FFFFFF99]">
                      {item.name}
                      <Icon
                        className="text-inherit rotate-180"
                        icon={"bxs:up-arrow"}
                      />
                    </span>
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
