import {useAtomValue} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {CustomTooltip} from "@sentry/ui";
import {AiFillWarning} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useOperator} from "@/features/operator";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useSetAtom} from "jotai";
import { HelpIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { useOperatorRuntime } from "@/hooks/useOperatorRuntime";
import { RiKey2Line } from "react-icons/ri";
import { useState } from "react";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import {TextButton} from "@sentry/ui/dist/src/rebrand/buttons/TextButton";

export function WalletsCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {kycRequired} = useAtomValue(accruingStateAtom);
	const {owners, ownersKycMap} = useAtomValue(chainStateAtom);
	const kycRequiredLength = Object.values(ownersKycMap).filter(value => !value).length
	const { publicKey: operatorAddress } = useOperator();
	const { sentryRunning } = useOperatorRuntime();
	const [mouseOverTooltip, setMouseOverTooltip] = useState(false);
  
	return (
		<Card width={"341px"} height={"279px"} customClasses={`bg-nulnOil shadow-default overflow-visible ${mouseOverTooltip ? "z-20" : "z-0"}`}>

			<div className="flex flex-row justify-between items-center py-5 px-6 border-b border-chromaphobicBlack">
				<div className="flex flex-row items-center gap-1 text-white text-2xl">
					<h2 className="font-bold">Wallets</h2>
					<CustomTooltip
						header={"Xai Client can track keys only from added wallets"}
						content={"If you own keys in additional wallets, add them to the client."}
						position={"end"}
						mouseOver={setMouseOverTooltip}
						extraClasses={{tooltipText: "!text-elementalGrey"}}
					>
						<HelpIcon width={14} height={14} fill="#A19F9F" />
					</CustomTooltip>
				</div>
				<div className="flex flex-row justify-between items-center gap-1">
					<TextButton
						onClick={() => window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`)}
						buttonText={"Assign Wallet"}
						className="text-lg uppercase !px-0 !py-0 max-h-[28px]"
					/>
				</div>
			</div>

			<div className="py-4 px-6 flex">
				{sentryRunning && !kycRequired && <div className="mr-3">
					<RiKey2Line size={30} color={"#ffffff"} />
				</div>}
				<div className="w-full">
				<div className="flex gap-2 items-center">
					<h3 className="text-4xl font-bold text-white">
						{owners.length} {(kycRequired || !sentryRunning) && (owners.length === 1 ? "wallet" : "wallets")}
					</h3>
				</div> 
				<div className="flex items-center w-full">
				{sentryRunning && <p className="text-lg text-elementalGrey w-full">
					KYC complete: {owners.length - kycRequiredLength}/{owners.length}
				</p>}
                {sentryRunning && kycRequired && (
					<TextButton
						className="text-lg font-bold !px-0 !py-0 max-h-[28px] w-full"
						textClassName="text-left"
						onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
						buttonText="Complete KYC"
					/>
				)}
					</div>
				</div>
			</div>


			{sentryRunning && kycRequired && (
				<BaseCallout
					isWarning
					extraClasses={{ calloutWrapper: "absolute bottom-5 left-6 m-auto w-[288px] !p-0 flex justify-center items-center gap-1 text-lg font-bold text-bananaBoat px-4 py-3 global-cta-clip-path", calloutFront: "!justify-start" }}>
					<div className="flex justify-center items-center gap-2">
						<AiFillWarning color={"#FFC53D"} size={23}/>
						KYC required for {kycRequiredLength} wallet{kycRequiredLength === 1 ? "" : "s"}
					</div>
				</BaseCallout>
			)}
		</Card>
	)
}
