import { cn } from "@/lib";
import { helveticaNeue } from "../layout";
import { Button, FAQs, Input, SVGClient } from "@/components";
import { Icon } from "@iconify/react";

const Contact = () => {
  return (
    <>
      <section className="pt-38.5 px-7.5 pb-9 max-w-450 mx-auto">
        <h1
          className={cn(
            "text-black font-normal text-[3.125rem] mb-4",
            helveticaNeue.className,
          )}
        >
          Get in touch
        </h1>
        <p className="text-[#000000B2] text-[1.125rem] font-normal w-157.75 mb-8">
          Check out our FAQ section for information about the Unchain Summer
          events & exhibitions including participation opportunities,
          registration details, and more.
        </p>
        <div className="flex mb-17.75 gap-5">
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="flex gap-5">
              {[
                {
                  icon: "mynaui:chat",
                  title: "Quick chat",
                  bgColor: "#003223",
                  color: "#fff",
                  content: "Talk to someone from the inside",
                  cta: {
                    link: "mailto:chatNFTng@gmail.com",
                    text: "chatNFTng@gmail.com",
                  },
                },
                {
                  icon: "proicons:x-twitter",
                  title: "X (Twitter)",
                  bgColor: "#74FF6B",
                  color: "#000",
                  content: "Engage with us on twitter!",
                  cta: {
                    link: "https://x.com/NFTng",
                    text: "NFTng@Twitter.com",
                  },
                },
              ]?.map((item, index) => (
                <div
                  key={`__item__${index}__`}
                  className="bg-[#F1F1F1] flex-1 rounded-2xl p-5"
                >
                  <span
                    style={{
                      backgroundColor: item?.bgColor,
                    }}
                    className="flex items-center justify-center mb-5.5 rounded-lg h-10 w-10"
                  >
                    <Icon
                      icon={item?.icon}
                      style={{ color: item?.color }}
                      className="w-6 h-6"
                    />
                  </span>
                  <h6 className="text-black text-[1.125rem] font-normal">
                    {item?.title}
                  </h6>
                  <p className="text-[#000000B2] text-[1rem] font-normal mb-3.5">
                    {item?.content}
                  </p>
                  <a
                    className="underline text-black font-bold text-[.875rem]"
                    href={item?.cta?.link}
                    target="_blank"
                  >
                    {item?.cta?.text}
                  </a>
                </div>
              ))}
            </div>
            <div className="flex gap-5">
              {[
                {
                  icon: "ep:service",
                  title: "Customer Service",
                  bgColor: "#FF6400",
                  color: "#fff",
                  content: "You need support to understand?",
                  cta: {
                    link: "mailto:support@nftng.io",
                    text: "support@nftng.io",
                  },
                },
                {
                  icon: "solar:phone-outline",
                  title: "Call Representative",
                  bgColor: "#FFD60A",
                  color: "#000",
                  content: "Speak to someone smart",
                  cta: {
                    link: "tel:+15845430000",
                    text: "+1 584 543 0000",
                  },
                },
              ]?.map((item, index) => (
                <div
                  key={`__item__${index}__`}
                  className="bg-[#F1F1F1] flex-1 rounded-2xl p-5"
                >
                  <span
                    style={{
                      backgroundColor: item?.bgColor,
                    }}
                    className="flex items-center justify-center mb-5.5 rounded-lg h-10 w-10"
                  >
                    <Icon
                      icon={item?.icon}
                      style={{ color: item?.color }}
                      className="w-6 h-6"
                    />
                  </span>
                  <h6 className="text-black text-[1.125rem] font-normal">
                    {item?.title}
                  </h6>
                  <p className="text-[#000000B2] text-[1rem] font-normal mb-3.5">
                    {item?.content}
                  </p>
                  <a
                    className="underline text-black font-bold text-[.875rem]"
                    href={item?.cta?.link}
                    target="_blank"
                  >
                    {item?.cta?.text}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-[#F1F1F1] rounded-2xl p-6.25">
            <h3
              className={cn(
                helveticaNeue.className,
                "font-normal text-[1.5rem] text-black mb-5.25",
              )}
            >
              Tell us something....
            </h3>
            <div className="grid relative grid-cols-2 gap-y-3.25 gap-x-4">
              {[
                { label: "Name", type: "text" },
                { label: "Email", type: "email" },
                { label: "Subject", type: "text" },
                { label: "X Handle (Optional)", type: "text" },
                { label: "Message", type: "textarea" },
              ]?.map((item, index) => (
                <div
                  key={`____item____${index}__`}
                  className={cn(index === 4 ? "col-span-2" : "")}
                >
                  <Input
                    label={item?.label}
                    type={item?.type}
                    className={cn("w-full")}
                  />
                </div>
              ))}
              <div className="absolute bg-[#F1F1F1] bottom-0 pt-2 pl-2 right-0 rounded-tl-[.625rem]">
                <Button className="rounded-[.625rem]">Submit</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-7.5 max-w-450 mx-auto">
        <div className="bg-[#6DC43E] overflow-hidden relative py-16 rounded-[1.875rem]">
          <div className="flex z-1 relative p-[.5rem_1.0625rem] w-fit mx-auto gap-1.5 bg-white rounded-[3.125rem] items-center">
            <Icon className="w-6 h-6 text-[#6EC93E]" icon={"bxl:telegram"} />
            <span className="text-black text-[.875rem] font-nomal">
              TELEGRAM
            </span>
          </div>

          <h2 className="relative mt-8 z-1 text-white text-[4.25rem] font-semibold w-163.75 mb-4 mx-auto text-center leading-16.75">
            Join the Unchain Community
          </h2>

          <p className="text-white text-[1rem] font-normal w-123.75 mx-auto text-center relative z-1 mb-12.5">
            A growing space for builders, creators, and curious minds. Connect,
            learn, share ideas, and stay plugged into everything Unchain Summer.
          </p>

          <button className="flex z-1 relative p-[.6875rem_1.875rem] w-fit mx-auto gap-1.5 bg-white rounded-[3.125rem] items-center">
            <Icon
              className="w-7.5 h-7.5 text-[#6EC93E]"
              icon={"bxl:telegram"}
            />
            <span className="text-[#6EC93E] text-[.9375rem] font-medium">
              Join our Telegram Community
            </span>
          </button>

          <div className="h-[76%] flex bg-[#6EC93E00] justify-between w-full left-0 absolute bottom-0">
            <div className="absolute bg-linear-to-b from-[#6EC93E00] to-[#6EC93E] inset-0 w-full h-full"></div>
            <SVGClient src="/svg/ellipse-left.svg" />
            <SVGClient src="/svg/ellipse-right.svg" />
          </div>
        </div>
      </section>

      <FAQs />
    </>
  );
};

export default Contact;
