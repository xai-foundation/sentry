import MainTitle from "../titles/MainTitle";
import { Avatar } from "@nextui-org/react";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { useState } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { addUnstakeRequest, getNetwork, getStakedKeysOfUserInPool, getUnstakedKeysOfUser, mapWeb3Error } from "@/services/web3.service";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { PoolInfo } from "@/types/Pool";
import { Id } from "react-toastify";

import { useRouter } from "next/navigation";
import { sendUpdatePoolRequest } from "@/services/requestService";


interface KeyReviewProps {
	pool: PoolInfo;
	inputValue: string;
	onBack: () => void;
	unstake: boolean;
}

export default function StakeKeysDetailReviewComponent({ pool, inputValue, onBack, unstake }: KeyReviewProps) {

	const router = useRouter();

	const [transactionLoading, setTransactionLoading] = useState(false);
	const { address, chainId } = useAccount();
	const { switchChain } = useSwitchChain();
	const { writeContractAsync } = useWriteContract();

	const onConfirm = async () => {

		if (!chainId || !address) {
			return;
		}

		let receipt;
		setTransactionLoading(true);
		const loading = loadingNotification("Transaction is pending...");
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
					receipt = await executeContractWrite(
						WriteFunctions.createUnstakeOwnerLastKeyRequest,
						[pool.address],
						chainId,
						writeContractAsync,
						switchChain
					);
				} else {
					receipt = await executeContractWrite(
						WriteFunctions.createUnstakeKeyRequest,
						[pool.address, BigInt(inputValue)],
						chainId,
						writeContractAsync,
						switchChain
					);
				}
			} else {
				const keyIds = await getUnstakedKeysOfUser(getNetwork(chainId), address as string, Number(inputValue));
				receipt = await executeContractWrite(
					WriteFunctions.stakeKeys,
					[pool.address, keyIds],
					chainId,
					writeContractAsync,
					switchChain
				);
			}
			onSuccess(receipt, loading);
		} catch (ex: any) {
			const error = mapWeb3Error(ex);
			updateNotification(error, loading, true);
			setTransactionLoading(false);
			setTimeout(() => router.back(), 3000);
		}
	}

	const onSuccess = async (receipt: string, loadingToast: Id) => {
		updateNotification(
			`You have successfully ${unstake ? "unstaked" : "staked"} ${inputValue} Keys`,
			loadingToast,
			false,
			receipt,
			chainId
		);
		setTimeout(() => {

			sendUpdatePoolRequest(pool.address, chainId);
			setTransactionLoading(false);

			if (unstake) {
				addUnstakeRequest(getNetwork(chainId), address!, pool.address)
					.then(() => {
						router.push(`/pool/${pool.address}/summary`);
					})

			} else {
				router.push(`/pool/${pool.address}/summary`);
			}

		}, 3000);
	};

	return (
		<main className="flex w-full flex-col items-center">
			<div className="group flex flex-col items-start max-w-xl w-full p-3">
				<ButtonBack onClick={onBack} btnText="Back" />
				<MainTitle title={unstake ? "Review unstake" : `Review stake`} />
				<div className="flex items-center mb-4">
					<span className="mr-2">{unstake ? "You unstake from: " : "You stake to: "}</span>
					<Avatar src={pool.meta.logo} className="w-[32px] h-[32px] mr-2" />
					<span className="text-graphiteGray">{pool.meta.name}</span>
				</div>
				<HeroStat label={unstake ? "You unstake" : "You stake"} value={`${inputValue} Sentry ${Number(inputValue) > 1 ? "Keys" : "Key"}`} />
				<HeroStat
					label={unstake ? "Pool staking balances after this request" : "Pool staking balance after this stake"}
					value={unstake ? `Staked: ${(pool.userStakedKeyIds.length) - (Number(inputValue) || 0)}` : `${pool.userStakedKeyIds.length + Number(inputValue)}`}
				/>
				<PrimaryButton
					onClick={onConfirm}
					btnText={`${transactionLoading ? "Waiting for confirmation..." : "Confirm"
						}`}
					className={`w-full mt-6 font-bold ${transactionLoading && "bg-[#B1B1B1] disabled"
						} disabled:opacity-50`}
				/>
			</div>
		</main>
	);
};

function HeroStat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col mb-4 bg-crystalWhite w-full p-3 rounded-xl">
			<label className="text-[#4A4A4A] text-sm mb-1">{label}</label>
			<span className="text-lightBlackDarkWhite font-medium text-2xl mb-1">
				{value}
			</span>
		</div>
	);
}

