import {Tooltip} from "@sentry/ui";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {FaEthereum} from "react-icons/fa";
import classNames from "classnames";
import {MdRefresh} from "react-icons/md";
import {useQueryClient} from "react-query";
import {useOperator} from "@/features/operator";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";
import {useBalance} from "@/hooks/useBalance";

export function SentryWalletHeader() {
	const queryClient = useQueryClient();
	const {publicKey} = useOperator();
	const {isFetching: isBalanceLoading, data: balance} = useBalance(publicKey);

	function onRefreshEthBalance() {
		void queryClient.invalidateQueries({queryKey: ["balance", publicKey]});
	}

	function getEthFundsTextColor(): string {
		if (balance?.wei !== undefined && balance.wei >= recommendedFundingBalance) {
			return "text-[#38A349]";
		}

		return "text-[#F59E28]";
	}

	return (
		<div className="flex flex-col items-start w-full border-b border-gray-200 gap-2 py-2 pl-10">
			<div className="flex items-center gap-1">
				<h2 className="font-semibold">Sentry Wallet Balance</h2>
				<Tooltip
					header={"Funds in AETH required"}
					body={"Sentry Wallet balance is used to pay gas fees for automatically claiming accrued esXAI."}
					banner={true}
					bannerTitle={"Recommended minimum balance"}
					bannerValue={"0.005 AETH"}
				>
					<AiOutlineInfoCircle className="text-[#A3A3A3]"/>
				</Tooltip>
			</div>

			<div className="flex justify-center items-center gap-4">
				<div className="flex justify-center items-center gap-1">
					<FaEthereum className="w-6 h-6"/>
					<p className={classNames(getEthFundsTextColor(), "text-2xl font-semibold")}>{(balance == undefined) ? "" : (balance.ethString === "0.0" ? "0" : balance.ethString)} AETH</p>
				</div>
				{isBalanceLoading ? (
					<p className="flex items-center text-[15px] text-[#A3A3A3] select-none">
						Refreshing
					</p>
				) : (
					<a
						onClick={onRefreshEthBalance}
						className="flex items-center text-[15px] text-[#F30919] gap-1 cursor-pointer select-none"
					>
						<MdRefresh/> Refresh
					</a>
				)}
			</div>
		</div>
	)
}
