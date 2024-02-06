import * as React from "react";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {Tooltip} from "../../../../packages/ui/src/features/tooltip/Tooltip";

interface IconLabelProps {
	icon: React.FC;
	color: string;
	title: string;
	tooltip?: boolean;
	header?: string;
	body?: string;
	body2?: string;
	position?: "start" | "end";
}

export function IconLabel({icon: Icon, color, title, tooltip, header, body, body2, position}: IconLabelProps) {

	return (
		<span className="flex flex-row gap-2 items-center font-semibold text-sm">
			<Icon
				// @ts-ignore
				size={20}
				color={color}
			/>
			{title}
			{tooltip &&
                <Tooltip
                    header={header}
                    body={body}
                    body2={body2}
                    position={position}
                >
                    <AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
                </Tooltip>
			}
		</span>
	);
}
