/* eslint-disable @next/next/no-img-element */
import { SVGClient } from "@/components";
import { cn } from "@/lib";
import { Icon } from "@iconify/react";

const ProductDetail = () => {
  return (
    <>
      <section className="pt-37.5 max-w-370 mx-auto lg:px-7.5 px-4">
        <div className="flex mb-11.25 w-fit ml-auto gap-3">
          <button>
            <SVGClient src="/svg/lens.svg" />
          </button>

          <button>
            <SVGClient src="/svg/cart.svg" />
          </button>
        </div>
        <div className="flex mb-20 gap-10 items-center">
          <figure className="w-152.5 aspect-[1.151]">
            <img
              className="w-full h-full"
              alt="Product Image"
              src={"/images/product-image.png"}
            />
          </figure>
          <div className="flex-1">
            <h1 className="text-[2rem] text-black font-semibold mb-3.5 leading-6">
              Unchain Summer(Women merch)
            </h1>
            <div className="flex mb-3.5 items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < 3 ? "text-[#FFAD33]" : "text-[#757575]",
                    )}
                    icon="iconoir:star-solid"
                  />
                ))}
              </div>
              <span className="text-[1rem] font-normal text-[#00000099]">
                <span className="text-[#6EC93E]">3/</span>5
              </span>
            </div>
            <h4 className="text-[2rem] font-bold text-black mb-5">$260</h4>
            <p className="text-[#00000099] leading-5.5 text-[1rem] w-[90%] font-normal mb-6">
              This graphic t-shirt which is perfect for any occasion. Crafted
              from a soft and breathable fabric, it offers superior comfort and
              style.
            </p>
            <div className="flex flex-col gap-6 mb-6">
              {Array.from({ length: 2 }, (_, index) => (
                <hr
                  className="h-px w-full bg-[#0000001A] border-[#0000001A]"
                  key={`__item__hr__${index}__`}
                />
              ))}
            </div>
            <span className="text-[#00000099] font-normal text-[1rem] block mb-4">
              Choose Size
            </span>
            <div className="flex mb-6 gap-3">
              {[
                { name: "Small", isSelected: true },
                { name: "Medium", isSelected: false },
                { name: "Large", isSelected: false },
                { name: "X-Large", isSelected: false },
              ]?.map((item, index) => (
                <button
                  key={`__item__button__${index}__`}
                  className={cn(
                    "text-[1rem] font-normal p-[.75rem_1.5rem] transition-all duration-200 rounded-[3.875rem]",
                    item?.isSelected
                      ? "text-white bg-[#6EC93E]"
                      : "text-[#00000099] bg-[#F0F0F0]",
                  )}
                >
                  {item?.name}
                </button>
              ))}
            </div>

            <hr className="h-px w-full bg-[#0000001A] mb-6 border-[#0000001A]" />

            <div className="flex gap-5">
              <div className="flex items-center rounded-[3.875rem] bg-[#F0F0F0] p-[1rem_1.25rem] gap-9.5">
                <button className="h-6 w-6 flex items-center justify-center">
                  <SVGClient src="/svg/minus.svg" />
                </button>
                <span className="text-[#6EC93E] font-medium text-[1rem]">
                  1
                </span>
                <button className="h-6 w-6 flex items-center justify-center">
                  <SVGClient src="/svg/plus.svg" />
                </button>
              </div>
              <button className="py-4 text-white font-medium rounded-[3.875rem] text-[1rem] flex-1 bg-[#6EC93E]">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        <div className="flex mb-12 w-fit gap-78.5 mx-auto">
          {[
            { name: "Product Details", isActive: false },
            { name: "Rating & Reviews", isActive: true },
          ]?.map((item, index) => (
            <button
              className={cn(
                "font-normal leading-5.5 text-[1.25rem]",
                item?.isActive ? "text-[#6EC93E]" : "text-[#00000099]",
              )}
              key={`__item__${index}__button__`}
            >
              {item?.name}
            </button>
          ))}
        </div>
        <section>
          <div className="flex mb-6 justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#6EC93E] text-[1.5rem] font-bold">
                All Reviews
              </span>
              <span className="text-[1rem] font-normal text-[#00000099]">
                (451)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button className="text-[#6EC93E] h-12 w-12 flex rounded-[50%] items-center justify-center bg-[#F0F0F0]">
                <SVGClient src="/svg/filter.svg" />
              </button>

              <button className="flex items-center bg-[#F0F0F0] gap-5.25 p-[.8125rem_1.25rem] rounded-[3.875rem] font-medium text-[1rem] text-[#6EC93E]">
                Latest <SVGClient src="/svg/angle-down.svg" />
              </button>
              <button className="flex items-center bg-[#6EC93E] font-medium gap-5.25 p-[.8125rem_1.875rem] rounded-[3.875rem] text-[1rem] text-white">
                Write a Review
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="border border-[#0000001A] rounded-[1.25rem] p-[1.75rem_2rem]">
              <div className="flex justify-between items-center mb-3.75">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < 3 ? "text-[#FFAD33]" : "text-[#757575]",
                      )}
                      icon="iconoir:star-solid"
                    />
                  ))}
                </div>
                <SVGClient src="/svg/ellipses.svg" />
              </div>
              <div className="flex">
                <span>Samantha D.</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  );
};

export default ProductDetail;
