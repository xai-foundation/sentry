import {GreenPulse, YellowPulse} from "@/features/keys/StatusPulse";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {Tooltip} from "@sentry/ui";
import {AiFillWarning, AiOutlineInfoCircle} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {FaCircleCheck} from "react-icons/fa6";
import {useOperator} from "@/features/operator";
import {useBalance} from "@/hooks/useBalance";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";

export function SentryNodeStatusCard() {
	const {publicKey} = useOperator();
	const {data: balance} = useBalance(publicKey);
	const {startRuntime, sentryRunning} = useOperatorRuntime();
	const nodeStatus = balance?.wei !== undefined && balance.wei >= recommendedFundingBalance;

	function getNodeFunds() {
		return (
			<div
				className={`absolute bottom-4 left-4 max-w-[280px] h-[40px] flex justify-center items-center gap-1 rounded-lg ${nodeStatus ? "text-[15px] text-[#16A34A] bg-[#F0FDF4]" : "text-[14px] text-[#F59E28] bg-[#FFFBEB]"} mix-blend-multiply p-3`}>
				<div className="flex justify-center items-center gap-2">
					<div className="flex justify-center items-center gap-2">
						{nodeStatus
							? (
								<><FaCircleCheck color={"#16A34A"} size={20}/>Your node is sufficiently funded</>
							) : (
								<><AiFillWarning color={"#F59E28"} size={20}/>Your node is insufficiently funded</>
							)}
					</div>
				</div>
			</div>

		)
			;
	}

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
				{sentryRunning ? (
					<>
						<div className="relative text-5xl flex items-center gap-5 font-semibold">
							{nodeStatus ? (<GreenPulse size={"md"}/>) : (<YellowPulse size={"md"}/>)}
							Your node is running
						</div>
						{getNodeFunds()}
					</>
				) : (
					<>
						<div className="relative text-5xl flex items-center gap-5 font-semibold">
							<YellowPulse size={"md"}/> Your node is not running
						</div>

						<div
							className="absolute left-0 right-0 bottom-6 w-full h-[40px] flex justify-center items-center gap-1  text-[15px] text-[#16A34A] bg-[#F0FDF4] p-4">
							<button
								className={`w-full bg-[#F30919] flex justify-center items-center gap-2 text-lg text-white px-6 py-3 rounded-lg font-semibold mt-2`}
								onClick={startRuntime}
							>
								Start Node
							</button>
						</div>
					</>
				)}
			</div>
		</Card>
	)
}
