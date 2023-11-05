import {PropsWithChildren} from "react";
import classNames from "classNames"

interface SquareCardProps extends PropsWithChildren {
	className?: string;
}

export function SquareCard({className = "bg-[#FFFBEB]", children}: SquareCardProps) {
	return (
		<div className={classNames("px-4 py-3", className)}>
			{children}
		</div>
	);
}
