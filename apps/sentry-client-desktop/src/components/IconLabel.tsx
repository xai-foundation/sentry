import * as React from "react";
import {Tooltip} from "../../../../packages/ui/src/features/tooltip/Tooltip";
import { HelpIcon } from "../../../../packages/ui/src/rebrand/icons/IconsComponents";

interface IconLabelProps {
	icon: React.FC;
	color: string;
	title: string;
	tooltip?: boolean;
	header?: string;
	body?: string;
	body2?: string;
	position?: "start" | "end";
	titleStyles?: string;
}

export function IconLabel({icon: Icon, color, title, tooltip, header, body, body2, position, titleStyles}: IconLabelProps) {

	return (
		<span className="flex flex-row gap-2 items-center font-semibold text-sm">
			<Icon
				// @ts-ignore
				size={20}
				color={color}
			/>
			<span className={titleStyles}>{title}</span>
			{tooltip &&
                <Tooltip
                    header={header}
                    body={body}
                    body2={body2}
                    position={position}
                >
                    <HelpIcon width={14} height={14}/>
                </Tooltip>
			}
		</span>
	);
}
