import {Card} from "@/features/home/cards/Card";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {GreenPulse, YellowPulse} from "@/features/keys/StatusPulse";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {Tooltip} from "@sentry/ui";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {ethers} from "ethers";
import {useGetWalletBalance} from "@/hooks/useGetWalletBalance";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {BiLoaderAlt} from "react-icons/bi";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";

export function Dashboard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners, combinedLicensesList} = useAtomValue(chainStateAtom);
	const {balances, isBalancesLoading, balancesFetchedLast} = useAtomValue(accruingStateAtom);

	const {startRuntime, sentryRunning} = useOperatorRuntime();
	const {combinedOwners} = useCombinedOwners(owners);
	const keyCount = combinedLicensesList.length;
	const {data: earnedEsxaiBalance} = useGetWalletBalance(combinedOwners);
	const {refresh} = useChainDataRefresh();

	return (
		<div className="flex flex-row gap-4 p-4">
			<div className="flex flex-col gap-4">
				<Card
					size={"lg"}
					header={"Sentry Node Status"}
				>
					<div
						className="cursor-pointer font-semibold"
						onClick={() => startRuntime}
					>
						{sentryRunning ? (
							<div className="relative text-5xl flex items-center gap-2">
								<GreenPulse size={"md"}/> Your node is running
							</div>
						) : (
							<div className="relative text-5xl flex items-center gap-2">
								<YellowPulse size={"md"}/> Your node is paused
							</div>
						)}
					</div>
				</Card>

				<div className="flex gap-4">
					<Card
						size={"sm"}
						header={"Keys"}
						button={true}
						buttonText={"Buy Keys"}
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
					>
						<p className="text-5xl font-semibold">{keyCount}</p>
						<p>In {combinedOwners.length} wallet{combinedOwners.length === 1 ? "" : "s"}</p>
					</Card>

					<Card
						size={"sm"}
						header={"Wallets"}
						button={true}
						buttonText={"Add Wallet"}
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
					>
						<p className="text-5xl font-semibold">
							{combinedOwners.length}
						</p>
					</Card>

				</div>
			</div>
			<Card
				size={"md"}
				header={"Network Rewards"}
			>

				<div className="flex flex-col">
					<div className="flex items-center gap-1 text-[15px] text-[#525252]">
						<p>esXAI balance</p>
						<Tooltip
							header={"Claimed esXAI will appear in your wallet balance.\n"}
							body={"Once you pass KYC for a wallet, any accrued esXAI for that wallet will be claimed and reflected in your esXAI balance."}
						>
							<AiOutlineInfoCircle size={16} color={"#A3A3A3"}/>
						</Tooltip>
					</div>
					<div className="flex items-center gap-2 font-semibold">
						<div>
							{earnedEsxaiBalance ? (
								<div className={`flex gap-1 -end`}>
									<p className="text-3xl">
										{ethers.formatEther(
											earnedEsxaiBalance.reduce((acc, item) => acc + item.esXaiBalance, BigInt(0))
										)}
									</p>
								</div>
							) : (
								<p className="text-3xl">
									Loading...
								</p>
							)}
						</div>

					</div>
				</div>

				<div className="flex flex-col">
					<div className="flex items-center gap-1 text-[15px] text-[#525252]">
						<p>Accrued esXAI (unclaimed)</p>
						<Tooltip
							header={"Each key will accrue esXAI. Pass KYC to claim."}
							body={"This value is the sum of all esXAI accrued for the selected wallet. If esXAI has already been claimed, it will appear in esXAI balance."}
						>
							<AiOutlineInfoCircle size={16} color={"#A3A3A3"}/>
						</Tooltip>
					</div>
					<div className="flex items-center gap-2 font-semibold">
						<div>
							{balances
								?
								<div className={`flex gap-1 items-end`}>
									<p className="text-3xl">
										{ethers.formatEther(Object.values(balances).reduce((acc, value) => acc + value.totalAccruedEsXai, BigInt(0)))}
									</p>
								</div>
								: "Loading..."
							}
						</div>
					</div>

					<p className="absolute bottom-4 left-4 flex items-center text-[12px]">
						Last
						updated: {!isBalancesLoading && balancesFetchedLast ? balancesFetchedLast.toLocaleString() :
						<BiLoaderAlt className="animate-spin w-[18px]"/>}
					</p>
				</div>

			</Card>
		</div>
	)
}
