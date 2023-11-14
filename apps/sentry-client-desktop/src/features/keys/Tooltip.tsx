import {PropsWithChildren} from "react";
import {FaEthereum} from "react-icons/fa";

interface TooltipProps extends PropsWithChildren {
	header?: string;
	body?: string;
	body2?: string;
	banner?: boolean;
	bannerTitle?: string;
	bannerValue?: string;
	minWidth?: number;
	position?: "left" | "right";
}

export function Tooltip({header, body, body2, banner, bannerTitle, bannerValue, minWidth = 443, position = "left", children}: TooltipProps) {
	return (
		<div className="relative flex flex-col items-center group">
			{children}
			<div
				className={`absolute top-0 ${position === "left" ? "left-[-0.38rem] items-start" : "right-[-0.38rem] items-end"} flex-col hidden mt-6 text-black shadow-md group-hover:flex`}
				style={{minWidth: `${minWidth}px`}}
			>
				<div
					className="w-3 h-3 -mb-[0.4rem] mx-[0.5rem] rotate-45 bg-white border-t border-l border-[#D4D4D4] z-30"/>
				<div
					className={`relative w-full py-3 px-4 bg-white border border-[#D4D4D4] shadow-lg`}
				>
					{header && <p className="font-semibold pb-2">{header}</p>}
					{body && <p className="text-[15px] font-light">{body}</p>}
					{body2 && <p className="text-[15px] font-light mt-2">{body2}</p>}
					{banner &&
                        <div
                            className="w-full flex flex-row justify-between items-center text-[15px] bg-[#F5F5F5] font-light p-2 mt-2">
                            <p>{bannerTitle}</p>
                            <p className="font-semibold flex flex-row gap-1 items-center"><FaEthereum/> {bannerValue}
                            </p>
                        </div>}
				</div>
			</div>
		</div>
	);
}
