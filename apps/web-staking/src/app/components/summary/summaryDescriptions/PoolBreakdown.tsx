import React from "react";

interface PoolBreakdownProps {
  owner: number;
  keyholder: number;
  staker: number;
}

//TODO add uptime

const checkDigits = (arr: number[]) => { // using this function to discover if we have at least 2 numbers with digits after point.
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].toString().split(".").length > 1) {
      return true;
    }
  }
  return false;
};

const PoolBreakdown = ({ owner, keyholder, staker }: PoolBreakdownProps) => {
  return (
    <div
      className={`z-[30] mt-4 xl:mt-0 flex-col mb-6 xl:mr-2 mr-0 lg:h-[135px] h-[100px] bg-gradient-to-b from-[#362E31] to-[#2E2729] global-cta-clip-path w-full xl:max-w-[456px] max-w-full xl:mb-0 text-white xl:absolute flex md:right-[20px] top-[85px]`}>
      <div
        className={`flex justify-center h-full ${checkDigits([owner, keyholder, staker]) ? "lg:gap-6 gap-[14px]" : "lg:gap-8 gap-4"} w-full h-[80px] items-center`}>
        <div className="flex flex-col items-center">
          <span className="block md:text-4xl text-3xl font-bold text-white text-center">{owner}%</span>
          <span className="block text-lg font-medium text-elementalGrey">Owner split</span>
        </div>
        <span className="block bg-afterDark w-[1px] h-[38px]"></span>
        <div className="flex flex-col items-center">
          <span className="block md:text-4xl text-3xl font-bold text-white text-center">
            {keyholder}%
          </span>
          <span className="block text-lg font-medium text-elementalGrey">Key split</span>
        </div>
        <span className="block bg-afterDark w-[1px] h-[38px]"></span>
        <div className="flex flex-col items-center">
          <span className="block md:text-4xl text-3xl font-bold text-white text-center">{staker}%</span>
          <span className="block text-lg font-medium text-elementalGrey">esXAI split</span>
        </div>
      </div>
      {/*<span className="block w-full max-w-[414px] h-[2px] bg-afterDark mx-auto md:mt-[20px] mt-[10px]"></span>*/}
      {/*<div className="flex w-full justify-center gap-1 my-auto">*/}
      {/*  <span className="block text-lg text-drunkenDragonFly font-semibold">99.99%</span>*/}
      {/*  <span className="block text-lg font-medium text-americanSilver">Pool uptime</span>*/}
      {/*</div>*/}
    </div>
  );
};

export default PoolBreakdown;