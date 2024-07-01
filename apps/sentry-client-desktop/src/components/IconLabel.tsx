import * as React from "react";
import { HelpIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { SideBarTooltip } from "@sentry/ui";

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
	extraClasses?: {
       tooltipContainer?: string;
       // you can modify width of tooltip container to avoid adaptive issues, also set tooltipText classes to "!text-wrap"
       // by default tooltip width is 456px as in design, for some cases we can modify it with tooltipContainer classes
       tooltipText?: string;
       tooltipHeader?: string;
       tooltipWrapper?: string;
       group?: string;
       arrowStyles?: string;
  };
}

export function IconLabel({icon: Icon, color, title, tooltip, header, body, body2, position, titleStyles}: IconLabelProps) {

	return (
		<span className="flex flex-row gap-2 items-center text-americanSilver font-semibold text-sm">
			<Icon
				// @ts-ignore
				size={23}
				color={color}
			/>
			<span className={titleStyles}>{title}</span>
			{tooltip &&
                <SideBarTooltip
                    header={header}
					body={body}
					body2={body2}
					position={position}
                >
                    <HelpIcon width={14} height={14}/>
                </SideBarTooltip>
			}
		</span>
	);
}
