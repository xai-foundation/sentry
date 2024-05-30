import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {PropsWithChildren} from "react";
import {FaEthereum} from "react-icons/fa";

interface TooltipProps extends PropsWithChildren {
	header?: string;
	body?: string;
	body2?: string;
	body3?: string;
	banner?: boolean;
	bannerTitle?: string;
	bannerValue?: string;
	width?: number;
	position?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
	onOpen?: boolean
	offset?: number
	crossOffset?: number
	onClickOutside?: () => void
	arrowMargins?: string;
}

export const Tooltip = ({header, body, body2, body3, banner, bannerTitle, bannerValue, width = 443, position = "start", side = "bottom", children, onOpen, offset = 12, crossOffset = 0, onClickOutside, arrowMargins = ''}: TooltipProps) => {
	return (
		<TooltipPrimitive.Provider delayDuration={0}>
			<TooltipPrimitive.Root open={onOpen} >
				<TooltipPrimitive.Trigger asChild>
					<button>{children}</button>
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Content
					align={position}
					side={side}
					sideOffset={offset}
					alignOffset={crossOffset}
					onPointerDownOutside={onClickOutside}
					className={`relative -top-1 ${position === "start" ? "left-[-0.39rem] items-start" : "right-[-0.39rem] items-end"} flex-col flex text-black shadow-md z-50`}
					style={{width: `${width}px`}}
				>
					<div
						className={`w-3 h-3 -mb-[0.4rem] mx-[0.5rem] ${arrowMargins} rotate-45 bg-[#000000] z-30`} />
					<div className={`relative w-full py-3 px-4 bg-[#000000] shadow-lg`}>
						{header && <p className="text-lg text-white font-semibold pb-2">{header}</p>}
						{body && <p className="text-base text-americanSilver">{body}</p>}
						{body2 && <p className="text-[15px] text-americanSilver mt-2">{body2}</p>}
						{body3 && <p className="text-[15px] text-americanSilver mt-2">{body3}</p>}
						{banner &&
                            <div
                                className="w-full flex flex-row justify-between items-center text-[15px] bg-[#000000] p-2 mt-2">
                                <p className="text-americanSilver">{bannerTitle}</p>
                                <p className="text-americanSilver font-semibold flex flex-row gap-1 items-center">
                                    <FaEthereum/> {bannerValue}
                                </p>
                            </div>}
					</div>
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};
