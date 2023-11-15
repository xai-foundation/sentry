import {IconLabel} from "@/components/IconLabel";
import {clampAddress} from "@/utils/clampAddress";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {PiCopy} from "react-icons/pi";
import {FaEthereum} from "react-icons/fa";
import {AiFillCheckCircle, AiOutlineInfoCircle} from "react-icons/ai";
import {useOperator} from "../../../operator";
import {Tooltip} from "@/features/keys/Tooltip";

interface InsufficientFundsCardProps {
	funded: boolean;
	setFunded: () => void
}

export function InsufficientFundsCard({funded, setFunded}: InsufficientFundsCardProps) {
	const {isLoading: isLoadingOperator, publicKey} = useOperator();

	return (
		<SquareCard className="bg-[#F5F5F5]">
			{funded ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title="Sentry Wallet funded"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#F59E28"
						title="Insufficient funds in Sentry Wallet"
						tooltip={true}
						header={"Funds in Arb ETH required."}
						body={"Sentry Wallet balance is used to pay gas for automatically claiming esXAI for each key."}
						position={"end"}
					/>

					<p className="text-[15px] text-[#525252] mt-3">
						To fund the Sentry Wallet, send ETH to this address
					</p>

					<div
						className="h-[48px] px-3 w-full border border-[#A3A3A3] flex flex-row items-center gap-2 justify-between bg-white mt-3">
						<span className="text-[14px] leading-[14px] text-[#525252]">
							{isLoadingOperator || !publicKey ? "Loading..." : clampAddress(publicKey)}
						</span>

						<PiCopy
							className="text-[#525252] w-[20px] h-[20px] cursor-pointer"
							onClick={setFunded}
						/>
					</div>

					<div className="mt-3 flex flex-row gap-1 justify-between">
						<div className="flex flex-row gap-1">
							<p className="mb-0 text-[14px] leading-[14px] text-[#525252]">
								Recommended minimum balance
							</p>

							<Tooltip
								header={"Set it and forget it"}
								body={"Based on the number of license keys that are currently assigned to the Sentry, this amount will cover gas fees for up to a month."}
								position={"end"}
							>
								<AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
							</Tooltip>
						</div>

						<div className="flex flex-row items-center gap-1">
							<FaEthereum className="w-4 h-4 mb-[-2px]"/>
							<p className="text-[#525252] text-[14px] font-semibold">0.05 ETH</p>
						</div>
					</div>
				</>
			)}
		</SquareCard>
	);
}
