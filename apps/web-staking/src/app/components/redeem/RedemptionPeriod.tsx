"use client";
import { ChangeEventHandler } from "react";
import { useAccount } from "wagmi";
import { BaseCallout, Radio, RadioGroup } from "@/app/components/ui";
import { LABEL_RIGHT_SUFFIX, REDEMPTION_PERIODS } from "@/app/components/redeem/Constants";
import { getNetwork, getRedemptionPeriod } from "@/services/web3.service";


export default function RedemptionPeriod ({ onChange, value }: { onChange: ChangeEventHandler | undefined; value: string }) {
	const { chainId } = useAccount();
	return (
		<div
			className="flex mt-[20px] flex-col before:content-[''] before:w-full before:h-[1px] before:bg-chromaphobicBlack before:absolute before:left-0">
			<span className="block text-lg font-medium text-americanSilver mb-2 mt-[20px]">Choose a redemption period</span>
			<RadioGroup value={value} onChange={onChange!}>

				<BaseCallout extraClasses={{ calloutWrapper: "w-full h-[48px] mb-2" }}>
					<Radio value={REDEMPTION_PERIODS.FIRST_RATE}>
						<div className="flex w-[90%] justify-between">
						<span
							className="block font-semibold text-lg text-white">{getRedemptionPeriod(getNetwork(chainId), 25).label}</span>
							<span
								className="block font-medium text-lg text-americanSilver">{REDEMPTION_PERIODS.FIRST_RATE}{LABEL_RIGHT_SUFFIX}</span>
						</div>
					</Radio>
				</BaseCallout>

				<BaseCallout extraClasses={{ calloutWrapper: "w-full h-[48px] mb-2" }}>
					<Radio value={REDEMPTION_PERIODS.SECOND_RATE}>
						<div className="flex w-[90%] justify-between">
						<span
							className="block font-semibold text-lg text-white">{getRedemptionPeriod(getNetwork(chainId), 62.5).label}</span>
							<span
								className="block font-medium text-lg text-americanSilver">{REDEMPTION_PERIODS.SECOND_RATE}{LABEL_RIGHT_SUFFIX}</span>
						</div>
					</Radio>
				</BaseCallout>

				<BaseCallout extraClasses={{ calloutWrapper: "w-full h-[48px] mb-2" }}>
					<Radio value={REDEMPTION_PERIODS.THIRD_RATE}>
						<div className="flex w-[90%] justify-between">
						<span
							className="block font-semibold text-lg text-white">{getRedemptionPeriod(getNetwork(chainId), 100).label}</span>
							<span
								className="block font-medium text-lg text-americanSilver">{REDEMPTION_PERIODS.THIRD_RATE}{LABEL_RIGHT_SUFFIX}</span>
						</div>
					</Radio>
				</BaseCallout>

			</RadioGroup>
			{/*<RadioGroupWrapper*/}
			{/*	label="Choose a redemption period"*/}
			{/*	onChange={onChange}*/}
			{/*	value={value}*/}
			{/*>*/}
			{/*	<RadioCard*/}
			{/*		value={REDEMPTION_PERIODS.FIRST_RATE}*/}
			{/*		rightLabel={`${REDEMPTION_PERIODS.FIRST_RATE}${LABEL_RIGHT_SUFFIX}`}*/}
			{/*		label={getRedemptionPeriod(getNetwork(chainId), 25).label}*/}
			{/*	/>*/}
			{/*	<RadioCard*/}
			{/*		value={REDEMPTION_PERIODS.SECOND_RATE}*/}
			{/*		rightLabel={`${REDEMPTION_PERIODS.SECOND_RATE}${LABEL_RIGHT_SUFFIX}`} */}
			{/*		label={getRedemptionPeriod(getNetwork(chainId), 62.5).label}/>*/}
			{/*	<RadioCard*/}
			{/*		value={REDEMPTION_PERIODS.THIRD_RATE}*/}
			{/*		rightLabel={`${REDEMPTION_PERIODS.THIRD_RATE}${LABEL_RIGHT_SUFFIX}`} */}
			{/*		label={getRedemptionPeriod(getNetwork(chainId), 100).label}/>*/}
			{/*</RadioGroupWrapper>*/}
		</div>
	)
};
