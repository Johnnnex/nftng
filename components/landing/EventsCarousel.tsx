/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { Button } from "@/components/common";

const eventsData = [
  {
    image: "events-img-1.png",
    title: "NFT NG 2022",
    subtopic:
      "Theme: Bringing the African Web3 Community to the Global Spotlight",
    content:
      "The first NFT NG event and the largest gathering of NFT and Web3 enthusiasts in Africa at the time. Held at Balmoral Convention Center, Lagos, it marked the foundation of the NFT NG community and its growth across the continent.",
  },
  {
    image: "events-img-2.png",
    title: "Defi Summer 2024",
    subtopic: "Theme: Building the Future of Finance",
    content:
      "Held at Landmark Event Center, Lagos, DeFi Summer 2024 focused on education, innovation, and community engagement, alongside a football tournament.",
  },
  {
    image: "events-img-3.png",
    title: "Unchain Summer 2025",
    subtopic: "Theme: Web3 for Everyone",
    content:
      "A week long Web3 experience in Lagos with over 1,000 participants. Activities included a main conference, DeFi competition, football tournament, and a closing event.",
  },
  {
    image: "events-img-4.png",
    title: "Unchain Summer 2025",
    subtopic: "Theme: Web3 for Everyone",
    content:
      "A week long Web3 experience in Lagos with over 1,000 participants. Activities included a main conference, DeFi competition, football tournament, and a closing event.",
  },
];

const EventsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {eventsData.map((item, index) => (
            <div
              key={`event__${index}`}
              className="shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/4 min-w-0 mr-3.75"
            >
              <div className="flex flex-col h-full">
                <figure className="h-89">
                  <img
                    src={`/images/${item.image}`}
                    className="w-full object-cover object-center h-full"
                    alt={item.title}
                  />
                </figure>
                <div className="p-[1.25rem_1.125rem_1.625rem_1.125rem] flex flex-1 flex-col bg-[#1A1A1A]">
                  <h4 className="font-medium mb-2.25 text-white text-[1.5rem]">
                    {item.title}
                  </h4>
                  <h5 className="font-medium mb-1.25 text-white text-[1rem]">
                    {item.subtopic}
                  </h5>
                  <div className="flex-1 gap-5.25 flex flex-col justify-between">
                    <p className="text-[#FFFFFFB2] text-[0.8125rem] font-normal">
                      {item.content}
                    </p>
                    <Button className="flex gap-2 w-full border-2 border-[#6EC93E] py-3 justify-center items-center bg-transparent rounded-[.625rem]">
                      View Gallery
                      <Icon
                        icon={"hugeicons:arrow-right-02"}
                        className="w-6 h-6"
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          {eventsData.map((_, index) => (
            <button
              key={`dot__${index}`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "transition-all duration-300 h-2",
                index === activeIndex
                  ? "bg-[#6EC93E] w-8 rounded-[20px]"
                  : "bg-[#6EC93E33] rounded-full w-2",
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous"
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
              canScrollPrev
                ? "border-[#6EC93E] text-[#6EC93E] hover:bg-[#6EC93E] hover:text-white"
                : "border-[#D9D9D9] text-[#D9D9D9] cursor-not-allowed",
            )}
          >
            <Icon icon="hugeicons:arrow-left-02" className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next"
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
              canScrollNext
                ? "border-[#6EC93E] text-[#6EC93E] hover:bg-[#6EC93E] hover:text-white"
                : "border-[#D9D9D9] text-[#D9D9D9] cursor-not-allowed",
            )}
          >
            <Icon icon="hugeicons:arrow-right-02" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { EventsCarousel };
