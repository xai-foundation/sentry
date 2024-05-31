import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { TextButton } from "../buttons/TextButton";
import { BlackPyramidIcon, SuccessIcon } from "../icons/IconsComponents";

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
    arrowStyles?: string;
  };
  showOnClick?: boolean;
  delay?: number;
  onClickEvent?: () => void;
}

//todo add transition

const CustomTooltip = ({
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
  const menuRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>;

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
        console.log("opeeeeeeen");
      setIsOpened(true);
      onClickEvent && onClickEvent();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
    if (!menuRef.current.contains(e.target as Node)) {
      setIsOpened(false);
    }
  }

  document.addEventListener('mousedown', handleKeyDown);

  return () => {
    document.removeEventListener("mousedown", handleKeyDown);
  };
}, []);


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
      className={`relative z-40 ease-in duration-300 w-max ${showOnClick && "cursor-pointer"} ${extraClasses?.group}`}
      onClick={openOnClick}
      onMouseLeave={closeOnMouseLeave}
      ref={menuRef}
      >
      <div
        className="select-none"
        onMouseOver={openOnHover}
      >
        {children}
      </div>
      <div
        onMouseOver={openOnHover}
        className={`${isOpened ? "block" : "hidden"} ease-in duration-300 z-40`}>
        <div className={`absolute w-[50px] top-[18px] left-[-6px] ${extraClasses?.arrowStyles}`}><BlackPyramidIcon width={28} height={24}/></div>
        <div
          className={`absolute w-[456px] ${isWarning ? "bg-bananaBoat" : "bg-[#000000]"} py-[15px] px-[15px] top-[41px] left-[38px] ${extraClasses?.tooltipContainer}`}>
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

export default CustomTooltip;
