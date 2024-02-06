import {useAtomValue} from "jotai";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useGetWalletBalance} from "@/hooks/useGetWalletBalance";
import {Tooltip} from "@sentry/ui";
import {AiFillWarning, AiOutlineInfoCircle} from "react-icons/ai";
import {ethers} from "ethers";
import {BiLoaderAlt} from "react-icons/bi";
import {Card} from "@/features/home/cards/Card";
import {useEffect, useState} from 'react';
import {FaCircleCheck} from "react-icons/fa6";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {MdRefresh} from "react-icons/md";

export function NetworkRewardsCard() {
	const {owners, licensesList} = useAtomValue(chainStateAtom);
	const {balances, isBalancesLoading, balancesFetchedLast, accruing, kycRequired} = useAtomValue(accruingStateAtom);
	const {combinedOwners} = useCombinedOwners(owners);
	const {data: earnedEsxaiBalance} = useGetWalletBalance(combinedOwners);
	const [currentTime, setCurrentTime] = useState(new Date());
	const {refresh} = useChainDataRefresh();
	const keyCount = licensesList.length;

	const [esXaiBalance, setEsXaiBalance] = useState("--");
	const [accruedEsXaiBalance, setAccruedEsXaiBalance] = useState("--");

	// Calculate the time difference in minutes
	const calculateTimeDifference = (currentTime: Date, lastUpdateTime: Date) => {
		return Math.floor((currentTime.getTime() - lastUpdateTime.getTime()) / 60000);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		getEsxaiBalance();
		getAccruedEsxaiBalance();
	}, [isBalancesLoading, balancesFetchedLast, balances, earnedEsxaiBalance]);


	// esXAI Balance
	function getEsxaiBalance() {
		if (earnedEsxaiBalance != null) {
			if (parseFloat(ethers.formatEther(earnedEsxaiBalance.reduce((acc, item) => acc + item.esXaiBalance, BigInt(0)))).toFixed(6) === "0.000000") {
				setEsXaiBalance("0")
			} else {
				setEsXaiBalance(parseFloat(ethers.formatEther(earnedEsxaiBalance.reduce((acc, item) => acc + item.esXaiBalance, BigInt(0)))).toFixed(0))
			}
		}
	}

	// Accrued esXAI Balance
	function getAccruedEsxaiBalance() {
		if (!isBalancesLoading && balancesFetchedLast && balances != null) {
			if (Number(ethers.formatEther(Object.values(balances).reduce((acc, value) => acc + value.totalAccruedEsXai, BigInt(0)))).toFixed(6) === "0.000000") {
				setAccruedEsXaiBalance("0")
			} else {
				setAccruedEsXaiBalance(Number(ethers.formatEther(Object.values(balances).reduce((acc, value) => acc + value.totalAccruedEsXai, BigInt(0)))).toFixed(0))
			}
		}
	}


	const timeDifference: number | null = !isBalancesLoading && balancesFetchedLast
		? calculateTimeDifference(currentTime, balancesFetchedLast)
		: null;

	return (
		<Card width={"315px"} height={"532px"}>

			<div className="flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5]">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2 className="font-medium">Network Rewards</h2>
					<Tooltip
						header={"Generate Network Rewards esXAI"}
						body={"The more Keys running on a node, the more esXAI rewards are accrued. To claims rewards, the node must be running, the Sentry Wallet must be funded, and the wallets containing the Keys must have passed KYC."}
						position={"end"}
					>
						<AiOutlineInfoCircle size={15} color={"#A3A3A3"}/>
					</Tooltip>
				</div>

				<div className="flex flex-row justify-between items-center gap-1 text-[#A3A3A3]">
					{!isBalancesLoading && balancesFetchedLast ? (
						<div className="flex flex-row justify-center items-center gap-1">
							<p className="flex items-center text-sm">
								{!isBalancesLoading && balancesFetchedLast && (
									timeDifference !== null ? `Updated ${timeDifference}m ago` : 'Just now'
								)}
							</p>
							<a onClick={refresh} className="cursor-pointer">
								<MdRefresh size={14}/>
							</a>
						</div>
					) : (
						<BiLoaderAlt className="animate-spin w-[18px]" color={"#D4D4D4"}/>
					)}
				</div>
			</div>

			<div className="flex flex-col mt-4 py-2 px-4 gap-3">
				<div>
					<div className="flex justify-between items-center text-[#A3A3A3]">

						<div className="flex items-center gap-1 text-[15px]">
							<h3 className="font-medium">esXAI balance</h3>
							<Tooltip
								header={"Claimed esXAI will appear in your wallet balance.\n"}
								body={"Once you pass KYC for a wallet, any accrued esXAI for that wallet will be claimed and reflected in your esXAI balance."}
								position={"end"}
							>
								<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
							</Tooltip>
						</div>
					</div>

					<div className="flex items-center font-semibold">
						<div className="flex items-center gap-2">
							<div
								className="w-[32px] h-[32px] flex justify-center items-center bg-[#F5F5F5] rounded-full">
								<XaiLogo className="text-[#A3A3A3] w-[18px] h-[18px]"/>
							</div>
							<p className="text-4xl">
								{esXaiBalance}
							</p>
						</div>
					</div>
				</div>

				<div>
					<div className="flex justify-between items-center text-[#A3A3A3]">
						<div className="flex items-center gap-1 text-[15px]">
							<h3 className="font-medium">Accrued esXAI</h3>
							<Tooltip
								header={"Each key will accrue esXAI. Pass KYC to claim."}
								body={"This value is the sum of all esXAI accrued for the selected wallet. If esXAI has already been claimed, it will appear in esXAI balance."}
								position={"end"}
							>
								<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
							</Tooltip>
						</div>
					</div>
					<div className="flex items-center font-semibold">
						<div className="flex items-center gap-2">
							<div
								className="w-[24px] h-[24px] flex justify-center items-center bg-[#F5F5F5] rounded-full">
								<XaiLogo className="text-[#A3A3A3] w-[14px] h-[14px]"/>
							</div>
							<p className="text-2xl">
								{accruedEsXaiBalance}
							</p>
						</div>
					</div>
				</div>

				<div>
					<div className="flex items-center gap-1 text-[15px] text-[#A3A3A3]">
						<h3 className="font-medium">Am I accruing esXAI?</h3>
						<Tooltip
							header={"To be accruing esXAI, the following must be true:"}
							body={"1) Your node must be running"}
							body2={"2) Your Sentry Wallet must be funded with at least 0.005 AETH"}
							body3={"3) At least one wallet containing a Key must be assigned to your Sentry"}
							width={500}
							position={"end"}
						>
							<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
						</Tooltip>
					</div>
					<div className="flex items-center font-semibold">
						<p className="text-2xl font-semibold">
							{accruing ? "Yes" : "No"}
						</p>
					</div>
				</div>

				<div>
					<div className="flex items-center gap-1 text-[15px] text-[#A3A3A3]">
						<h3 className="font-medium">How frequently will I accrue?</h3>
						<Tooltip
							header={"esXAI accrued is probabilistic"}
							body={"The more Keys you own, the more frequently you will accrue esXAI. The formula to calculate the average number of wins per month is [number of Keys] x 7."}
							position={"end"}
						>
							<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
						</Tooltip>
					</div>
					<div className="flex items-center">
						<div>
							<p className="text-2xl font-semibold">
								{keyCount * 7}
							</p>
							<p className="text-[12px] text-[#A3A3A3]">
								times per month (on average)
							</p>
						</div>
					</div>
				</div>

			</div>
			{accruing && !kycRequired && (
				<div
					className="absolute bottom-4 left-0 right-0 m-auto max-w-[268px] flex justify-center items-center gap-1 rounded-lg text-sm text-[#16A34A] bg-[#F0FDF4] p-2">
					<div className="flex justify-center items-center gap-2">
						<FaCircleCheck color={"#16A34A"} size={20}/>
						You are accruing and claiming esXAI
					</div>
				</div>
			)}

			{accruing && kycRequired && (
				<div
					className="absolute bottom-3 left-3 m-auto max-w-[268px] flex justify-center items-center gap-1 rounded-lg text-sm text-[#F59E28] bg-[#FFFBEB] p-2">
					<div className="flex justify-center items-center gap-2">
						<AiFillWarning color={"#F59E28"} size={20}/>
						You are accruing but not claiming esXAI
					</div>
				</div>
			)}

			{!accruing && kycRequired && (
				<div
					className="absolute bottom-3 left-3 m-auto max-w-[290px] flex justify-center items-center gap-1 rounded-lg text-sm text-[#F59E28] bg-[#FFFBEB] p-2">
					<div className="flex justify-center items-center gap-2">
						<AiFillWarning color={"#F59E28"} size={20}/>
						You are not accruing or claiming esXAI
					</div>
				</div>
			)}
		</Card>
	);
}
