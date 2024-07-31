import {PropsWithChildren} from "react";

interface CardProps extends PropsWithChildren {
	width: string;
	height: string;
	customClasses?: string
}

export function Card({width, height, children, customClasses}: CardProps) {
	return (
		<div
			className={`relative shadow overflow-hidden ${customClasses}`}
			style={{width: width, height: height}}
		>
			<div>{children}</div>
		</div>
	)
}
