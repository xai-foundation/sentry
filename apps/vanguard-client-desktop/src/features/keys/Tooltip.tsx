import {PropsWithChildren} from "react";

interface TooltipProps extends PropsWithChildren {
	header?: string;
	body: string;
	body2?: string;
	minWidth?: number;
}

export function Tooltip({header, body, body2, minWidth=420, children}: TooltipProps) {
	return (
		<div className="relative flex flex-col items-center group">
			{children}
			<div className={`absolute w-full min-w-[${minWidth}px] top-0 flex-col items-center hidden mt-6 text-black shadow-md z-10 group-hover:flex`}>
				<div className="w-3 h-3 -mb-[0.4rem] rotate-45 bg-white border-t border-l border-[#D4D4D4] z-30"></div>
				<div
					className="relative w-full py-3 px-4 whitespace-no-wrap bg-white border border-[#D4D4D4] shadow-lg">
					{header && <p className="font-semibold pb-2">{header}</p>}
					<p className="text-[15px]">{body}</p>
					{body2 && <p className="text-[15px] mt-2">{body2}</p>}
				</div>
			</div>
		</div>
	)
}



