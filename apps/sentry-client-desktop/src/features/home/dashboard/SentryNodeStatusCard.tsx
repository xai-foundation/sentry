import {GreenPulse, YellowPulse} from "@/features/keys/StatusPulse";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {Tooltip} from "@sentry/ui";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {FaCircleCheck} from "react-icons/fa6";

export function SentryNodeStatusCard() {
	const {sentryRunning} = useOperatorRuntime();

	return (
		<Card width={"695px"} height={"328px"}>

			<div className="flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5]">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2 className="font-medium">Sentry Node Status</h2>
					<Tooltip
						header={"Header"}
						body={"Body"}
						position={"start"}
					>
						<AiOutlineInfoCircle size={15} color={"#A3A3A3"}/>
					</Tooltip>

					<p className="flex items-center ml-2 text-[14px] text-[#D4D4D4]">
						Last challenge 24m ago (hard-coded)
					</p>
				</div>
			</div>

			<div className="p-6">
				<div className="relative text-5xl flex items-center gap-5 font-semibold">
					{sentryRunning ? (
						<>
							<GreenPulse size={"md"}/> Your node is running
						</>
					) : (
						<>
							<YellowPulse size={"md"}/> Your node is not running
						</>
					)}
				</div>
				<div
					className="absolute bottom-4 left-4 max-w-[280px] h-[40px] flex justify-center items-center gap-1 rounded-xl text-[15px] text-[#16A34A] bg-[#F0FDF4] mix-blend-multiply p-2">
					<div className="flex justify-center items-center gap-2">
						<FaCircleCheck color={"#16A34A"} size={20}/>
						Your node is sufficiently funded
					</div>
				</div>
			</div>

		</Card>
	)
}
