import {PropsWithChildren} from "react";

interface XaiButtonProps extends PropsWithChildren {
	onClick: () => void;
	width?: string;
	fontSize?: string;
	disabled?: boolean;
}

export function XaiButton({onClick, width, disabled, fontSize, children}: XaiButtonProps) {
	return (
		<button
			className={`bg-[#F30919] flex justify-center items-center gap-2 text-lg text-white px-6 py-3 font-semibold mt-2`}
			style={{width: width, fontSize: fontSize}}
			onClick={() => onClick()}
			disabled={disabled}
		>
			{children}
		</button>
	)
}
