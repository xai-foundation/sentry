import * as React from "react";

interface IconLabelProps {
	icon: React.FC;
	color: string;
	title: string;
}

export function IconLabel({icon: Icon, color, title}: IconLabelProps) {

	return (
		<span className="flex flex-row gap-2 items-center font-semibold text-[14px]">
			<Icon
				// @ts-ignore
				size={20}
				color={color}
			/>
			{title}
		</span>
	);
}
