import {useAtomValue} from "jotai";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useGetWalletBalance} from "@/hooks/useGetWalletBalance";
import {CustomTooltip} from "@sentry/ui";
import {AiFillWarning} from "react-icons/ai";
import {ethers} from "ethers";
import {Card} from "@/features/home/cards/Card";
import {useEffect, useState} from 'react';
import {FaCircleCheck} from "react-icons/fa6";
import {MdRefresh} from "react-icons/md";
import { HelpIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { BiLoaderAlt } from "react-icons/bi";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";

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
		<Card width={"300px"} height={"670px"} customClasses={"bg-nulnOil shadow-default overflow-visible z-10"}>

			<div className="flex flex-row justify-between items-center py-4 px-6 border-b border-chromaphobicBlack">
				<div className="flex flex-row items-center gap-1 text-white text-xl font-bold">
					<h2 className="font-medium">Network Rewards</h2>
					<CustomTooltip
						header={"Generate Network Rewards esXAI"}
						content={"The more Keys running on a node, the more esXAI rewards are accrued. To claims rewards, the node must be running, the Sentry Wallet must be funded, and the wallets containing the Keys must have passed KYC."}
						position={"start"}
						extraClasses={{tooltipText: "!text-elementalGrey"}}
					>
						<HelpIcon width={14} height={14}/>
					</CustomTooltip>
				</div>

				<div className="flex flex-row justify-between items-center gap-1 text-[#A3A3A3]">
					{!isBalancesLoading && balancesFetchedLast ? (
						<div className="flex flex-row justify-center items-center gap-1">
							<a onClick={refresh} className="cursor-pointer">
								<MdRefresh size={20} color={"#FF0030"}/>
							</a>
						</div>
					) : (
						<BiLoaderAlt className="animate-spin w-[18px]" size={20} color={"#FF0030"}/>
					)}
				</div>
			</div>

			<div className="flex flex-col">
				<div className="px-6 py-3 border-b border-chromaphobicBlack">
					<div className="flex justify-between items-center">

						<div className="flex items-center gap-1 text-lg text-elementalGrey mb-[6px]">
							<h3 className="font-medium">esXAI balance</h3>
							<CustomTooltip
								header={"Claimed esXAI will appear in your wallet balance.\n"}
								content={"Once you pass KYC for a wallet, any accrued esXAI for that wallet will be claimed and reflected in your esXAI balance."}
								position={"start"}
								extraClasses={{
									group: "z-auto",
								}}
							>
								<HelpIcon width={14} height={14}/>
							</CustomTooltip>
						</div>
					</div>

					<div className="flex items-center font-semibold">
						<div className="flex flex-col items-start gap-[6px]">
							<p className="text-4xl text-white">
								{esXaiBalance} esXAI
							</p>
							<p className="flex items-center text-base !text-[#726F6F] font-medium">
								{!isBalancesLoading && balancesFetchedLast && (
									timeDifference !== null ? `Updated ${timeDifference}m ago` : 'Just now'
								)}
							</p>
						</div>
					</div>
				</div>

				<div className="px-6 py-3 border-b border-chromaphobicBlack">
					<div className="flex justify-between items-center text-[#A3A3A3]">
						<div className="flex items-center gap-1 text-lg text-elementalGrey">
							<h3 className="font-medium">Accrued esXAI</h3>
							<CustomTooltip
								header={"Each key will accrue esXAI. Pass KYC to claim."}
								content={"This value is the sum of all esXAI accrued for the selected wallet. If esXAI has already been claimed, it will appear in esXAI balance."}
								position={"start"}
								extraClasses={{
									group: "z-auto",
								}}
							>
								<HelpIcon width={14} height={14}/>
							</CustomTooltip>
						</div>					
					</div>
					<div className="flex items-center font-semibold">
						<div className="flex items-center gap-2">
							<p className="text-2xl text-white">
								{accruedEsXaiBalance === "--" ? "0" : accruedEsXaiBalance} esXAI
							</p>
						</div>
					</div>
				</div>

				<div className="px-6 py-3 border-b border-chromaphobicBlack">
					<div className="flex items-center gap-1 text-lg text-elementalGrey">
						<h3 className="font-medium">Am I accruing esXAI?</h3>
						<CustomTooltip
							header={"To be accruing esXAI, the following must be true:"}
							content={<>{"1) Your node must be running"} <br/> {"2) Your Sentry Wallet must be funded with at least 0.005 AETH" } <br/> {"3) At least one wallet containing a Key must be assigned to your Sentry"}</>}
							position={"start"}
							extraClasses={{ tooltipContainer: '!w-[500px]', group: 'z-auto' }}
							
						>
							<HelpIcon width={14} height={14}/>
						</CustomTooltip>
					</div>
					<div className="flex items-center font-semibold">
						<p className="text-2xl font-bold text-white">
							{accruing ? "Yes" : "No"}
						</p>
					</div>
				</div>

				<div className="px-6 py-3 border-b border-chromaphobicBlack">
					<div className="flex items-center gap-1 text-lg text-elementalGrey">
					<h3 className="relative font-medium max-w-[230px]">
					<span className="mr-1">How frequently will I accrue rewards?</span>
					<div className="absolute top-[35px] left-[72px]">
						<CustomTooltip
							header={"esXAI accrued is probabilistic"}
							content={"The more Keys you own, the more frequently you will accrue esXAI. The formula to calculate the average number of wins per month is [number of Keys] x 7."}
							position={"start"}
							extraClasses={{ group: 'z-auto' }}
						>
							<HelpIcon width={14} height={14}/>
						</CustomTooltip>
					</div>
					</h3>
					</div>
					<div className="flex items-center">
						<div>
							<p className="text-2xl font-bold text-white">
								{keyCount * 7}
							</p>
							<p className="text-base text-[#726F6F]">
								times per month (on average)
							</p>
						</div>
					</div>
				</div>

			</div>
			{accruing && !kycRequired && (
				<BaseCallout extraClasses={{ calloutWrapper: "absolute bottom-4 left-0 right-0 m-auto max-w-[258px] flex justify-center items-center gap-1 !font-bold text-lg !text-drunkenDragonFly !bg-drunkenDragonFly/10 p global-cta-clip-path", calloutFront: "!h-[78px] !bg-drunkenDragonFly/10" }} >
					<div className="flex justify-center items-start gap-3">
						<FaCircleCheck color={"#3DD68C"} size={25} style={{minWidth: "20px"}}/>
						You are accruing and claiming esXAI
					</div>
				</BaseCallout>
			)}

			{accruing && kycRequired && (
				<BaseCallout
					isWarning
					extraClasses={{ calloutWrapper: "absolute bottom-3 left-5 m-auto max-w-[258px] flex justify-center items-center gap-1 text-lg !font-bold !text-bananaBoat global-cta-clip-path", calloutFront: "!h-[78px]" }}>
					<div className="flex justify-center items-start gap-2">
						<AiFillWarning color={"#FFC53D"} size={25} style={{minWidth: "20px"}}/>
						You are accruing but not claiming esXAI
					</div>
				</BaseCallout>
			)}

			{!accruing && kycRequired && (
				<BaseCallout isWarning extraClasses={{ calloutWrapper: "absolute bottom-3 left-5 m-auto max-w-[258px] flex justify-center items-center gap-1 text-lg !font-bold !text-bananaBoat global-cta-clip-path", calloutFront: "!h-[78px]" }}>
					<div className="flex justify-center items-start gap-2">
						<AiFillWarning color={"#FFC53D"} size={25} style={{minWidth: "20px"}}/>
						You are not accruing or claiming esXAI
					</div>
				</BaseCallout>
			)}
		</Card>
	);
}
