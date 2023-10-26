import * as React from "react";

interface IconLabelProps {
	icon: React.FC;
	color: string;
	title: string;
}

export function IconLabel({icon: Icon, color, title}: IconLabelProps) {

	return (
		<span className="flex flex-row gap-1 items-center font-semibold">
			<Icon
				// @ts-ignore
				size={22}
				color={color}
			/>
			{title}
		</span>
	);
}
