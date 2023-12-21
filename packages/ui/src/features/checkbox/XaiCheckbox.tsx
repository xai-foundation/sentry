import {ImCheckmark} from "react-icons/im";
import {ReactNode} from "react";

interface XaiCheckboxProps {
	onClick: () => void;
	condition: string | boolean | number | string[];
	children: ReactNode;
}

export function XaiCheckbox({onClick, condition, children}: XaiCheckboxProps) {
	return (
		<div className="flex flex-row gap-2">
			<div
				onClick={() => onClick()}
				className={`flex justify-center items-center w-5 h-5 cursor-pointer border ${condition ? "border-0" : "border-[#A3A3A3]"} ${condition ? "bg-[#F30919]" : "bg-white"}`}
			>
				{condition ? <ImCheckmark color={"white"} size={14}/> : null}
			</div>
			<div className="flex flex-row gap-1 text-sm">
				{children}
			</div>
		</div>
	)
}
