import React, { useEffect, useState } from "react";
import { TextButton } from "@/app/components/ui/buttons";
import { SuccessIcon } from "@/app/components/icons/IconsComponent";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  header?: string;
  isWarning?: boolean;
  withCTA?: boolean;
  onCTAClick?: () => void;
  extraClasses?: {
    tooltipContainer?: string;
    // you can modify width of tooltip container to avoid adaptive issues, also set tooltipText classes to "!text-wrap"
    // by default tooltip width is 456px as in design, for some cases we can modify it with tooltipContainer classes
    tooltipText?: string;
    tooltipWrapper?: string;
    group?: string;
  };
  showOnClick?: boolean;
  delay?: number;
  onClickEvent?: () => void;
}

//todo add transition

const Tooltip = ({
                   children,
                   header,
                   extraClasses,
                   isWarning,
                   content,
                   withCTA,
                   onCTAClick,
                   showOnClick,
                   onClickEvent,
                   delay,
                 }: TooltipProps) => {

  const [isOpened, setIsOpened] = useState(false);

  const openOnHover = () => {
    if (showOnClick) return;
    
    setIsOpened(true);
  };

  const closeOnMouseLeave = () => {
    if (showOnClick) return;
    setIsOpened(false);
  };

  const openOnClick = () => {
    if (showOnClick) {
      setIsOpened(true);
      onClickEvent && onClickEvent();
    }
  };

  useEffect(() => {
    if (!showOnClick && !delay) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpened(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpened]);

  return (
    <div
      className={`relative ease-in duration-300 w-max ${showOnClick && "cursor-pointer"} ${extraClasses?.group}`}
      onClick={openOnClick}
    >
      <div
        className="select-none"
        onMouseOver={openOnHover}
      >
        {children}
      </div>
      <div
        onMouseOver={openOnHover}
        onMouseLeave={closeOnMouseLeave}
        className={`${isOpened && "lg:block"} hidden ease-in duration-300 z-40 before:content[''] before:absolute before:bottom-[-20px] before:left-2/4 before:block before:h-[0px] before:w-[0px] before:border-solid ${isWarning ? "before:border-b-black" : "before:border-b-red"} before:border-b-[7px] before:border-x-transparent before:border-x-[4px] before:border-t-0  before:-translate-y-2/4 before:-translate-x-2/4 before:opacity-100  w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[20px] ${isWarning ? "border-b-bananaBoat" : "border-b-black"} absolute bottom-[-20px] left-2/4 -translate-x-2/4`}>
        <div
          className={`absolute w-[456px] ${isWarning ? "bg-bananaBoat" : "bg-black"} py-[15px] px-[15px] top-[20px] left-[-38px] ${extraClasses?.tooltipContainer}`}>
          {header && <span
            className={`${isWarning ? "text-nulnOil" : "text-white"} font-bold ${isWarning ? "text-[17px]" : "text-lg"}`}>{header}</span>}
          <span className={`${isWarning ? "text-nulnOil" : "text-americanSilver"} text-[17px] flex gap-2 items-center h-full font-medium ${extraClasses?.tooltipText}`}>
              {content}
              {showOnClick && <SuccessIcon />}
          </span>
          {withCTA && onCTAClick &&
            <TextButton
               onClick={onCTAClick}
               buttonText={"Learn more"}
               className="!p-0 !pb-2"
                isArrow />}
        </div>
      </div>

    </div>
  );
};

export default Tooltip;