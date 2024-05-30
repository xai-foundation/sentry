import MainTitle from "../titles/MainTitle";
import { Avatar } from "@nextui-org/react";
import { ButtonBack } from "../buttons/ButtonsComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { addUnstakeRequest, getNetwork, getUnstakedKeysOfUser, mapWeb3Error } from "@/services/web3.service";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { PoolInfo } from "@/types/Pool";
import { Id } from "react-toastify";

import { useRouter } from "next/navigation";
import UnstakeTimeReview from "./UnstakeTimeReview";
import { useGetUnstakePeriods } from "@/app/hooks/hooks";
import { PrimaryButton } from "../ui";


interface KeyReviewProps {
	pool: PoolInfo;
	inputValue: string;
	onBack: () => void;
	unstake: boolean;
	lastKeyOfOwner: boolean;
}

export default function StakeKeysDetailReviewComponent({ pool, inputValue, onBack, unstake, lastKeyOfOwner }: KeyReviewProps) {

	const router = useRouter();

	const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
	const [txLoading, setTxLoading] = useState<boolean>(false);
	const { address, chainId } = useAccount();
	const { switchChain } = useSwitchChain();
	const { writeContractAsync } = useWriteContract();
	const unstakePeriods = useGetUnstakePeriods();


	// Substitute Timeouts with useWaitForTransaction
	const { isError, isSuccess, status } = useWaitForTransactionReceipt({
		hash: receipt,
	});

	const toastId = useRef<Id>();


	const onConfirm = async () => {

		if (!chainId || !address) {
			return;
		}
		setTxLoading(true);
		toastId.current = loadingNotification("Transaction is pending...");
		try {
			// TODO: check eth balance enough for gas
			// TODO: get keys to unstake
			if (unstake) {
				let isOwnerLastKey = false;
				const unstakeCount = pool.userStakedKeyIds.length - (pool.unstakeRequestkeyAmount || 0);
				if (address == pool.owner && unstakeCount == 1) {
					isOwnerLastKey = true;
				}

				if (isOwnerLastKey) {
					setReceipt(await executeContractWrite(
						WriteFunctions.createUnstakeOwnerLastKeyRequest,
						[pool.address],
						chainId,
						writeContractAsync,
						switchChain
					) as `0x${string}`);
				} else {
					setReceipt(await executeContractWrite(
						WriteFunctions.createUnstakeKeyRequest,
						[pool.address, BigInt(inputValue)],
						chainId,
						writeContractAsync,
						switchChain
					) as `0x${string}`);
				}
			} else {
				const keyIds = await getUnstakedKeysOfUser(getNetwork(chainId), address as string, Number(inputValue));
				setReceipt(await executeContractWrite(
					WriteFunctions.stakeKeys,
					[pool.address, keyIds],
					chainId,
					writeContractAsync,
					switchChain
				) as `0x${string}`);
			}
		} catch (ex: any) {
			const error = mapWeb3Error(ex);
			updateNotification(error, toastId.current as Id, true);
			setTxLoading(false);
			router.back();
		}
	}


	const updateOnSuccess = useCallback(() => {
		if (unstake) {
			setTimeout(() => {
				updateNotification(
					`You have successfully created an unstake request for ${inputValue} keys`,
					toastId.current as Id,
					false,
					receipt,
					chainId
				);
				setTxLoading(false);
				addUnstakeRequest(getNetwork(chainId), address!, pool.address)
					.then(() => {
						window.location.href = `/pool/${pool.address}/summary`;
					})
			}, 3500);
		} else {
			updateNotification(
				`You have successfully staked ${inputValue} keys`,
				toastId.current as Id,
				false,
				receipt,
				chainId
			);
			setTxLoading(false);
			router.push(`/pool/${pool.address}/summary`);
		}
	}, [unstake, inputValue, receipt, chainId, address, pool, router])

	const updateOnError = useCallback(() => {
		const error = mapWeb3Error(status);
		setTxLoading(false);
		updateNotification(error, toastId.current as Id, true);
	}, [status])

	useEffect(() => {

		if (isSuccess) {
			updateOnSuccess();
		}
		if (isError) {
			updateOnError();
		}
	}, [isSuccess, isError, updateOnSuccess, updateOnError]);

	return (
		<main className="flex w-full flex-col items-center">
			<div className="group flex flex-col items-start max-w-[500px] w-full">
				<ButtonBack onClick={onBack} btnText="Back to previous step" extraClasses="text-white text-lg font-bold uppercase mb-4" />
				<MainTitle title={unstake ? "Review unstake" : `Review stake`} classNames="sm:px-4 lg:px-0" />
				<div className="flex items-center w-full bg-nulnOilBackground sm:px-4 lg:px-6 py-8 border-b border-chromaphobicBlack shadow-default">
					<span className="mr-4 text-americanSilver text-lg">{unstake ? "Unstaking from: " : "Staking to: "}</span>
					<Avatar src={pool.meta.logo} className="w-[32px] h-[32px] mr-2" />
					<span className="text-white text-lg font-bold">{pool.meta.name}</span>
				</div>
				<HeroStat label={unstake ? "You unstake" : "You stake"} value={`${inputValue} ${inputValue == "1" ? "Sentry Key" : "Sentry Keys" }`} />
				{unstake && (
					<div className="w-full bg-nulnOilBackground shadow-default"><UnstakeTimeReview period={lastKeyOfOwner ? unstakePeriods.unstakeGenesisKeyDelayPeriod : unstakePeriods.unstakeKeysDelayPeriod} /></div>
				)}
				<div className="w-full">
				 <PrimaryButton
					onClick={onConfirm}
					spinner={txLoading}
					btnText={`${txLoading ? "Waiting for confirmation..." : "Confirm"
						}`}
					isDisabled={txLoading}
					className={`w-full font-bold uppercase`}
					/>
				</div>
			</div>
		</main>
	);
};

function HeroStat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col bg-nulnOilBackground w-full sm:px-4 lg:px-6 py-4 shadow-default">
			<label className="text-americanSilver text-lg mb-1">{label}</label>
			<span className="text-white font-bold text-4xl mb-1">
				{value}
			</span>
		</div>
	);
}

