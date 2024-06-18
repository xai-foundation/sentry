import {useAtomValue, useSetAtom} from "jotai";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {AiFillCheckCircle, AiOutlineClose} from "react-icons/ai";
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
import {useStorage} from "@/features/storage";
import {AllowedWalletsCard} from "@/features/home/modals/actions-required/AllowedWalletsCard";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";

export function ActionsRequiredNotAccruingDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {ownersKycMap} = useAtomValue(chainStateAtom);
	const {accruing, kycRequired} = useAtomValue(accruingStateAtom);
	const {data} = useStorage();
	const {hasAssignedKeys} = useAtomValue(accruingStateAtom);

	return (
		<div className="h-full flex flex-col justify-start items-center">
			<div
				className="w-full flex flex-row justify-between items-center border-b border-chromaphobicBlack text-lg font-semibold px-6 py-[26px]">
				{!accruing && (
					<div className="flex flex-row gap-2 items-center">
						<WarningIcon width={28} height={24} />{" "}
						<span className="text-white text-[24px] font-bold">Actions required</span>
					</div>
				)}

				{accruing && kycRequired && (
					<div className="flex flex-row gap-2 items-center">
						<WarningIcon width={28} height={24} />{" "}
						<span className="text-white text-[24px] font-bold">Next Step: Complete KYC</span>
					</div>
				)}

				{accruing && !kycRequired && (
					<div className="flex flex-row gap-2 items-center">
						<AiFillCheckCircle className="w-6 h-6 text-drunkenDragonFly mt-1" />
						<span className="text-white text-[24px] font-bold">esXAI is being claimed</span>
					</div>
				)}

				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose color={"white"} className="hover:!text-hornetSting duration-300 ease-in" />
				</div>
			</div>

			<div>
				<div className="py-5 px-6">
					{accruing ? (
						<SquareCard className="!bg-drunkenDragonFly/10 global-cta-clip-path">
							<IconLabel
								icon={AiFillCheckCircle}
								color="#3DD68C"
								title="You are currently accruing esXAI"
								titleStyles="text-lg text-drunkenDragonFly"
							/>
							<p className="text-lg text-drunkenDragonFly mt-2 pl-8 font-medium">
								Keep your Sentry Wallet running 24/7 to continue accruing esXAI.
							</p>
						</SquareCard>
					) : (
						<SquareCard className="bg-[#FFC53D1A] global-cta-clip-path">
							<IconLabel
								icon={IoMdCloseCircle}
								color="#FFC53D"
								title="You are currently not accruing esXAI"
								titleStyles="text-lg text-bananaBoat"
							/>
							<p className="text-lg mt-2 text-bananaBoat font-medium pl-7 pr-8">
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

						<BarStepItem>
							<AssignedKeysCard/>
						</BarStepItem>

						<BarStepItem lastItem={true}>
							<AllowedWalletsCard/>
						</BarStepItem>

						{/*		Show KYC if user has one key assigned and added to their Allowed Wallets list	*/}
						{data && data.whitelistedWallets && hasAssignedKeys && (
							<div className="py-5">
								{kycRequired ? (
									<SquareCard className="bg-[#FFC53D1A] global-cta-clip-path">
										<IconLabel
											icon={IoMdCloseCircle}
											color="#FFC53D"
											title="At least one wallet has unclaimable esXAI"
											titleStyles="text-lg text-bananaBoat"
										/>
										<p className="text-lg text-bananaBoat mt-3 px-7">
											You must pass KYC within 180 days of accruing esXAI to claim accrued node
											rewards. Check back in 48 hours if all docs submitted. Check your inbox
											(including spam) for updates. For KYC issues, contact<a
											className="text-hornetSting font-bold cursor-pointer"
											onClick={() => window.electron.openExternal(`https://help.blockpass.org/hc/en-us/requests/new`)}
										> Blockpass.</a> If not completed, continue submission here.
										</p>
									</SquareCard>
								) : (
									<SquareCard className="!bg-drunkenDragonFly/10 global-cta-clip-path">
										<IconLabel
											icon={AiFillCheckCircle}
											color="#16A34A"
											title="You can claim esXAI"
											titleStyles="text-lg text-drunkenDragonFly"
										/>
										<p className="text-lg text-drunkenDragonFly mt-2 pl-8 pr-3 font-medium">
											You have successfully completed your KYC on all wallets assigned to the
											Sentry.
										</p>
									</SquareCard>
								)}

								{data?.whitelistedWallets?.map((owner, i) => {
									return (
										<BarStepItem
											key={`bar-step-item-${i}`}
											lastItem={i + 1 === data?.whitelistedWallets!.length}
										>
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
			</div>
		</div>
	);
}
