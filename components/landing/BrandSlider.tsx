/* eslint-disable @next/next/no-img-element */

const brands = ["pulseng", "sportsbet", "theguardian", "thecable"];

const BrandSlider = () => {
  return (
    <section className="bg-[#003223] md:py-5.25 overflow-hidden">
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
    </section>
  );
};

export { BrandSlider };
