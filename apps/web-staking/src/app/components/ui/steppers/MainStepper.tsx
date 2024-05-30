"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "../../icons/IconsComponent";

const MainStepper = () => {
  const [count, setCount] = useState("01");

  const handleChangeCount = (value: number) => {
    setCount((count: string) => {
      if (Number(count) < 10) {
        return String(Number(count) + value).padStart(2, "0");
      }
      return String(Number(count) + value);
    });
  };

  return (
    <div className="hover:bg-hornetSting global-cta-clip-path p-[1px] duration-200 ease-in mt-3">
      <div className="flex items-center bg-nulnOil global-cta-clip-path">
        <button
          className="bg-nulnOil px-[25px] py-[31px] global-cta-clip-path hover:bg-velvetBlack duration-200 ease-in"
          type="button"
          title={`Decrease`}
          onClick={() => handleChangeCount(-1)}
        >
          <MinusIcon />
        </button>
        <input
          type="number"
          value={count}
          min={1}
          max={99}
          className="font-bold text-3xl text-center text-white bg-nulnOil max-w-[80px] py-[15px] focus:outline-none"
          readOnly
        />
        <button
          className="bg-nulnOil p-[25px] global-cta-clip-path hover:bg-velvetBlack duration-200 ease-in"
          type="button"
          title={`Increase`}
          onClick={() => handleChangeCount(1)}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default MainStepper;
