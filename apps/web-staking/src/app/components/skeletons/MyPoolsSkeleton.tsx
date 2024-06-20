import React from "react";

const MyPoolsSkeleton = () => {
  return (
    <div className="md:max-w-[338px] max-w-[328px] h-[328px] bg-[#201C1C] global-callout-clip-path mt-4">
      <div className="flex justify-between px-[17px] pt-4">
        <div className="rounded-full w-[91px] h-[91px] bg-[#403737] animate-pulse"></div>
        <div className="bg-[#403737] w-[108px] h-[32px] animate-pulse"></div>
      </div>
      <div className="px-[17px] w-full mt-4">
        <div className="w-[320px] h-[36px] bg-[#403737] animate-pulse"></div>
      </div>
      <div className="px-[17px] mt-4 flex gap-[20px]">
        <div>
          <div className="w-[81px] h-[28px] bg-[#403737] animate-pulse">

          </div>
          <div className="w-[81px] h-[28px] bg-[#403737] animate-pulse mt-2">

          </div>
        </div>
        <div>
          <div className="w-[81px] h-[28px] bg-[#403737] animate-pulse">

          </div>
          <div className="w-[81px] h-[28px] bg-[#403737] animate-pulse mt-2">

          </div>
        </div>
        <div>
          <div className="w-[81px] h-[28px] bg-[#403737] animate-pulse">

          </div>
          <div className="w-[81px] h-[28px] bg-[#403737] animate-pulse mt-2">

          </div>
        </div>
      </div>
      <div className="px-[17px] mt-9 flex gap-[40px]">
        <div>
          <div className="w-[100px] h-[23px] bg-[#403737]">

          </div>
          <div className="w-[81px] h-[2px] bg-[#403737] mt-2">

          </div>
        </div>

        <div>
          <div className="w-[100px] h-[23px] bg-[#403737]">

          </div>
          <div className="w-[81px] h-[2px] bg-[#403737] mt-2">

          </div>
        </div>

      </div>
    </div>
  );
};

export default MyPoolsSkeleton;