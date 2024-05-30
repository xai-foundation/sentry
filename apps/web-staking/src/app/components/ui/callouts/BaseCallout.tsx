import React, { ReactNode } from "react";

interface BaseCalloutProps {
  children: ReactNode
  isWarning?: boolean,
  isFocused?: boolean,
  withOutSpecificStyles?: boolean;
  extraClasses: {
    calloutWrapper: string; // use it to define proper height of component, because we can't do calc(100%-2px) without static height
    calloutFront?: string;
  }
}

const BaseCallout = ({ extraClasses, isWarning, isFocused, withOutSpecificStyles, children }: BaseCalloutProps) => {
  return (
    <div
      className={`global-cta-clip-path group-hover:bg-hornetSting ${isWarning ? "text-bananaBoat bg-transparent" : "text-americanSilver bg-chromaphobicBlack"} ${isFocused && "bg-hornetSting"} flex justify-center items-center text-lg font-medium z-0 ${extraClasses.calloutWrapper} ${!withOutSpecificStyles && !isWarning && "hover:bg-hornetSting"}`}>
      <div
        className={`global-cta-clip-path w-full ${isWarning ? "bg-bananaBoat/10 md:px-[24px] md:py-[15px]" : "bg-nulnOil md:p-[14px]"} px-[18px] py-[7px] ${isFocused && !withOutSpecificStyles && "bg-velvetBlack"}  max-w-[calc(100%-2px)] h-[calc(100%-2px)] flex justify-center items-center z-0 ${extraClasses.calloutFront}`}>
        {children}
      </div>
    </div>
  );
};

export default BaseCallout;