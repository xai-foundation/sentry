import {PropsWithChildren} from "react";

interface CardProps extends PropsWithChildren {
	width: string;
	height: string;
}

export function Card({width, height, children}: CardProps) {
	return (
		<div
			className="relative bg-white border border-[#00000005] shadow rounded-lg overflow-hidden"
			style={{width: width, height: height}}
		>
			<div>{children}</div>
		</div>
	)
}
