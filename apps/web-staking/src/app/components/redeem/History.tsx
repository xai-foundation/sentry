"use client";

import moment from "moment";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEffect, useRef, useState } from "react";
import { Id } from "react-toastify";
import { useDisclosure } from "@nextui-org/react"

import { OrderedRedemptions, RedemptionRequest, mapWeb3Error } from "@/services/web3.service";

import MainTitle from "../titles/MainTitle";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";

import { useCallback } from "react";
import { MODAL_BODY_TEXT } from "./Constants";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { BaseModal, PrimaryButton } from "@/app/components/ui";
import { TextButton } from "@/app/components/ui/buttons";

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
	lastIndex?: boolean;
	isLoading: boolean;
	loadingIndex: number;
	redemptionIndex: number;
	isCancelled?: boolean;
	isPending?: boolean;
	isCancelling?: boolean;
}

function formatTimespan(durationMillis: number) {
	let durationStr = moment.duration(durationMillis).humanize();
	if (durationMillis > 0)
		return durationStr + ` left`;
	else
		return durationStr + ` ago`;
}

function HistoryCard({
	receivedAmount,
	redeemedAmount,
	receivedCurrency,
	redeemedCurrency,
	durationMillis,
	claimable,
	claimDisabled,
	onClaim,
	onCancel,
	lastIndex,
	isLoading,
	loadingIndex,
	redemptionIndex,
	isCancelled = false,
											 isCancelling,
	isPending = false
}: HistoryCardProps) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	moment.relativeTimeThreshold("d", 1000000);

	const onLocalCancelClick = useCallback(() => {
		if (!claimDisabled) onOpen();
	}, [onOpen, claimDisabled]);

	const onModalSuccessClick = async (onClose: () => void) => {
		if (onCancel) await onCancel(onClose);
	}

	return (
		<>

			{/*<ModalComponent*/}
			{/*	isOpen={isOpen}*/}
			{/*	onOpenChange={onOpenChange}*/}
			{/*	onSuccess={onModalSuccessClick}*/}
			{/*	cancelBtnText="No, I changed my mind"*/}
			{/*	confirmBtnText="Yes, cancel"*/}
			{/*	modalHeader="Cancel redemption"*/}
			{/*	modalBody={(*/}
			{/*		<span className="text-sm">*/}
			{/*			{MODAL_BODY_TEXT}*/}
			{/*		</span>*/}
			{/*	)}*/}
			{/*/>*/}


			<BaseModal
				isOpened={isOpen}
				modalBody={MODAL_BODY_TEXT}
				closeModal={onClose}
				onSubmit={() => onModalSuccessClick(onClose)}
				modalHeader="Cancel redemption"
				submitText="Yes, cancel"
				cancelText="No, I changed my mind"
			/>
			<div
				className={`flex justify-between py-4 md:px-8 px-[17px]  ${!lastIndex && "border-b-1 border-chromaphobicBlack"} items-center`}>
				<span>
					<span
						className="flex flex-col font-semibold items-start text-xl text-white">{receivedAmount} {receivedCurrency}</span>
					<span
						className="flex flex-col items-start text-lg font-medium text-elementalGrey">{isPending ? "Redeeming" : "Redeemed"} from {redeemedAmount} {redeemedCurrency}</span>
				</span>
				{claimable
					? (
						<div className="flex gap-[5px]">
							<TextButton
								buttonText={isCancelling && loadingIndex === redemptionIndex ? "Cancelling..." : "Cancel"}
								isDisabled={isCancelling}
								className="text-lg text-bold disabled:text-dugong"
								onClick={onLocalCancelClick}
							/>
							<PrimaryButton
								spinner={isLoading && !isCancelling && loadingIndex === redemptionIndex}
								onClick={onClaim}
								btnText={`${isLoading && !isCancelling && loadingIndex === redemptionIndex ? "Claiming" : "Claim"}`}
								isDisabled={claimDisabled === true}
								wrapperClassName="h-full flex items-center"
								className={`${claimDisabled === true ? "bg-steelGray hover:bg-steelGray" : ""} uppercase w-full ${isLoading && loadingIndex === redemptionIndex ? "max-w-[124px]" : "max-w-[77px]"} !py-[0] !h-[40px]`}
							/>
						</div>
					)
					:
					<div className={`flex ${!isPending ? "flex-col gap-0 items-end" : "flex-row md:gap-2 gap-1 items-center"} `}>
						<span
							className="block text-elementalGrey text-lg font-medium">
							{!isPending && !isCancelled ? "Claimed" : !isPending && isCancelled && "Cancelled"}
						</span>
						<span
							className="flex flex-col flex-1 items-end text-base text-elementalGrey w-max">{formatTimespan(durationMillis)}</span>

						{onCancel ? <TextButton
							buttonText={isLoading && loadingIndex === redemptionIndex ? "Canceling..." : "Cancel"}
							isDisabled={claimDisabled === true}
							className={`${isLoading && loadingIndex === redemptionIndex && "!text-darkRoom"} !pr-0 !mr-0 w-max`}
							textClassName={`!mr-0 text-lg`}
							onClick={onLocalCancelClick}

						/> : ""}
					</div>
				}
			</div>
		</>

	)
};

