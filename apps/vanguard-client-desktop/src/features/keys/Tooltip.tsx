import {PropsWithChildren} from "react";

interface TooltipProps extends PropsWithChildren {
	header?: string;
	body: string;
	body2?: string;
}

export function Tooltip({header, body, body2, children}: TooltipProps) {
	return (
		<div className="group">
			{children}
			<div
				className="hidden group-hover:inline-block absolute transform bg-white text-black shadow-md border border-gray-300 opacity-100 py-3 px-4 max-w-[420px] z-10">
				{header && <p className="font-semibold pb-2">{header}</p>}
				<p className="text-[15px]">{body}</p>
				{body2 && <p className="text-[15px] mt-2">{body2}</p>}
			</div>
		</div>
	)
}
