import * as React from "react";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {Tooltip} from "@/features/keys/Tooltip";

interface IconLabelProps {
	icon: React.FC;
	color: string;
	title: string;
	info?: boolean;
}

export function IconLabel({icon: Icon, color, title, info}: IconLabelProps) {

	return (
		<span className="flex flex-row gap-2 items-center font-semibold text-[14px]">
			<Icon
				// @ts-ignore
				size={20}
				color={color}
			/>
			{title}
			{info &&
                <Tooltip
                    header={"Your Sentry Wallet is inactive"}
                    body={"esXAI cannot be accrued while your Sentry Wallet is inactive."}
                >
                    <AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
                </Tooltip>
			}
		</span>
	);
}