// export default KeyReviewComponent;
// function writeContractAsync<const abi extends Abi | readonly unknown[], functionName extends ContractFunctionName<abi, "nonpayable" | "payable">, args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>, chainId extends number>(variables: UnionEvaluate<UnionOmit<{ address: `0x${string}`; abi: abi; functionName: ContractFunctionName<abi, "nonpayable" | "payable"> | (functionName extends ContractFunctionName<abi, "nonpayable" | "payable"> ? functionName : never); args?: ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> | (abi extends Abi ? UnionWiden<args> : never) | undefined; } & (readonly [] extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> ? {} : { args: Widen<args>; }) & { chain?: Chain | null | undefined; } & { [K in keyof ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })]: ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })[K]; } & { type?: "legacy" | undefined; nonce?: number | undefined; gas?: bigint | undefined; gasPrice?: bigint | undefined; maxFeePerBlobGas?: undefined; maxFeePerGas?: undefined; maxPriorityFeePerGas?: undefined; accessList?: undefined; }, "chain"> & { chainId?: number | (chainId extends number ? chainId : undefined) | undefined; } & ConnectorParameter & { __mode?: "prepared" | undefined; }> | UnionEvaluate<UnionOmit<{ address: `0x${string}`; abi: abi; functionName: ContractFunctionName<abi, "nonpayable" | "payable"> | (functionName extends ContractFunctionName<abi, "nonpayable" | "payable"> ? functionName : never); args?: ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> | (abi extends Abi ? UnionWiden<args> : never) | undefined; } & (readonly [] extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> ? {} : { args: Widen<args>; }) & { chain?: Chain | null | undefined; } & { [K in keyof ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })]: ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })[K]; } & { type?: "eip2930" | undefined; nonce?: number | undefined; gas?: bigint | undefined; gasPrice?: bigint | undefined; maxFeePerBlobGas?: undefined; maxFeePerGas?: undefined; maxPriorityFeePerGas?: undefined; accessList?: AccessList | undefined; }, "chain"> & { chainId?: number | (chainId extends number ? chainId : undefined) | undefined; } & ConnectorParameter & { __mode?: "prepared" | undefined; }> | UnionEvaluate<UnionOmit<{ address: `0x${string}`; abi: abi; functionName: ContractFunctionName<abi, "nonpayable" | "payable"> | (functionName extends ContractFunctionName<abi, "nonpayable" | "payable"> ? functionName : never); args?: ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> | (abi extends Abi ? UnionWiden<args> : never) | undefined; } & (readonly [] extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> ? {} : { args: Widen<args>; }) & { chain?: Chain | null | undefined; } & { [K in keyof ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })]: ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })[K]; } & { type?: "eip1559" | undefined; nonce?: number | undefined; gas?: bigint | undefined; gasPrice?: undefined; maxFeePerBlobGas?: undefined; maxFeePerGas?: bigint | undefined; maxPriorityFeePerGas?: bigint | undefined; accessList?: AccessList | undefined; }, "chain"> & { chainId?: number | (chainId extends number ? chainId : undefined) | undefined; } & ConnectorParameter & { __mode?: "prepared" | undefined; }>, options?: MutateOptions<`0x${string}`, WriteContractErrorType, UnionEvaluate<UnionOmit<{ address: `0x${string}`; abi: abi; functionName: functionName | (functionName extends functionName ? functionName : never); args?: ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> | (abi extends Abi ? UnionWiden<args> : never) | undefined; } & (readonly [] extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> ? {} : { args: Widen<args>; }) & { chain?: Chain | null | undefined; } & { [K in keyof ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })]: ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })[K]; } & { type?: "legacy" | undefined; nonce?: number | undefined; gas?: bigint | undefined; gasPrice?: bigint | undefined; maxFeePerBlobGas?: undefined; maxFeePerGas?: undefined; maxPriorityFeePerGas?: undefined; accessList?: undefined; }, "chain"> & { chainId?: number | (chainId extends number ? chainId : undefined) | undefined; } & ConnectorParameter & { __mode?: "prepared" | undefined; }> | UnionEvaluate<UnionOmit<{ address: `0x${string}`; abi: abi; functionName: functionName | (functionName extends functionName ? functionName : never); args?: ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> | (abi extends Abi ? UnionWiden<args> : never) | undefined; } & (readonly [] extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> ? {} : { args: Widen<args>; }) & { chain?: Chain | null | undefined; } & { [K in keyof ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })]: ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })[K]; } & { type?: "eip2930" | undefined; nonce?: number | undefined; gas?: bigint | undefined; gasPrice?: bigint | undefined; maxFeePerBlobGas?: undefined; maxFeePerGas?: undefined; maxPriorityFeePerGas?: undefined; accessList?: AccessList | undefined; }, "chain"> & { chainId?: number | (chainId extends number ? chainId : undefined) | undefined; } & ConnectorParameter & { __mode?: "prepared" | undefined; }> | UnionEvaluate<UnionOmit<{ address: `0x${string}`; abi: abi; functionName: functionName | (functionName extends functionName ? functionName : never); args?: ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> | (abi extends Abi ? UnionWiden<args> : never) | undefined; } & (readonly [] extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName> ? {} : { args: Widen<args>; }) & { chain?: Chain | null | undefined; } & { [K in keyof ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })]: ({ account?: `0x${string}` | Account | undefined; } & GetValue<abi, functionName, bigint | undefined, abi extends Abi ? Extract<Extract<abi[number], { type: "function"; stateMutability: AbiStateMutability; }>, { name: functionName; }> : AbiFunction, IsNarrowable<abi, Abi>> & { dataSuffix?: `0x${string}` | undefined; })[K]; } & { type?: "eip1559" | undefined; nonce?: number | undefined; gas?: bigint | undefined; gasPrice?: undefined; maxFeePerBlobGas?: undefined; maxFeePerGas?: bigint | undefined; maxPriorityFeePerGas?: bigint | undefined; accessList?: AccessList | undefined; }, "chain"> & { chainId?: number | (chainId extends number ? chainId : undefined) | undefined; } & ConnectorParameter & { __mode?: "prepared" | undefined; }>, unknown> | undefined): Promise<`0x${string}`> {
//   throw new Error("Function not implemented.");
// }

