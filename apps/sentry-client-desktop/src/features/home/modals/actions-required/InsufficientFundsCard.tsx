import {IconLabel} from "../../../../components/IconLabel";
import {clampAddress} from "../../../../utils/clampAddress";
import {SquareCard} from "../../../../components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {PiCopy} from "react-icons/pi";
import {FaEthereum} from "react-icons/fa";
import {AiFillCheckCircle} from "react-icons/ai";
import {useOperator} from "../../../operator";

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
						<p className="mb-0 text-[14px] leading-[14px] text-[#525252]">
							Recommended minimum balance
						</p>

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
