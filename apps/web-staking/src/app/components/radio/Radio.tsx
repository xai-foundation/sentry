"use client";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { Card, CardBody } from "@nextui-org/card";
import { ChangeEventHandler, ReactNode } from "react";

// TODO Need to make it as a reusable component
export function RadioCard ({ label, value, rightLabel }: {label: string, value: string, rightLabel?: string }) {
	return (
		<Card shadow="none" className="border-1 rounded-2xl">
			<CardBody className="flex flex-row justify-between w-full">
				<Radio
					classNames={{
						label: "text-base text-graphiteGray font-medium",
						wrapper: "group-data-[selected=true]:border-[#F30919]",
						control: "w-[10px] h-[10px] bg-[#F30919] "
					}}
					value={value}
				>{label}</Radio>
				<div className="flex ">
					<span className="items-end text-base text-graphiteGray font-normal">{rightLabel}</span>
				</div>
			</CardBody>
		</Card>
	)
}

interface RadioGroupWrapperProps {
	onChange: ChangeEventHandler | undefined;
	value: string;
	label?: string;
	children: ReactNode;
}

export default function RadioGroupWrapper ({ onChange, value, children, label }: RadioGroupWrapperProps) {
	return (
		<RadioGroup
			label={label}
			color="secondary"
			className="w-full"
			classNames={{
				label: 'text-sm w-full font-medium',
				wrapper: 'w-full'
			}}
			onChange={onChange}
			value={value}
		>
			{children}
		</RadioGroup>
	)
};
