import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {AiFillCheckCircle, AiFillWarning, AiOutlineClose} from "react-icons/ai";
import {IoMdCloseCircle} from "react-icons/io";
import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {SentryActiveCard} from "./SentryActiveCard";
import {FundsInSentryWalletCard} from "./FundsInSentryWalletCard";
import {AssignedKeysCard} from "./AssignedKeysCard";
import {KycRequiredCard} from "./KycRequiredCard";
import {BarStepItem} from "@/components/BarStepItem";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useAtomValue} from "jotai";

export function ActionsRequiredNotAccruingDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners, ownersKycMap} = useAtomValue(chainStateAtom);
	const {accruing, kycRequired} = useAtomValue(accruingStateAtom);


	return (
		<div className="h-full flex flex-col justify-start items-center">
			<div
				className="w-full h-[4rem] min-h-[4rem] flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				{!accruing && (
					<div className="flex flex-row gap-2 items-center">
						<AiFillWarning className="w-7 h-7 text-[#F59E28]"/> <span>Actions required</span>
					</div>
				)}

				{accruing && kycRequired && (
					<div className="flex flex-row gap-2 items-center">
						<AiFillWarning className="w-7 h-7 text-[#F59E28]"/> <span>Next Step: Complete KYC</span>
					</div>
				)}

				{accruing && !kycRequired && (
					<div className="flex flex-row gap-2 items-center">
						<AiFillCheckCircle className="w-5 h-5 text-[#16A34A] mt-1"/> <span>esXAI is being claimed</span>
					</div>
				)}

				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose/>
				</div>
			</div>

			<div>
				<div className="py-5 px-3">
					{accruing ? (
						<SquareCard className="bg-[#DCFCE7]">
							<IconLabel
								icon={AiFillCheckCircle}
								color="#16A34A"
								title="You are currently accruing esXAI"
							/>
							<p className="text-[15px] text-[#15803D] mt-2">
								Keep your Sentry Wallet running 24/7 to continue accruing esXAI.
							</p>
						</SquareCard>
					) : (
						<SquareCard>
							<IconLabel
								icon={IoMdCloseCircle}
								color="#F59E28"
								title="You are currently not accruing esXAI"
							/>
							<p className="text-[15px] text-[#924012] mt-2">
								Complete the steps below to begin accruing esXAI token rewards.
							</p>
						</SquareCard>
					)}

					<div className="flex flex-col">
						<BarStepItem>
							<SentryActiveCard/>
						</BarStepItem>

						<BarStepItem>
							<FundsInSentryWalletCard/>
						</BarStepItem>

						<BarStepItem lastItem={true}>
							<AssignedKeysCard/>
						</BarStepItem>
					</div>
				</div>

				{accruing && (
					<div className="py-5 px-3">
						{kycRequired ? (
							<SquareCard>
								<IconLabel
									icon={IoMdCloseCircle}
									color="#F59E28"
									title="At least one wallet has unclaimable esXAI"
								/>
								<p className="text-[15px] text-[#525252] mt-3">
									You must pass KYC within 180 days of accruing esXAI to claim accrued node rewards.
									Check back in
									48 hours if all docs submitted. Check your inbox (including spam) for updates. For
									KYC issues,
									contact<a
									className="text-[#F30919] cursor-pointer"
									onClick={() => window.electron.openExternal(`https://help.blockpass.org/hc/en-us/requests/new`)}
								> Blockpass</a>. If not completed, continue submission here.
								</p>
							</SquareCard>
						) : (
							<SquareCard className="bg-[#DCFCE7]">
								<IconLabel
									icon={AiFillCheckCircle}
									color="#16A34A"
									title="You can claim esXAI"
								/>
								<p className="text-[15px] text-[#15803D] mt-2">
									You have successfully completed your KYC on all wallets assigned to the Sentry.
								</p>
							</SquareCard>
						)}

						{owners?.map((owner, i) => {
							return (
								<BarStepItem key={`bar-step-item-${i}`} lastItem={i + 1 === owners!.length}>
									<KycRequiredCard
										wallet={owner}
										status={ownersKycMap[owner]}
									/>
								</BarStepItem>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
