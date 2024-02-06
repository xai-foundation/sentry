import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {PropsWithChildren} from "react";
import {AiFillInfoCircle} from "react-icons/ai";

interface TooltipProps extends PropsWithChildren {
	width?: number;
	position?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
}

const sentryBody = [
	{
		header: "Observation node",
		body: "The Sentry Node is an observation node that monitors the Xai rollup protocol",
	},
	{
		header: "Solves the verifiers dilemma",
		body: "If an incorrect block is proposed, the node will raise the alarm by whatever means the operator chooses",
	},
	{
		header: "Sentry Nodes can receive network rewards",
		body: "As long as the node is running, a probabilistic algorithm determines if nodes will receive network rewards",
	},
	{
		header: "Can be run on computers or the cloud",
		body: "Sentry Nodes can be run on any laptop, desktop, or even on cloud instances",
	},
];

export const GetSentryNodeTooltip = ({width = 443, position = "start", side = "bottom", children}: TooltipProps) => {


	function getSentryNodeBody() {
		return sentryBody.map((item, i) => {
			return (
				<div
					key={`connect-wallet-content-${i}`}
					className="flex flex-col gap-2"
				>
					<p className="text-base font-semibold">{item.header}</p>
					<p className="text-[15px] text-[#525252]">{item.body}</p>
				</div>
			);
		});
	}

	return (
		<TooltipPrimitive.Provider delayDuration={0}>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					<button>{children}</button>
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Content
					align={position}
					side={side}
					sideOffset={12}
					className={`relative -top-1 ${position === "start" ? "left-[-0.39rem] items-start" : "right-[-0.39rem] items-end"} flex-col flex text-black shadow-md z-50`}
					style={{width: `${width}px`}}
				>
					<div
						className="w-3 h-3 -mb-[0.4rem] mx-[0.5rem] rotate-45 bg-white border-t border-l border-[#D4D4D4] z-30"/>
					<div className={`relative w-full py-3 px-4 bg-white border border-[#D4D4D4] shadow-lg`}>
						<div>
							<p className="flex items-center font-semibold gap-2 mb-4 text-lg">
								<AiFillInfoCircle size={18} className="text-[#A3A3A3]"/>
								What is a Sentry Node?
							</p>

							<div className="flex flex-col items-center gap-[24px]">
								{getSentryNodeBody()}
							</div>

							<p className="mt-[14px] text-sm text-[#525252]">
								Want to learn more about Sentry Node technical specifications?

								<a
									onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-2-download-and-run-the-xai-sentry-node")}
									className="text-[#F30919] cursor-pointer"
								>
									Learn more
								</a>
							</p>
						</div>
					</div>
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};
