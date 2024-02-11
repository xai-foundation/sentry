import {IconLabel} from "@/components/IconLabel";
import {clampAddress} from "@/utils/clampAddress";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {PiCopy} from "react-icons/pi";
import {FaEthereum} from "react-icons/fa";
import {AiFillCheckCircle, AiOutlineCheck} from "react-icons/ai";
import {useOperator} from "@/features/operator";
import {useState} from "react";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useAtomValue} from "jotai";
import log from "electron-log";

export function FundsInSentryWalletCard() {
	const {isLoading: isOperatorLoading, publicKey: operatorAddress} = useOperator();
	const [copied, setCopied] = useState(false);
	const {funded} = useAtomValue(accruingStateAtom);


	function copyAddress() {
		if (operatorAddress && navigator.clipboard) {
			navigator.clipboard.writeText(operatorAddress)
				.then(() => {
					setCopied(true);
					setTimeout(() => {
						setCopied(false);
					}, 2000);
				})
				.catch(err => {
					log.error('Unable to copy to clipboard: ', err);
				});
		} else {
			log.error('Clipboard API not available, unable to copy to clipboard');
		}
	}

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
						To fund the Sentry Wallet, send AETH to this address
					</p>

					<div
						className="h-[48px] px-3 w-full border border-[#A3A3A3] flex flex-row items-center gap-2 justify-between bg-white mt-3">
						<span className="text-sm leading-[14px] text-[#525252]">
							{isOperatorLoading || !operatorAddress ? "Loading..." : clampAddress(operatorAddress)}
						</span>

						<div
							onClick={copyAddress}
							className="text-[#525252] w-[20px] h-[20px] cursor-pointer"
						>
							{copied
								? (<AiOutlineCheck/>)
								: (<PiCopy/>)}
						</div>
						{/*<PiCopy*/}
						{/*	className="text-[#525252] w-[20px] h-[20px] cursor-pointer"*/}
						{/*	onClick={copyAddress}*/}
						{/*/>*/}
					</div>

					<div className="mt-3 flex flex-row gap-1 justify-between">
						<p className="mb-0 text-sm leading-[14px] text-[#525252]">
							Recommended minimum balance
						</p>

						<div className="flex flex-row items-center gap-1">
							<FaEthereum className="w-4 h-4 mb-[-2px]"/>
							<p className="text-[#525252] text-sm font-semibold">0.005 AETH</p>
						</div>
					</div>
				</>
			)}
		</SquareCard>
	);
}
