"use client";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { Card, CardBody } from "@nextui-org/card";
import { ChangeEventHandler, ReactNode } from "react";

// TODO Need to make it as a reusable component
export function RadioCard ({ label, value, rightLabel }: {label: string, value: string, rightLabel?: string }) {
	return (
		<Card>
			<CardBody className="flex flex-row justify-between w-full">
				<Radio
					color="danger"
					classNames={{
						label: 'text-[12px] text-slateGray font-medium',
					}}
					value={value}
				>{label}</Radio>
				<div className="flex ">
					<span className="items-end text-[12px] text-slateGray font-medium">{rightLabel}</span>
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
