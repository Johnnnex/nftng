/* eslint-disable @next/next/no-img-element */
import { Button, FAQs, Newsletter } from "@/components";
import { cn } from "@/lib";
import { Icon } from "@iconify/react";

const Events = () => {
  return (
    <>
      <section className="pt-38.5 px-7.5 pb-9 max-w-450 mx-auto">
        <h1 className="text-black text-[3.125rem] font-medium w-274.75 mb-2.25">
          Creating memorable experiences and meaningful mentorship through our
          events
        </h1>
        <p className="text-[#000000B2] font-normal w-141 text-[1.125rem] mb-6.25">
          Unchain Summer harnesses blockchain to spark creativity and innovation
          across Africa, spotlighting the talent shaping the African Web3
          community.
        </p>
        <Button>Get Tickets</Button>
      </section>

      <section className="pt-22.25 px-7.5 pb-9 max-w-450 mx-auto">
        <h2 className="text-black font-medium text-[2.5rem] mb-9.25">Events</h2>

        <div className="grid grid-cols-4 gap-3.75">
          {[
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
          ]?.map((item, index) => (
            <div key={`__item__${index}__`} className="flex flex-col">
              <figure className="h-89">
                <img
                  src={`/images/${item?.image}`}
                  className="w-full object-cover object-center h-full"
                  alt="Events Image 1"
                />
              </figure>
              <div className="p-[1.25rem_1.125rem_1.625rem_1.125rem] flex flex-1 flex-col bg-[#1A1A1A]">
                <h4 className="font-medium mb-2.25 text-white text-[1.5rem]">
                  {item?.title}
                </h4>
                <h5 className="font-medium mb-1.25 text-white text-[1rem]">
                  {item?.subtopic}
                </h5>
                <div className="flex-1 gap-5.25 flex flex-col justify-between">
                  <p className="text-[#FFFFFFB2] text-[0.8125rem] font-normal">
                    {item?.content}
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
          ))}
        </div>
      </section>

      <section className="pt-17.75 px-7.5 max-w-450 mx-auto">
        <div className="flex gap-4 mb-5 items-center">
          <span className="w-5 h-10 bg-[#6EC93E] rounded-sm" />
          <span className="font-semibold text-[1rem] text-[#6EC93E] leading-5">
            Merch Product
          </span>
        </div>
        <div className="flex justify-between">
          <h2 className="text-black text-[2.25rem] leading-12 font-semibold">
            Explore Our Products
          </h2>
          <Icon className="w-10.75 h-10.75" icon={"mdi:cart-outline"} />
        </div>
        <div className="mt-11.75 mb-11.75 gap-7.5 grid grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={`__item__${index}`}>
              <figure className="aspect-[1.08] rounded-sm overflow-hidden relative">
                <img
                  className="object-cover"
                  src={"/images/demoprod.png"}
                  alt="Demo Product"
                />
                <button className="w-8.5 h-8.5 rounded-[50%] absolute right-3 top-3 flex items-center justify-center bg-white">
                  <Icon icon={"hugeicons:favourite"} />
                </button>
              </figure>
              <div className="pt-4 bg-white">
                <p className="text-[1rem] font-medium text-black leading-6 mb-2">
                  Unchain Summer (Men merch)
                </p>
                <div className="flex gap-2 items-center">
                  <span className="text-[#DB4444] text-[1rem] leading-6 font-medium">
                    $100
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          index < 3 ? "text-[#FFAD33]" : "text-[#757575]",
                        )}
                        key={`__item__${index}__`}
                        icon={"iconoir:star-solid"}
                      />
                    ))}
                  </div>
                  <span className="text-[#757575] text-[.875rem] font-semibold leading-5.25">
                    (35)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-fit mx-auto block py-4 text-[1rem] rounded-sm font-medium">
          View All Products
        </Button>
      </section>

      <FAQs />

      <Newsletter />
    </>
  );
};

export default Events;
