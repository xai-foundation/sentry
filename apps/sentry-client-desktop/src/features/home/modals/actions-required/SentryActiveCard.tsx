import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import { PrimaryButton, SideBarTooltip } from "@sentry/ui";
import { HelpIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";

export function SentryActiveCard() {
	const {startRuntime, sentryRunning} = useOperatorRuntime();

	return (
		<div className="relative">
		<div className="bg-chromaphobicBlack global-cta-clip-path p-[1px]">
		<SquareCard className="bg-dynamicBlack global-cta-clip-path">
			{sentryRunning ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#3DD68C"
					title="Sentry Wallet active"
					titleStyles="text-lg text-white"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#FFC53D"
						title="Sentry Wallet inactive"
						header={"Your Sentry Wallet is inactive"}
						body={"esXAI cannot be accrued while your Sentry Wallet is inactive."}
						position={"end"}
						titleStyles="text-lg text-white"
					/>

					<p className="text-lg text-americanSilver mt-3 px-7">
						Sentry must be active 24/7 to accrue esXAI
					</p>

					<div className="pl-7">		
					<PrimaryButton
						onClick={() => startRuntime}
						className="w-[280px] text-lg items-center font-semibold mt-4 px-6 !py-1"
						btnText="START SENTRY"
						size="sm"
						colorStyle="primary"
					/>
					</div>
				</>
			)}
			</SquareCard>
		</div>
			{!sentryRunning && <div className="absolute top-[18px] left-[215px]">
				<SideBarTooltip
					header={"Your Sentry Wallet is inactive"}
					body={"esXAI cannot be accrued while your Sentry Wallet is inactive."}
					position={"end"}
					sideOffset={25}
				>
					<HelpIcon width={14} height={14} />
				</SideBarTooltip>
			</div>}
		</div>
	);
}
