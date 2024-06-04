import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";

export function SentryActiveCard() {
	const {startRuntime, sentryRunning} = useOperatorRuntime();

	return (
		<div className="bg-primaryBorderColor global-cta-clip-path p-[1px]">
		<SquareCard className="bg-secondaryBgColor global-cta-clip-path">
			{sentryRunning ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title="Sentry Wallet active"
					titleStyles="text-lg text-white"
					tooltip={true}
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#FFC53D"
						title="Sentry Wallet inactive"
						tooltip={true}
						header={"Your Sentry Wallet is inactive"}
						body={"esXAI cannot be accrued while your Sentry Wallet is inactive."}
						position={"end"}
						titleStyles="text-lg text-white"
					/>

					<p className="text-lg text-primaryText mt-3 px-7">
						Sentry must be active 24/7 to accrue esXAI
					</p>
                    
					<div className="pl-7">		
					<button
						onClick={startRuntime}
						className="w-[280px] flex text-lg justify-center items-center gap-1 text-[15px] text-white bg-btnPrimaryBgColor font-semibold mt-4 px-6 py-2 global-clip-path hover:bg-white hover:text-btnPrimaryBgColor duration-200 easy-in"
					>
						START SENTRY
					</button>
					</div>
				</>
			)}
		</SquareCard>
		</div>
	);
}
