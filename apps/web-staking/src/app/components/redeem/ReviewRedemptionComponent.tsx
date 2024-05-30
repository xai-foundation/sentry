"use client";

import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";

import { ACTIVE_NETWORK_IDS, RedemptionFactor, getNetwork, getRedemptionPeriod, getWeb3Instance, getWeiAmountFromTextInput, mapWeb3Error } from "@/services/web3.service";
import { CURRENCY } from "./Constants";

import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import MainTitle from "../titles/MainTitle";

import { XaiAbi } from "@/assets/abi/XaiAbi";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";
import { Id } from "react-toastify";


export default function ReviewRedemptionComponent({ onReturn, onRefresh, receiveValue, amount, amountWei, factor, fromCurrency }: {
	onReturn: () => void,
	onRefresh: () => void,
	receiveValue: string,
	amount: string,
	amountWei: string,
	factor: RedemptionFactor,
	fromCurrency: CURRENCY
}) {

	const { address, chainId } = useAccount();

	const [insufficientGas, setInsufficientGas] = useState(false);

	const network = getNetwork(chainId);
	const redemptionPeriodInfo = getRedemptionPeriod(network, factor);
	const { switchChain } = useSwitchChain();
	const [receipt, setReceipt] = useState<`0x${string}` | undefined>();

	// Substitute Timeouts with useWaitForTransaction
	const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
		hash: receipt,
	});

	const toastId = useRef<Id>();

	const updateOnSuccess = useCallback(() => {
		updateNotification("Successful redemption", toastId.current as Id, false, receipt, chainId);
		onRefresh();
	}, [receipt, chainId, onRefresh])

	const updateOnError = useCallback(() => {
		const error = mapWeb3Error(status);
		updateNotification(error, toastId.current as Id, true);
	}, [status])

	useEffect(() => {

		if (isSuccess) {
			updateOnSuccess()
		}
		if (isError) {
			updateOnError();
		}
	}, [isSuccess, isError, updateOnSuccess, updateOnError]);

	const onConfirm = async () => {
		if (!chainId) {
			return;
		}
		if (!ACTIVE_NETWORK_IDS.includes(chainId)) {
			switchChain({ chainId: ACTIVE_NETWORK_IDS[0] });
			return;
		}
		toastId.current = loadingNotification("Transaction is pending...");

		try {
			// TODO: check eth balance enough for gas
			if (fromCurrency === CURRENCY.XAI) {
				setReceipt(await convertXaiToEsXai(amountWei));
			} else {
				setReceipt(await startEsXaiRedemption(amountWei, redemptionPeriodInfo.seconds));
			}
		} catch (ex) {
			const error = mapWeb3Error(ex);
			updateNotification(error, toastId.current as Id, true);
		}
	}

	const { writeContractAsync } = useWriteContract();

	// EsXai -> Xai
	const startEsXaiRedemption = async (weiAmount: string, redemptionPeriodSeconds: number) => {
		return writeContractAsync({
			address: getWeb3Instance(network).esXaiAddress as `0x${string}`,
			abi: esXaiAbi,
			functionName: "startRedemption",
			args: [BigInt(weiAmount), BigInt(redemptionPeriodSeconds)]
		});
	}

	// Xai -> EsXai
	const convertXaiToEsXai = async (weiAmount: string) => {
		return writeContractAsync({
			address: getWeb3Instance(network).xaiAddress as `0x${string}`,
			abi: XaiAbi,
			functionName: "convertToEsXai",
			args: [BigInt(weiAmount)]
		});
	}

	//TODO assign input values
	return <>
		<main className="flex w-full flex-col items-center">
			<div className="group flex flex-col items-start w-xl p-3 w-full max-w-[575px]">

				<ButtonBack onClick={onReturn} btnText="Back" />

				<MainTitle title="Review redemption" />

				<HeroStat label="You redeem" value={`${amount} ${fromCurrency === CURRENCY.XAI ? "XAI" : "esXAI"}`} />
				<HeroStat label="You receive" value={`${receiveValue} ${fromCurrency === CURRENCY.XAI ? "esXAI" : "XAI"}`} />

				<Divider />

				{
					(fromCurrency === CURRENCY.ES_XAI) &&
					<>
						<Stat label="Redemption rate" value={`${factor}%`} />
						<Stat label="Redemption period" value={redemptionPeriodInfo.label} />
						<Stat label="Burn rate" value={`${100 - factor}%`} />
						<Stat label="Burn amount" value={`${Number(amount) - Number(receiveValue)} esXAI`} />
					</>
				}

				{/* This would need to make an gasestimate call to the blockchain, maybe add this in V2 <Stat label="Gas" value="0.001 ETH" /> */}

				{!isLoading ?
					<PrimaryButton onClick={onConfirm} btnText="Confirm" className="w-full mt-6" />
					:
					<PrimaryButton onClick={onConfirm} btnText="Waiting for confirmation ..." isDisabled className="w-full mt-6 bg-steelGray hover:bg-steelGray" />
				}

				{insufficientGas && <Warning text="Error: not enough gas" />}

			</div>
		</main>
	</>

	function HeroStat({ label, value }: { label: string, value: string }) {
		return <div className="flex flex-col mb-4">
			<label className="text-[#4A4A4A] text-sm mb-1">{label}</label>
			<span className="text-lightBlackDarkWhite text-4xl mb-1">{value}</span>
		</div>
	}

	function Divider({ }: {}) {
		return <div className="w-full h-[2px] border-b-1 border-b-light-grey mb-4"></div>
	}

	function Stat({ label, value }: { label: string, value: string }) {
		return <div className="flex flex-row justify-between w-full mb-1">
			<label className="text-[#4A4A4A] text-sm">{label}</label>
			<span className="text-[#4A4A4A] text-sm">{value}</span>
		</div>
	}

	function Warning({ text }: { text: string }) {
		return <div className="flex flex-row my-2">
			{/* TODO: exclamation icon, warning color */}
			<span>{text}</span>
		</div>
	}
}
