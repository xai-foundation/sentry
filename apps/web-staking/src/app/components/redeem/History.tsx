"use client";

import moment from "moment";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEffect, useRef, useState } from "react";
import { Id } from "react-toastify";
import { useDisclosure } from "@nextui-org/react"

import { OrderedRedemptions, RedemptionRequest, getNetwork, getRedemptions, mapWeb3Error } from "@/services/web3.service";

import MainTitle from "../titles/MainTitle";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";

import { useCallback } from "react";
import { MODAL_BODY_TEXT } from "./Constants";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { BaseModal, PrimaryButton } from "@/app/components/ui";
import { TextButton } from "@/app/components/ui/buttons";
import { useBlockIp, useGetKYCApproved } from "@/app/hooks";
import { listOfCountries } from "../constants/constants";

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

const isInvalidCountry = (country: string | null) => {
	return listOfCountries.some(item => item.label === country) == false;
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

export default function History() {
	const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
	const [isCancel, setIsCancel] = useState(false);
	const [showKYCModal, setShowKYCModal] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState<string | null>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
	const { isApproved } = useGetKYCApproved();
	const {blocked, loading} = useBlockIp();
	const [redemptionHistory, setRedemptionHistory] = useState<OrderedRedemptions>({ open: [], closed: [], claimable: [] });
	const { address, chainId } = useAccount();
	const [currentOffset, setCurrentOffset] = useState(0);
	const [foundAll, setFoundAll] = useState(false);
	const [redemptionsLoading, setRedemptionsLoading] = useState(false);
	const QTY_PER_QUERY = 5; // Number of redemptions to fetch per query
	const AUTO_SCROLL_AMOUNT = 5; // Pixels to scroll up after triggering infinite scroll
	

	const { switchChain } = useSwitchChain();
	const { writeContractAsync } = useWriteContract();

	// Substitute Timeouts with useWaitForTransaction
	const { isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
		hash: receipt,
	});

	const [loadingIndex, setLoadingIndex] = useState(-1);

	const toastId = useRef<Id>();

	const sortLists = (list1: RedemptionRequest[], list2: RedemptionRequest[], sortOrder: 'asc' | 'desc' = 'asc'): RedemptionRequest[] => {
		// Combine lists and remove duplicates based on index
		const combinedSet = new Set([...list1, ...list2].map(item => JSON.stringify(item)));
		const combinedList = Array.from(combinedSet).map(item => JSON.parse(item));
	  
		// Sort the combined list
		return combinedList.sort((a: RedemptionRequest, b: RedemptionRequest) => {
		  return sortOrder === 'asc' ? a.endTime - b.endTime : b.endTime - a.endTime;
		});
	  };

	const reloadRedemptions = useCallback((count = 0) => {
		if (redemptionsLoading) return;
		if (!address || !chainId || foundAll) return;
		if (count > 1) return;
		getRedemptions(getNetwork(chainId), address!, QTY_PER_QUERY, currentOffset)
			.then(orderedRedemptions => {
				if(orderedRedemptions.claimable.length === 0 && orderedRedemptions.open.length === 0 && orderedRedemptions.closed.length === 0) {
					setFoundAll(true);
					return;
				}
				const newClaimableSortedList = sortLists(redemptionHistory.claimable, orderedRedemptions.claimable);
				const newOpenSortedList = sortLists(redemptionHistory.open, orderedRedemptions.open);
				const newClosedSortedList = sortLists(redemptionHistory.closed, orderedRedemptions.closed, 'desc');

				setRedemptionHistory({
					claimable: newClaimableSortedList,
					open: newOpenSortedList,
					closed: newClosedSortedList,
				});
			})
	}, [currentOffset, address, chainId, redemptionHistory, setRedemptionHistory]);

	const updateOnSuccess = useCallback(() => {
		setFoundAll(false);
		updateNotification(isCancel ? 'Cancel successful' : `Claim successful`, toastId.current as Id, false, receipt, chainId);
		reloadRedemptions();
		isCancel && setIsCancel(false);
	}, [receipt, chainId]);

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
		if(!isApproved) {
			setShowKYCModal(true);
			return
		}
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

	const handleScroll = useCallback(() => {
		if (redemptionsLoading) return;
		// If we're not at the bottom, return
		if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;

		setRedemptionsLoading(true);

		try {		
			// If we're at the bottom, trigger a reload
			reloadRedemptions();

			// Increase the offset for the next reload		
			const newOffset = currentOffset + QTY_PER_QUERY;
			setCurrentOffset(newOffset);

			// Scroll up a little to make the reload more visible and give the user space to scroll down for another reload
			const { scrollTop } = document.documentElement;
			window.scrollTo({
				top: scrollTop - AUTO_SCROLL_AMOUNT,
				behavior: 'smooth'
			});
			setRedemptionsLoading(false);

		} catch (error) {
			console.error(error);
			setRedemptionsLoading(false);
		}

	}, [currentOffset, reloadRedemptions]);

	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [handleScroll]);

	useEffect(() => {
		// Load redemptions on initial render
		reloadRedemptions();
	}, []);

	return (
		<>
			<div className="group flex flex-col w-xl">
				<BaseModal isOpened={showKYCModal}
		          closeModal={() => setShowKYCModal(false)} 
		          onSubmit={() => { }} 
		          modalHeader="Pass KYC to claim" 
		          modalBody={<>Your wallet must pass KYC first before you are able to claim. <br className="hidden lg:block" /> To start KYC, first choose your country before continuing.</>} 
		          submitText="CONTINUE"
				  isDisabled={loading || isInvalidCountry(selectedCountry)}
				  isDropdown
				  selectedCountry={selectedCountry}
				  setSelectedCountry={setSelectedCountry}
				  isOpen={isOpen}
				  setIsOpen={setIsOpen}
				  isError={selectedCountry === "United States"}
				  errorMessage="KYC is not available for the selected country"
		  />
				{(redemptionHistory.claimable.length > 0 || redemptionHistory.open.length > 0) &&
					<div className="bg-nulnOil/85 box-shadow-default mb-[53px]">
						<MainTitle
							isSubHeader
							classNames="!text-3xl capitalize border-b-1 border-chromaphobicBlack py-6 md:px-8 px-[17px] !mb-0"
							title="Pending"
						/>
						{redemptionHistory.claimable.map((r:RedemptionRequest, index: number) => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									onCancel={(onClose) => onCancel(r, onClose)}
									claimable={true}
									claimDisabled={isLoading}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.amount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									durationMillis={0}
									isCancelling={isCancel}
									isLoading={isLoading}
									redemptionIndex={r.index}
									loadingIndex={loadingIndex}
									lastIndex={(redemptionHistory.claimable.length - 1 === index) && !redemptionHistory.open.length}
									isPending={true}
								/>
							)
						})}

						{redemptionHistory.open.map((r:RedemptionRequest, index: number) => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									onCancel={(onClose) => onCancel(r, onClose)}
									claimable={false}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.amount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									isLoading={isLoading}
									loadingIndex={loadingIndex}
									redemptionIndex={r.index}
									durationMillis={r.startTime + r.duration - Date.now()}
									lastIndex={redemptionHistory.open.length - 1 === index}
									isPending={true}
								/>
							)
						})}
					</div>
				}

				{(redemptionHistory.closed.length > 0) &&
					<div className="bg-nulnOil/75 shadow-default mb-[53px]">
						<MainTitle
							isSubHeader
							classNames="!text-3xl capitalize border-b-1 border-chromaphobicBlack py-6 md:px-8 px-[17px] !mb-0"
							title="History" />

						{redemptionHistory.closed.map((r:RedemptionRequest, index: number) => {
							return (
								<HistoryCard
									key={r.index}
									onClaim={() => onClaim(r)}
									claimable={false}
									receivedAmount={r.receiveAmount}
									redeemedAmount={r.amount}
									receivedCurrency="XAI"
									redeemedCurrency="esXAI"
									isLoading={isLoading}
									loadingIndex={loadingIndex}
									redemptionIndex={r.index}
									durationMillis={r.endTime - Date.now()}
									lastIndex={redemptionHistory.closed.length - 1 === index}
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
