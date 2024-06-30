import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {PropsWithChildren} from "react";
import {FaEthereum} from "react-icons/fa";
import { BlackPyramidIcon } from "../icons/IconsComponents";

interface TooltipProps extends PropsWithChildren {
	header?: string;
	body?: string;
	body2?: string;
	body3?: string;
	banner?: boolean;
	bannerTitle?: string;
	bannerValue?: string;
    width?: number;
    height?: number;
	position?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	avoidCollisions?: boolean;
}

export const SideBarTooltip = ({header, body, body2, body3, banner, bannerTitle, bannerValue, width = 443, height, position = "start", side = "bottom", sideOffset = 12, avoidCollisions = true, children}: TooltipProps) => {
	return (
		<TooltipPrimitive.Provider delayDuration={0}>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					<button>{children}</button>
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Content
					align={position}
					side={side}
					sideOffset={sideOffset}
					className={`relative -top-1 ${position === "start" ? "left-[-0.39rem] items-start" : "right-[-0.39rem] items-end"} flex-col flex text-black shadow-md z-50`}
					style={{ width: `${width}px `, height: `${height}px` }}
					avoidCollisions={avoidCollisions}	
				>
					<div
						className="w-3 h-3 -mb-[0.4rem] mx-[0.5rem] rotate-45 bg-[#000000] z-30"/>
					<div className={`relative w-full py-3 px-4 bg-[#000000] shadow-lg`}>
						{header && <p className="text-lg font-bold pb-1 text-white">{header}</p>}
						{body && <p className="text-[17px] text-elementalGrey">{body}</p>}
						{body2 && <p className="text-[17px] text-elementalGrey mt-2">{body2}</p>}
						{body3 && <p className="text-[17px] text-elementalGrey mt-2">{body3}</p>}
						{banner &&
                            <div
                                className="w-full flex flex-row justify-between items-center text-[15px] bg-[#F5F5F5] font-light p-2 mt-2">
                                <p>{bannerTitle}</p>
                                <p className="font-semibold flex flex-row gap-1 items-center">
                                    <FaEthereum/> {bannerValue}
                                </p>
							</div>}
						<div className="absolute top-[-23px] right-0 z-50">
						<BlackPyramidIcon width={28} height={24}/>
						</div>
					</div>
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};
