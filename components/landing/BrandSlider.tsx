/* eslint-disable @next/next/no-img-element */

const brands = [
  "pulseng",
  "sportsbet",
  "theguardian",
  "thecable",
  "iban",
  "jesiah",
  "gowagr",
  "nirvana",
  "cbcom",
  "smcdao",
  "crewdao",
  "blockchainful",
  "wid",
];

const BrandSlider = () => {
  return (
    <section>
      <h3 className="md:hidden text-center mb-5.25 text-[1.5rem] text-black font-medium leading-5">
        Trusted by:
      </h3>

      <div className="bg-[#003223] md:py-5.25 relative overflow-hidden">
        <h3 className="absolute z-1 hidden md:flex font-medium text-white text-[1.5rem] leading-6 pr-10 lg:pr-12 left-0 top-0 h-full items-center pl-8 lg:pl-13.75 bg-linear-to-r from-[#003223] from-80% to-transparent">
          Trusted by:
        </h3>
        <div data-animated="true" className="marquee-anim">
          <div className="inner flex items-center gap-15 md:gap-25 w-max">
            {[...brands, ...brands].map((brand, index) => (
              <img
                key={`brand__${index}`}
                src={`/svg/${brand}.svg`}
                alt={brand}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { BrandSlider };
