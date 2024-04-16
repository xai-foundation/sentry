import { Config } from "wagmi";
import { PoolFactoryAbi } from "../assets/abi/PoolFactoryAbi";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import { ACTIVE_NETWORK_IDS, getNetwork, getWeb3Instance } from "./web3.service";
import { SwitchChainMutate, WriteContractMutateAsync } from "wagmi/query";

type TransactionBody = {
	address: `0x${string}`,
	abi: any,
	functionName: WriteFunctions,
	args: any[]
}

type CompleteRedemptionArgs = [BigInt];

type CancelRedemptionArgs = [BigInt];

type CreatePoolArgs = [
	delegateOwner: string,
	keyIds: BigInt[],
	shareConfig: [ownerShare: BigInt, keyBucketShare: BigInt, stakedBucketShare: BigInt],
	poolMetadata: [name: string, description: string, logo: string],
	poolSocials: [website: string, discord: string, telegram: string, twitter: string, instagram: string, youTube: string, tiktok: string],
	trackerDetails: [
		[keyBucketTrackerName: string, keyBucketTrackerSymbol: string],
		[esXaiBucketTrackerName: string, esXaiBucketTrackerSymbol: string]
	] //[["Tracker Name 1", "TS1"], ["Tracker Name 2", "TS2"]]
];

type UpdatePoolMetadataArgs = [
	poolAddress: string,
	poolMetadata: [name: string, description: string, logo: string],
	poolSocials: [website: string, discord: string, telegram: string, twitter: string, instagram: string, youTube: string, tiktok: string]
];

type UpdateSharesArgs = [
	poolAddress: string,
	shareConfig: [ownerShare: BigInt, keyBucketShare: BigInt, stakedBucketShare: BigInt]
];

type UpdateDelegateOwnerArgs = [
	poolAddress: string,
	delegate: string,
];

type StakeKeysArgs = [
	poolAddress: string,
	keyIds: BigInt[],
];

type UnstakeKeysArgs = [
	poolAddress: string,
	unstakeRequestIndex: BigInt,
	keyIds: BigInt[],
];

type StakeEsXaiArgs = [
	poolAddress: string,
	amount: BigInt,
];

type UnstakeEsXaiArgs = [
	poolAddress: string,
	unstakeRequestIndex: BigInt,
	amount: BigInt,
];

type ClaimFromPoolsArgs = [
	poolIndices: string[],
];

type UnstakeEsXaiRequestArgs = [
	poolAddress: string,
	amount: BigInt,
];

type UnstakeKeysRequestArgs = [
	poolAddress: string,
	keyAmount: BigInt,
];

type UnstakeOwnerLastKeyRequestArgs = [
	poolAddress: string,
];

const getWeb3 = (chainId: number) => getWeb3Instance(getNetwork(chainId));

const createTxBody = (functionName: WriteFunctions, address: `0x${string}`, abi: any, args: any[]): TransactionBody => {
	return {
		address,
		abi,
		functionName,
		args,
	};
}

export enum WriteFunctions {
	completeRedemption = "completeRedemption",
	cancelRedemption = "cancelRedemption",
	createPool = "createPool",
	updatePoolMetadata = "updatePoolMetadata",
	updateShares = "updateShares",
	stakeKeys = "stakeKeys",
	unstakeKeys = "unstakeKeys",
	stakeEsXai = "stakeEsXai",
	unstakeEsXai = "unstakeEsXai",
	claimFromPools = "claimFromPools",
	createUnstakeEsXaiRequest = "createUnstakeEsXaiRequest",
	createUnstakeKeyRequest = "createUnstakeKeyRequest",
	createUnstakeOwnerLastKeyRequest = "createUnstakeOwnerLastKeyRequest",
	updateDelegateOwner = "updateDelegateOwner",
}

type FunctionArgs = {
	[WriteFunctions.completeRedemption]: CompleteRedemptionArgs;
	[WriteFunctions.cancelRedemption]: CancelRedemptionArgs;
	[WriteFunctions.createPool]: CreatePoolArgs;
	[WriteFunctions.updatePoolMetadata]: UpdatePoolMetadataArgs;
	[WriteFunctions.updateShares]: UpdateSharesArgs;
	[WriteFunctions.updateDelegateOwner]: UpdateDelegateOwnerArgs;
	[WriteFunctions.stakeKeys]: StakeKeysArgs;
	[WriteFunctions.unstakeKeys]: UnstakeKeysArgs;
	[WriteFunctions.stakeEsXai]: StakeEsXaiArgs;
	[WriteFunctions.unstakeEsXai]: UnstakeEsXaiArgs;
	[WriteFunctions.claimFromPools]: ClaimFromPoolsArgs;
	[WriteFunctions.createUnstakeEsXaiRequest]: UnstakeEsXaiRequestArgs;
	[WriteFunctions.createUnstakeKeyRequest]: UnstakeKeysRequestArgs;
	[WriteFunctions.createUnstakeOwnerLastKeyRequest]: UnstakeOwnerLastKeyRequestArgs;
};

