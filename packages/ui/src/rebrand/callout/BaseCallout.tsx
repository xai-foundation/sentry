import { ReactNode } from "react";

interface BaseCalloutProps {
    children: ReactNode
    isWarning?: boolean,
    isFocused?: boolean,
    extraClasses: {
        calloutWrapper: string; // use it to define proper height of component, because we can't do calc(100%-2px) without static height
        calloutFront?: string;
    }
}

const BaseCallout = ({ extraClasses, isWarning, isFocused, children }: BaseCalloutProps) => {
    return (
        <div
            className={`global-cta-clip-path  ${isWarning ? "text-bananaBoatText bg-transparent" : "text-americanSilver bg-chromaphobicBlack"} ${isFocused && "bg-hornetSting"} flex justify-center items-center text-lg font-medium z-0 ${extraClasses.calloutWrapper}`}>
            <div
                className={`global-cta-clip-path w-full ${isWarning ? "bg-bananaBoatText/10 md:px-[24px] md:py-[15px]" : "bg-dynamicBlack md:p-[14px]"} px-[18px] py-[7px] max-w-[calc(100%-2px)] h-[calc(100%-2px)] flex justify-center items-center z-0 ${extraClasses.calloutFront}`}>
                {children}
            </div>
        </div>
    );
};

export default BaseCallout;