export default function History({ redemptions, reloadRedemptions }: {
	redemptions: OrderedRedemptions,
	reloadRedemptions: () => void,
}) {
	const { chainId } = useAccount();
	const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
	const [isCancel, setIsCancel] = useState(false);

	const { switchChain } = useSwitchChain();
	const { writeContractAsync } = useWriteContract();

	// Substitute Timeouts with useWaitForTransaction
	const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
		hash: receipt,
	});

	const [loadingIndex, setLoadingIndex] = useState(-1);

	const toastId = useRef<Id>();

	const updateOnSuccess = useCallback(() => {
		updateNotification(isCancel ? 'Cancel successful' : `Claim successful`, toastId.current as Id, false, receipt, chainId);
		reloadRedemptions();
	}, [isCancel, receipt, chainId, reloadRedemptions])

	const updateOnError = useCallback(() => {
		const error = mapWeb3Error(status);
		updateNotification(error, toastId.current as Id, true);
	}, [status])

	useEffect(() => {

		if (isSuccess) {
			updateOnSuccess();
		}
		if (isError) {
			updateOnError()
		}
	}, [isSuccess, isError, updateOnSuccess, updateOnError]);

	const onClaim = async (redemption: RedemptionRequest) => {
		setIsCancel(false);
		setLoadingIndex(redemption.index);
		toastId.current = loadingNotification("Transaction is pending...");
		try {
			setReceipt(await executeContractWrite(
				WriteFunctions.completeRedemption,
				[BigInt(redemption.index)],
				chainId,
				writeContractAsync,
				switchChain
			) as `0x${string}`);

		} catch (ex: any) {
			const error = mapWeb3Error(ex);
			updateNotification(error, toastId.current, true);
		}
	}

	const onCancel = async (redemption: RedemptionRequest, onClose: () => void) => {
		setIsCancel(true);
		setLoadingIndex(redemption.index);
		toastId.current = loadingNotification("Transaction is canceling...");
		try {
			setReceipt(await executeContractWrite(
				WriteFunctions.cancelRedemption,
				[BigInt(redemption.index)],
				chainId,
				writeContractAsync,
				switchChain
			) as `0x${string}`);
			onClose();
		} catch (ex: any) {
			const error = mapWeb3Error(ex);
			setIsCancel(false);
			updateNotification(error, toastId.current as Id, true);
		}
	}

	return (
		<>
			<div className="group flex flex-col w-xl">
				{(redemptions.claimable.length > 0 || redemptions.open.length > 0) &&
					<div className="bg-nulnOil/85 box-shadow-default mb-[53px]">
						<MainTitle
							isSubHeader
							classNames="!text-3xl capitalize border-b-1 border-chromaphobicBlack py-6 md:px-8 px-[17px] !mb-0"
							title="Pending"
						/>
						{redemptions.claimable.map((r, index) => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									onCancel={(onClose) => onCancel(r, onClose)}
									claimable={true}
									claimDisabled={isLoading}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.redeemAmount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									durationMillis={0}
									isCancelling={isCancel}
									isLoading={isLoading}
									redemptionIndex={r.index}
									loadingIndex={loadingIndex}
									lastIndex={(redemptions.claimable.length - 1 === index) && !redemptions.open.length}
									isPending={true}
								/>
							)
						})}

						{redemptions.open.map((r, index) => {
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
									isLoading={isLoading}
									loadingIndex={loadingIndex}
									redemptionIndex={r.index}
									durationMillis={r.startTime + r.duration - Date.now()}
									lastIndex={redemptions.open.length - 1 === index}
									isPending={true}
								/>
							)
						})}
					</div>
				}

				{(redemptions.closed.length > 0) &&
					<div className="bg-nulnOil/75 shadow-default mb-[53px]">
						<MainTitle
							isSubHeader
							classNames="!text-3xl capitalize border-b-1 border-chromaphobicBlack py-6 md:px-8 px-[17px] !mb-0"
							title="History" />

						{redemptions.closed.map((r, index) => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									claimable={false}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.redeemAmount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									isLoading={isLoading}
									loadingIndex={loadingIndex}
									redemptionIndex={r.index}
									durationMillis={r.endTime - Date.now()}
									lastIndex={redemptions.closed.length - 1 === index}
									isCancelled={r.cancelled}
									isPending={false}
								/>
							)
						})}
					</div>
				}
			</div>
		</>
	);
}
