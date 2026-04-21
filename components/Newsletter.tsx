import { helveticaNeue } from "@/app/layout";
import React from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { SVGClient } from "./SVGClient";
import { cn } from "@/lib";

const Newsletter = () => {
  return (
    <section className="px-7.5 max-w-450 mx-auto">
      <div className="bg-[url(/images/noise-bg.png)] bg-blend-overlay  bg-[#6EC93E] rounded-[1.875rem] flex items-center justify-center">
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
            <Button className="bg-black font-medium text-[.625rem] rounded-lg min-w-21.75">
              Subscribe
            </Button>
          </div>
        </div>
        <SVGClient className="-ml-10" src="/svg/newsletter-illustration.svg" />
      </div>
    </section>
  );
};

export { Newsletter };