const CONTRACT_FUNCTION_MAP: {
	[WriteFunctions.completeRedemption]: (chainId: number, args: CompleteRedemptionArgs) => TransactionBody;
	[WriteFunctions.cancelRedemption]: (chainId: number, args: CancelRedemptionArgs) => TransactionBody;
	[WriteFunctions.createPool]: (chainId: number, args: CreatePoolArgs) => TransactionBody;
	[WriteFunctions.updatePoolMetadata]: (chainId: number, args: UpdatePoolMetadataArgs) => TransactionBody;
	[WriteFunctions.updateShares]: (chainId: number, args: UpdateSharesArgs) => TransactionBody;
	[WriteFunctions.updateDelegateOwner]: (chainId: number, args: UpdateDelegateOwnerArgs) => TransactionBody;
	[WriteFunctions.stakeKeys]: (chainId: number, args: StakeKeysArgs) => TransactionBody;
	[WriteFunctions.unstakeKeys]: (chainId: number, args: UnstakeKeysArgs) => TransactionBody;
	[WriteFunctions.stakeEsXai]: (chainId: number, args: StakeEsXaiArgs) => TransactionBody;
	[WriteFunctions.unstakeEsXai]: (chainId: number, args: UnstakeEsXaiArgs) => TransactionBody;
	[WriteFunctions.claimFromPools]: (chainId: number, args: ClaimFromPoolsArgs) => TransactionBody;
	[WriteFunctions.createUnstakeEsXaiRequest]: (chainId: number, args: UnstakeEsXaiRequestArgs) => TransactionBody;
	[WriteFunctions.createUnstakeKeyRequest]: (chainId: number, args: UnstakeKeysRequestArgs) => TransactionBody;
	[WriteFunctions.createUnstakeOwnerLastKeyRequest]: (chainId: number, args: UnstakeOwnerLastKeyRequestArgs) => TransactionBody;
} = {
	"completeRedemption": (chainId: number, args: CompleteRedemptionArgs) => {
		return createTxBody(WriteFunctions.completeRedemption, getWeb3(chainId).esXaiAddress as `0x${string}`, esXaiAbi, args)
	},
	"cancelRedemption": (chainId: number, args: CancelRedemptionArgs) => {
		return createTxBody(WriteFunctions.cancelRedemption, getWeb3(chainId).esXaiAddress as `0x${string}`, esXaiAbi, args)
	},
	"createPool": (chainId: number, args: CreatePoolArgs) => {
		return createTxBody(WriteFunctions.createPool, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"updatePoolMetadata": (chainId: number, args: UpdatePoolMetadataArgs) => {
		return createTxBody(WriteFunctions.updatePoolMetadata, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"updateShares": (chainId: number, args: UpdateSharesArgs) => {
		return createTxBody(WriteFunctions.updateShares, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"updateDelegateOwner": (chainId: number, args: UpdateDelegateOwnerArgs) => {
		return createTxBody(WriteFunctions.updateDelegateOwner, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"stakeKeys": (chainId: number, args: StakeKeysArgs) => {
		return createTxBody(WriteFunctions.stakeKeys, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"unstakeKeys": (chainId: number, args: UnstakeKeysArgs) => {
		return createTxBody(WriteFunctions.unstakeKeys, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"stakeEsXai": (chainId: number, args: StakeEsXaiArgs) => {
		return createTxBody(WriteFunctions.stakeEsXai, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"unstakeEsXai": (chainId: number, args: UnstakeEsXaiArgs) => {
		return createTxBody(WriteFunctions.unstakeEsXai, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"claimFromPools": (chainId: number, args: ClaimFromPoolsArgs) => {
		return createTxBody(WriteFunctions.claimFromPools, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"createUnstakeEsXaiRequest": (chainId: number, args: UnstakeEsXaiRequestArgs) => {
		return createTxBody(WriteFunctions.createUnstakeEsXaiRequest, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"createUnstakeKeyRequest": (chainId: number, args: UnstakeKeysRequestArgs) => {
		return createTxBody(WriteFunctions.createUnstakeKeyRequest, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	},
	"createUnstakeOwnerLastKeyRequest": (chainId: number, args: UnstakeOwnerLastKeyRequestArgs) => {
		return createTxBody(WriteFunctions.createUnstakeOwnerLastKeyRequest, getWeb3(chainId).poolFactoryAddress as `0x${string}`, PoolFactoryAbi, args)
	}
} as const;

export const executeContractWrite = async <
	T extends WriteFunctions
>(
	functionName: T,
	args: FunctionArgs[T],
	chainId: number | undefined,
	writeContractAsync: WriteContractMutateAsync<Config, unknown>,
	switchChain: SwitchChainMutate<Config, unknown>
): Promise<string> => {

	if (!chainId) {
		throw new Error("Wallet needs to be connected");
	}

	if (!ACTIVE_NETWORK_IDS.includes(chainId)) {
		switchChain({ chainId: ACTIVE_NETWORK_IDS[0] });
		throw new Error("Switch to the right network needed");
	}

	return writeContractAsync(CONTRACT_FUNCTION_MAP[functionName](chainId, args as any));
};