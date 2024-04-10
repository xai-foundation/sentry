"use client";

import moment from "moment";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useState } from "react";
import { Id } from "react-toastify";
import { useDisclosure } from "@nextui-org/react"

import { ACTIVE_NETWORK_IDS, OrderedRedemptions, RedemptionRequest, getNetwork, getWeb3Instance, mapWeb3Error } from "@/services/web3.service";

import MainTitle from "../titles/MainTitle";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";

import { PrimaryButton, SecondaryButton } from "../buttons/ButtonsComponent";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import { useCallback } from "react";
import { ModalComponent } from "../modal/ModalComponent";
import { MODAL_BODY_TEXT } from "./Constants";
import { useRouter } from "next/navigation";

interface HistoryCardProps {
	receivedAmount: number,
	redeemedAmount: number,
	receivedCurrency: string,
	redeemedCurrency: string,
	durationMillis: number,
	claimable: boolean,
	claimDisabled?: boolean,
	onClaim: () => Promise<void>,
	onCancel?: (onClose: () => void) => Promise<void>
}

function formatTimespan(durationMillis: number) {
	let durationStr = moment.duration(durationMillis).humanize();
	if (durationMillis > 0)
		return durationStr + ` left`;
	else
		return durationStr + ` ago`;
}

function HistoryCard({ receivedAmount, redeemedAmount, receivedCurrency, redeemedCurrency, durationMillis, claimable, claimDisabled, onClaim, onCancel }: HistoryCardProps) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const onLocalCancelClick = useCallback(() => {
		if (!claimDisabled) onOpen();
	}, [onOpen, claimDisabled]);

	const onModalSuccessClick = async (onClose: () => void) => {
		if (onCancel) await onCancel(onClose);
	}

	return (
		<>
			<ModalComponent
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				onSuccess={onModalSuccessClick}
				cancelBtnText="No, I changed my mind"
				confirmBtnText="Yes, cancel"
				modalHeader="Cancel redemption"
				modalBody={(
					<span className="text-sm">
						{MODAL_BODY_TEXT}
					</span>
				)}
			/>
			<div className="flex justify-between mb-[16px]">
				<span>
					<span className="flex flex-col font-medium items-start text-[12px] text-slateGray">{receivedAmount} {receivedCurrency}</span>
					<span className="flex flex-col items-start text-[10px] text-steelGray">Redeemed from {redeemedAmount} {redeemedCurrency}</span>
				</span>
				{claimable
					? (
						<>
							<div>
								<PrimaryButton onClick={onClaim} btnText="Claim" isDisabled={claimDisabled === true}
									className={`max-h-8 ${claimDisabled === true ? "bg-steelGray hover:bg-steelGray" : ""}`} />
								<SecondaryButton
									size="sm"
									btnText="Cancel"
									isDisabled={claimDisabled === true}
									hoverClassName="data-[hover=true]:text-red data-[hover=true]:bg-white hover:bg-white"
									className="bg-white w-[50px] mr-custom-17 ml-2"
									onClick={onLocalCancelClick}
								/>
							</div>
						</>
					)
					: <>
						<span className="flex flex-col flex-1 mt-2 pt-2 items-end text-[10px] text-steelGray">{formatTimespan(durationMillis)}</span>

						{onCancel ? <SecondaryButton
							size="xs"
							btnText="Cancel"
							isDisabled={claimDisabled === true}
							hoverClassName="data-[hover=true]:text-red data-[hover=true]:bg-white hover:bg-white"
							className="bg-white w-[50px] mr-custom-17 ml-2"
							onClick={onLocalCancelClick}
						/> : ""}
					</>
				}
			</div>
		</>

	)
};

export default function History({ redemptions, reloadRedemptions }: {
	redemptions: OrderedRedemptions,
	reloadRedemptions: () => void
}) {
	const { address, chainId } = useAccount();
	const [transactionLoading, setTransactionLoading] = useState(false);

	const network = getNetwork(chainId);
	const { switchChain } = useSwitchChain();

	const { writeContractAsync } = useWriteContract();
	const router = useRouter();

	const completeEsXaiRedemption = async (index: number) => {
		return writeContractAsync({
			address: getWeb3Instance(network).esXaiAddress as `0x${string}`,
			abi: esXaiAbi,
			functionName: "completeRedemption",
			args: [BigInt(index)]
		});
	};

	const cancelEsXiRedemption = async (index: number) => {
		return writeContractAsync({
			address: getWeb3Instance(network).esXaiAddress as `0x${string}`,
			abi: esXaiAbi,
			functionName: "cancelRedemption",
			args: [BigInt(index)]
		});
	};

	const onClaim = async (redemption: RedemptionRequest) => {

		if (!chainId) {
			return;
		}
		if (!ACTIVE_NETWORK_IDS.includes(chainId)) {
			switchChain({ chainId: ACTIVE_NETWORK_IDS[0] });
			return;
		}
		let receipt;
		setTransactionLoading(true);
		const loading = loadingNotification("Transaction is pending...");
		try {
			receipt = await completeEsXaiRedemption(redemption.index);
			onSuccess(receipt, loading);
			setTimeout(() => {
				reloadRedemptions();
			}, 3000)
		} catch (ex: any) {
			const error = mapWeb3Error(ex);
			updateNotification(error, loading, true);
			setTransactionLoading(false);
		}
	}

	const onCancel = async (redemption: RedemptionRequest, onClose: () => void) => {

		if (!chainId) {
			return;
		}
		if (!ACTIVE_NETWORK_IDS.includes(chainId)) {
			switchChain({ chainId: ACTIVE_NETWORK_IDS[0] });
			return;
		}
		let receipt;
		setTransactionLoading(true);
		const loading = loadingNotification("Transaction is canceling...");
		try {
			receipt = await cancelEsXiRedemption(redemption.index);
			onSuccess(receipt, loading, 'Cancel successful');
			setTimeout(() => {
				onClose();
				reloadRedemptions();
			}, 3000);
		} catch (ex: any) {
			const error = mapWeb3Error(ex);
			updateNotification(error, loading, true);
			setTransactionLoading(false);
		}
	}

	const onSuccess = async (receipt: string, loadingToast: Id, toastMsg?: string) => {
		updateNotification(toastMsg ?? `Claim successful`, loadingToast, false, receipt, chainId);
		setTransactionLoading(false);
	}

	return (
		<>
			<div className="group flex flex-col w-xl p-3 pr-0">

				{(redemptions.claimable.length > 0 || redemptions.open.length > 0) &&
					<>
						<MainTitle isSubHeader classNames="text-lg" title="Pending" />
						{redemptions.claimable.map(r => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									onCancel={(onClose) => onCancel(r, onClose)}
									claimable={true}
									claimDisabled={transactionLoading}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.redeemAmount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									durationMillis={0}
								/>
							)
						})}

						{redemptions.open.map(r => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									onCancel={(onClose) => onCancel(r, onClose)}
									claimable={false}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.redeemAmount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									durationMillis={r.startTime + r.duration - Date.now()}
								/>
							)
						})}
					</>
				}

				{(redemptions.closed.length > 0) &&
					<>
						<MainTitle isSubHeader classNames="text-lg" title="History" />

						{redemptions.closed.map(r => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									claimable={false}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.redeemAmount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									durationMillis={r.endTime - Date.now()}
								/>
							)
						})}
					</>
				}
			</div>
		</>
	);
}
