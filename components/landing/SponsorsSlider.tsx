import { CSSProperties } from "react";
import { SVGClient } from "../common";

const LOGOS = [
  { name: "tokenpicks", color: "#002252" },
  { name: "launchmynft", color: "#326AEE" },
  { name: "assetchain", color: "#1685EE" },
  { name: "dogecomm", color: "#F1F1F1" },
  { name: "coinfieldest", color: "#D96E09" },
  { name: "jupng", color: "#1E3703" },
  { name: "sportsbetio", color: "#F1F1F1" },
];

const SponsorsSlider = () => {
  return (
    <section className="mb-11.25 md:mb-12.5">
      <h3 className="md:text-[2.5rem] text-[1.5rem] font-medium leading-5 md:leading-6 text-black text-center mb-5.25 md:mb-15">
        Our Sponsors
      </h3>

      <div className="overflow-hidden">
        <div
          className="marquee-anim"
          data-animated="true"
          style={{ "--marquee-gap": "0.5rem" } as CSSProperties}
        >
          <div className="inner flex md:gap-4 gap-1.75 w-max">
            {[...LOGOS, ...LOGOS].map((item, index) => (
              <span
                style={{ backgroundColor: item?.color }}
                className="glare shrink-0 rounded-xl aspect-[.947] flex items-center justify-center w-30 md:w-56.5 md:h-58"
                key={`__card__${index}`}
              >
                <SVGClient
                  className="scale-50 md:scale-100"
                  src={`/svg/${item?.name}.svg`}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { SponsorsSlider };
