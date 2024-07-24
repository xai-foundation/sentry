import {IconLabel} from "@/components/IconLabel";
import {clampAddress} from "@/utils/clampAddress";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle, AiOutlineCheck} from "react-icons/ai";
import {useOperator} from "@/features/operator";
import {useState} from "react";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useAtomValue} from "jotai";
import log from "electron-log";
import { CopyIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";

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
		<div className="bg-chromaphobicBlack global-cta-clip-path p-[1px]">
		<SquareCard className="bg-dynamicBlack global-cta-clip-path">
			{funded ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#3DD68C"
					title="Sentry Wallet funded"
					titleStyles="text-lg text-white"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#FFC53D"
						title="Insufficient funds in Sentry Wallet"
						titleStyles="text-lg text-white"
					/>

					<p className="text-lg text-americanSilver mt-1 px-7">
						To fund the Sentry Wallet, send ETH to this address
					</p>
					
					<div className="pl-7 mt-3">
                    <div className="global-clip-path w-full bg-chromaphobicBlack p-[1px]">
					<div
						className="h-[48px] px-3 w-full flex flex-row items-center gap-2 justify-between bg-dynamicBlack global-clip-path">
						<span className="text-lg leading-[14px] text-americanSilver">
							{isOperatorLoading || !operatorAddress ? "Loading..." : clampAddress(operatorAddress)}
						</span>

						<div
							onClick={copyAddress}
							className="text-americanSilver w-[20px] h-[20px] cursor-pointer"
						>
							{copied
								? (<AiOutlineCheck color="#D0CFCF" size={20}/>)
								: (<CopyIcon/>)}
						</div>
					</div>
					</div>
					</div>
						<div className="mt-5 flex flex-col gap-1 justify-between pl-7">
						<div className="flex flex-row items-center gap-2">
						<p className="mb-0 text-lg leading-[14px] text-americanSilver">
							Recommended minimum balance
						</p>
							{/* <HelpIcon width={14} height={14} /> */}
						</div>
						<div className="flex flex-row items-center gap-1">
							<p className="text-white text-lg font-bold">0.005 AETH</p>
						</div>
					</div>
				</>
			)}
		</SquareCard>
		</div>
	);
}
