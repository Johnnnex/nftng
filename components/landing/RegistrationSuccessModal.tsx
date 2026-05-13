"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button, SVGClient } from "@/components/common";

// const EVENT_LABELS: Record<string, string> = {
//   soccer_tournament: "Soccer Tournament",
//   unchain_summer_conference: "Unchain Summer Conference",
// }; // May need later for dashboard

const RegistrationSuccessModal = ({ onClose }: { onClose: () => void }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative bg-white rounded-[0.3125rem] shadow-2xl max-w-258.25 w-full py-14 text-center overflow-hidden"
      >
        <SVGClient
          className="w-fit hidden sm:block mx-auto"
          src="/svg/axis-success.svg"
        />
        <SVGClient
          className="w-fit sm:hidden mx-auto"
          src="/svg/axis-success-sm.svg"
        />
        <h3 className="my-1 text-[2rem] md:text-[2.25rem] text-center leading-10 md:leading-12 text-black max-w-152.75 mx-auto font-medium">
          Congratulations! <br /> Your submission has been made.
        </h3>
        <p className="font-[250] mb-5 md:mb-7.5 text-[1rem] text-black max-w-69.5 md:max-w-128.75 mx-auto text-center">
          Check your email for your ticket and important next steps.
        </p>
        <p className="font-normal text-[1rem] text-black mb-3.75">
          To stay ahead of updates:
        </p>
        <Button
          url="https://x.com/NFT__NG"
          target="_blank"
          className="sm:w-fit w-[70%] py-4! px-9.25!"
        >
          Follow us on X
        </Button>

        <div className="absolute w-full left-0 bottom-0 h-fit overflow-hidden">
          <div className="flex w-max gap-1.5">
            {[
              "#FF6400",
              "#74FF6B",
              "#FFE5D7",
              "#003123",
              "#FFD60A",
              "#D9D9D9",
              "#FF6400",
              "#003123",
              "#74FF6B",
              "#FF6400",
              "#FFD60A",
              "#FFE5D7",
              "#003123",
              "#FFE5D7",
              "#FF6400",
            ]?.map((item, index) => (
              <span
                key={`__item__span__${index}__`}
                style={{ backgroundColor: item }}
                className="h-2.75 min-w-20"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export { RegistrationSuccessModal };
