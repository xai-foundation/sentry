import {PropsWithChildren} from "react";

interface CardProps extends PropsWithChildren {
	size: "sm" | "md" | "lg"
	header: string;
	button?: boolean;
	buttonText?: string;
	onClick?: () => void;
}

export function Card({size, header, button, buttonText, onClick, children}: CardProps) {
	let cardWidth;
	let cardHeight;

	switch (size) {
		case "sm":
			cardWidth = "24.5rem";
			cardHeight = "24.5rem";
			console.log("sm", cardWidth, cardHeight);
			break;
		case "md":
			cardWidth = "24.5rem";
			cardHeight = "50rem";
			console.log("md", cardWidth, cardHeight);
			break;
		case "lg":
			cardWidth = "50rem";
			// cardWidth = "50%";
			cardHeight = "24.5rem";
			console.log("lg", cardWidth, cardHeight);
			break;
		default:
			console.log("Invalid size"); // Handle the case where size is none of the specified values
	}

	return (
		<div className="relative bg-gray-300 border border-red-500 rounded-xl" style={{width: cardWidth, height: cardHeight}}>
			<div className="border-b border-red-500 py-2 px-4">
				<h2>{header}</h2>
			</div>
			<div className="py-2 px-4">
				{children}
			</div>
			{button && (
				<button
					className="absolute bottom-4 right-4 flex flex-row justify-center items-center gap-2 text-[15px] border border-red-500 rounded px-4 py-2"
					onClick={() => onClick}
				>
					{buttonText}
				</button>
			)}

		</div>
	)
}
