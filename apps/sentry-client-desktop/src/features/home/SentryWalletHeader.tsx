import { CustomTooltip } from "@sentry/ui";
import classNames from "classnames";
import { MdRefresh } from "react-icons/md";
import { useQueryClient } from "react-query";
import { useOperator } from "@/features/operator";
import { recommendedFundingBalance } from "@/features/home/SentryWallet";
import { useBalance } from "@/hooks/useBalance";
import { HelpIcon, KeyIcon, Wallet } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { FaEthereum } from "react-icons/fa";


interface SentryWalletHeaderProps {
	totalWallets: number
	assignedWallets: number,
	assignedKeys: number,
	totalKeys: number
}

export function SentryWalletHeader({ totalWallets, assignedWallets, assignedKeys, totalKeys }: SentryWalletHeaderProps) {
	const queryClient = useQueryClient();
	const { publicKey } = useOperator();
	const { isFetching: isBalanceLoading, data: balance } = useBalance(publicKey);

	function onRefreshEthBalance() {
		void queryClient.invalidateQueries({ queryKey: ["balance", publicKey] });
	}

	function getEthFundsTextColor(): string {
		if (balance?.wei !== undefined && balance.wei >= recommendedFundingBalance) {
			return "text-drunkenDragonFly";
		}

		return "text-[#F59E28]";
	}

	return (
		<div className="flex flex-col items-start w-full border-b-[2px] border-t-[2px] border-chromaphobicBlack gap-2 py-[22px] pl-[24px] bg-potBlack z-[50]">
			<div className="flex gap-9">
				<div className="flex flex-col items-start gap-1">
					<div className="flex items-center gap-1">
						<h2 className="font-medium text-lg text-elementalGrey">Sentry Wallet Balance</h2>
						<CustomTooltip
							header={"Funds in AETH required"}
							content={
								<div>
									<p className="text-americanSilver block">Sentry Wallet balance is used to pay gas
										fees
										for automatically
										claiming accrued esXAI.</p>
									<p className="text-americanSilver bg-darkRoom p-2 mt-2 flex justify-between">
										<span>Recommended minimum balance</span>
										<span
											className="flex items-center gap-1 font-bold"> <FaEthereum /> 0.005 AETH</span>
									</p>
								</div>
							}
							extraClasses={{ tooltipContainer: "!left-[-38px]", tooltipHeader: "!text-americanSilver" }}
						>
							<HelpIcon width={14} height={14} />
						</CustomTooltip>
						{isBalanceLoading ? (
							<p className="flex items-center text-lg text-pelati select-none ml-[18px]">
								Refreshing
							</p>
						) : (
							<a
								onClick={onRefreshEthBalance}
								className="underline flex items-center text-lg text-pelati gap-1 cursor-pointer select-none ml-[14px] hover:text-white duration-300 ease-in-out"
							>
								<MdRefresh /> Refresh
							</a>
						)}
					</div>

					<div className="flex justify-center items-center gap-1">
						<p className={classNames(getEthFundsTextColor(), "text-4xl ")}>{(balance == undefined) ? "" : (balance.ethString === "0.0" ? "0" : balance.ethString)} AETH</p>
					</div>
				</div>
				<div>
					<h2 className="font-medium text-lg text-elementalGrey">Assigned wallets</h2>
					<div className="flex text-white text-[36px] items-center mt-[-5px] gap-[5px]">
						<Wallet width={35} height={35} extraClasses={"fill-darkRoom"} />
						<p>{assignedWallets}/{totalWallets}</p>
					</div>
				</div>
				<div>
					<h2 className="font-medium text-lg text-elementalGrey">Assigned keys</h2>
					<div className="flex text-white text-[36px] items-center mt-[-5px] gap-[5px]">
						<KeyIcon width={35} height={35} extraClasses={"fill-darkRoom"} />
						<p>{assignedKeys}/{totalKeys}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
