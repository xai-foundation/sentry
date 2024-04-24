import {GreenPulse, YellowPulse} from "@/features/keys/StatusPulse";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {AiFillWarning} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {FaCircleCheck} from "react-icons/fa6";
import {useOperator} from "@/features/operator";
import {useBalance} from "@/hooks/useBalance";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";
import {getLatestChallenge} from "@sentry/core";
import {ReactNode, useEffect, useState} from "react";
import log from "electron-log";

export function SentryNodeStatusCard() {
	const {publicKey} = useOperator();
	const {data: balance} = useBalance(publicKey);
	const {startRuntime, sentryRunning} = useOperatorRuntime();
	const nodeStatus = balance?.wei !== undefined && balance.wei >= recommendedFundingBalance;
	const [timeAgoString, setTimeAgoString] = useState<ReactNode | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const challengeData = await getLatestChallenge();
				const createdTimestamp = challengeData?.[1]?.createdTimestamp;
				setTimeAgoString(createdTimestamp
					? formatTimeAgo(Number(createdTimestamp) * 1000)
					: <div>Error retrieving challenge data</div>
				);
			} catch (error) {
				log.error('Error fetching latest challenge:', error);
				setTimeAgoString(<div>Error fetching latest challenge</div>);
			}
		};

		void fetchData(); // Initial fetch

		const intervalId = setInterval(() => {
			void fetchData();
		}, 60000);

		return () => clearInterval(intervalId);
	}, []);


	function formatTimeAgo(createdTimestamp: number): string {
		const formatDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).format(createdTimestamp);
		
		return `Last challenge ${formatDate}`;
	}


	function getNodeFunds() {
		return (
			<div
				className={`absolute bottom-4 left-4 max-w-[280px] h-[40px] flex justify-center items-center gap-1 rounded-lg ${nodeStatus ? "text-[15px] text-[#16A34A] bg-[#F0FDF4]" : "text-sm text-[#F59E28] bg-[#FFFBEB]"} mix-blend-multiply p-3`}>
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
		);
	}

	return (
		<Card width={"726px"} height={"328px"}>
			{sentryRunning && (
				<div className="absolute top-[-10.5rem] left-0 right-0 w-full h-full">
					<video
						className="w-full object-contain"
						autoPlay
						loop
						muted
						playsInline
					>
						<source src="/videos/node-active.mp4" type="video/mp4"/>
					</video>
				</div>
			)}

			<div className="sticky flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5] z-10">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2 className="font-medium">Sentry Node Status</h2>
					<p className="flex items-center ml-2 text-sm text-[#D4D4D4]">
						{timeAgoString}
					</p>
				</div>
			</div>

			<div className="p-6">
				{sentryRunning ? (
					<>
						<div className="relative text-5xl flex items-center gap-5 font-semibold">
							{nodeStatus ? (<GreenPulse size={"md"}/>) : (<YellowPulse size={"md"}/>)} Your node is
							running
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
