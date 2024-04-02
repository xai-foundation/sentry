"use client";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { Card, CardBody } from "@nextui-org/card";
import { ChangeEventHandler } from "react";
import { getNetwork, getRedemptionPeriod } from "@/services/web3.service";
import { useAccount } from "wagmi";

import RadioGroupWrapper, { RadioCard } from "../radio/Radio";
import { LABEL_RIGHT_SUFFIX, REDEMPTION_PERIODS } from "./Constants";

export default function RedemptionPeriod ({ onChange, value }: { onChange: ChangeEventHandler | undefined; value: string }) {
	const { chainId } = useAccount();
	return (
		<div className="flex mt-[16px] mb-[16px]">
			<RadioGroupWrapper
				label="Choose a redemption period"
				onChange={onChange}
				value={value}
			>
				<RadioCard
					value={REDEMPTION_PERIODS.FIRST_RATE}
					rightLabel={`${REDEMPTION_PERIODS.FIRST_RATE}${LABEL_RIGHT_SUFFIX}`}
					label={getRedemptionPeriod(getNetwork(chainId), 25).label}
				/>
				<RadioCard
					value={REDEMPTION_PERIODS.SECOND_RATE}
					rightLabel={`${REDEMPTION_PERIODS.SECOND_RATE}${LABEL_RIGHT_SUFFIX}`} 
					label={getRedemptionPeriod(getNetwork(chainId), 62.5).label}/>
				<RadioCard
					value={REDEMPTION_PERIODS.THIRD_RATE}
					rightLabel={`${REDEMPTION_PERIODS.THIRD_RATE}${LABEL_RIGHT_SUFFIX}`} 
					label={getRedemptionPeriod(getNetwork(chainId), 100).label}/>
			</RadioGroupWrapper>
		</div>
	)
};
