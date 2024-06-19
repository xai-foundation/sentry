import Web3, { Contract } from "web3";
import { PoolFactoryAbi } from "@/assets/abi/PoolFactoryAbi";
import { RefereeAbi } from "../assets/abi/RefereeAbi";
import { XaiAbi } from "@/assets/abi/XaiAbi";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import { NodeLicenseAbi } from "@/assets/abi/NodeLicenseAbi";
import { StakingPoolAbi } from "@/assets/abi/StakingPoolAbi";
import { PoolInfo } from "@/types/Pool";

export type Web3Instance = {
	name: string,
	web3: Web3,
	rpcUrl: string,
	chainId: number,
	refereeAddress: string,
	xaiAddress: string,
	esXaiAddress: string,
	nodeLicenseAddress: string,
	poolFactoryAddress: string,
	explorer: string
}

export const networkKeys = ["arbitrum", "arbitrumSepolia"] as const;
export type NetworkKey = typeof networkKeys[number];

export const MAINNET_ID = 42161;
export const TESTNET_ID = 421614;

export const ACTIVE_NETWORK_IDS = process.env.NEXT_PUBLIC_APP_ENV === "development" ? [MAINNET_ID, TESTNET_ID] : [MAINNET_ID];

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const web3Instances: { [key in NetworkKey]: Web3Instance } = {
	'arbitrum': {
		name: 'Arbitrum Nova',
		web3: new Web3('https://arb1.arbitrum.io/rpc'),
		rpcUrl: 'https://arb1.arbitrum.io/rpc',
		chainId: 42161,
		refereeAddress: "0xfD41041180571C5D371BEA3D9550E55653671198",
		xaiAddress: "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66",
		esXaiAddress: "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c",
		nodeLicenseAddress: "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66",
		poolFactoryAddress: "0xF9E08660223E2dbb1c0b28c82942aB6B5E38b8E5",
		explorer: 'https://arbiscan.io/'
	},
	'arbitrumSepolia': {
		name: 'Arbitrum Sepolia',
		// web3: new Web3('https://sepolia-rollup.arbitrum.io/rpc'),
		// rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
		web3: new Web3('https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B'),
		rpcUrl: 'https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B',
		chainId: 421614,
		refereeAddress: "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b",
		xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
		esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
		nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2",
		poolFactoryAddress: "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
		explorer: 'https://sepolia.arbiscan.io/'
	}
} as const;

export type RedemptionFactor = 25 | 62.5 | 100;
const RedemptionPeriodsByNetwork: { [key in NetworkKey]: { [key in RedemptionFactor]: { seconds: number, label: string } } } = {
	'arbitrum': {
		25: { seconds: 1296000, label: "15 days" },	// 15 days
		62.5: { seconds: 7776000, label: "90 days" },	// 90 days
		100: { seconds: 15552000, label: "180 days" },	// 180 days
	},
	'arbitrumSepolia': {
		25: { seconds: 60, label: "1 min" },			// 1 min
		62.5: { seconds: 300, label: "5 min" },		// 5 min
		100: { seconds: 600, label: "10 min" },		// 10 min
	}
} as const;

const getBurnFeeFromDuration = (duration: number) => {
	if (duration == 1296000 || duration == 60) {
		return 25;
	} else if (duration == 7776000 || duration == 300) {
		return 62.5;
	} else {
		return 100;
	}
}

export const getRedemptionPeriod = (network: NetworkKey, factor: RedemptionFactor) => {
	return RedemptionPeriodsByNetwork[network][factor];
}


export type MappedWeb3Error =
	"Staking not enabled" |
	"Redemption is currently inactive" |
	"Insufficient funds" |
	"User rejected the request" |
	"Maximum staking amount exceeded" |
	"Must complete KYC" |
	"Something went wrong";

//TODO make this loop over expected errors
export const mapWeb3Error = (error: any): MappedWeb3Error => {
	error = error.toString();
	if (hasErrorCode(1, error)) {
		// feature is disabled on contract-side
		return "Staking not enabled";
	} else if (error.includes("Redemption is currently inactive")) {
		// feature is disabled on contract-side
		return "Redemption is currently inactive";
	} else if (error.includes("Insufficient funds")) {
		// user does not have enough coin to pay for transaction
		return "Insufficient funds";
	} else if (error.includes("User rejected the request")) {
		// user clicked 'Reject' in wallet provider
		return "User rejected the request";
	} else if (hasErrorCode(43, error) || hasErrorCode(49, error)) {
		// user clicked 'Confirm' in stake 
		return "Maximum staking amount exceeded";
	}
	else if (hasErrorCode(42, error)) {
		// user clicked 'Confirm' in stake 
		return "Must complete KYC";
	} else {
		// unknown error
		console.error("Blockchain transaction failed with error", error);
		return "Something went wrong";
	}
};

export const hasErrorCode = (code: number, error: string): boolean => {
	if (error.includes(`reverted with the following reason:\n${code}\n`)) {
		return true;
	} else {
		return false;
	}
};

type PoolFactoryContract = Contract<typeof PoolFactoryAbi>;
type RefereeContract = Contract<typeof RefereeAbi>;
type XaiContract = Contract<typeof XaiAbi>;
type esXaiContract = Contract<typeof esXaiAbi>;
type NodeLicenseContract = Contract<typeof NodeLicenseAbi>;

export const getChainId = (network: NetworkKey) => {
	return (web3Instances[network] as Web3Instance).chainId;
}

export const getNetwork = (chainId: number = MAINNET_ID): NetworkKey => {
	const network = (Object.keys(web3Instances) as NetworkKey[]).find((networkKey: NetworkKey) => web3Instances[networkKey]!.chainId == chainId);
	if (!network) {
		return "arbitrum";
	}
	return network;
}

export const getCurrentBlockNumber = async (network: NetworkKey): Promise<number> => {
	const value = await ((web3Instances[network] as Web3Instance).web3 as Web3).eth.getBlockNumber();
	return Number(value);
}

export const getBlockTimestamp = async (blockNum: number, network: NetworkKey): Promise<number> => {
	const block = await ((web3Instances[network] as Web3Instance).web3 as Web3).eth.getBlock(blockNum);
	return Number(block.timestamp);
}

export const getExplorerUrl = (network: NetworkKey): string => {
	const instance = web3Instances[network] as Web3Instance;
	return instance.explorer;
}

export const getWeb3Instance = (network: NetworkKey): Web3Instance => {
	const web3 = web3Instances[network];
	if (!web3) {
		throw new Error("Invalid network " + network);
	}
	return web3;
}

export const getWeiAmountFromTextInput = (amount: string): string => {
	const [intValue, decimals] = amount.split(amount.includes(".") ? "." : ",");
	const decimalValue = BigInt(Number("0." + (decimals || 0)) * 10 ** 18);
	const amountWei = intValue + (decimalValue > 0 ? decimalValue.toString() : "000000000000000000")
	return amountWei;
}

export const getXaiBalance = async (network: NetworkKey, walletAddress: string): Promise<{ balance: number, balanceWei: string }> => {
	const web3Instance = getWeb3Instance(network);
	const xaiContract = new web3Instance.web3.eth.Contract(XaiAbi, web3Instance.xaiAddress);
	const balance = await xaiContract.methods.balanceOf(walletAddress).call();
	return { balance: Number(web3Instance.web3.utils.fromWei(balance.toString(), 'ether')), balanceWei: balance.toString() }
}

const getEsXaiBalanceWei = async (web3Instance: Web3Instance, walletAddress: string): Promise<bigint> => {
	const esXaiContract = new web3Instance.web3.eth.Contract(esXaiAbi, web3Instance.esXaiAddress);
	const balance = await esXaiContract.methods.balanceOf(walletAddress).call();
	return balance as bigint;
}

export const getEsXaiBalance = async (network: NetworkKey, walletAddress: string): Promise<{ balance: number, balanceWei: string }> => {
	const web3Instance = getWeb3Instance(network);
	const balanceWei = await getEsXaiBalanceWei(web3Instance, walletAddress);
	return { balance: Number(web3Instance.web3.utils.fromWei(balanceWei, 'ether')), balanceWei: balanceWei.toString() }
}

export const getStakedAmount = async (network: NetworkKey, walletAddress: string): Promise<{ stakedAmount: number, stakedAmountWei: string }> => {
	const web3Instance = getWeb3Instance(network);
	const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
	try {
		const staked = await refereeContract.methods.stakedAmounts(walletAddress).call();
		return { stakedAmount: Number(web3Instance.web3.utils.fromWei(staked.toString(), 'ether')), stakedAmountWei: staked.toString() }
	} catch (error) {
		console.log("Error getting stakedAmount", error);
		return { stakedAmount: 0, stakedAmountWei: "0" };
	}
}

export const getMaxStakedAmount = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
	const numNodeLicenses = await getNodeLicenses(network, walletAddress);
	try {
		const maxStakePerKey = await refereeContract.methods.maxStakeAmountPerLicense().call() as bigint;
		const maxStake = maxStakePerKey * BigInt(numNodeLicenses)
		const stakedAmount = await refereeContract.methods.stakedAmounts(walletAddress).call();
		return Number(web3Instance.web3.utils.fromWei((maxStake as bigint) - (stakedAmount as bigint), 'ether'));
	} catch (error) {
		console.log("Error getting getMaxStakedAmount", error);
		return 0;
	}
}

let MAX_STAKE_PER_LICENSE = 0;
export const getMaxStakedAmountPerLicense = async (network: NetworkKey): Promise<number> => {
	if (MAX_STAKE_PER_LICENSE === 0) {
		const web3Instance = getWeb3Instance(network);
		const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
		const maxStake = await refereeContract.methods.maxStakeAmountPerLicense().call();
		MAX_STAKE_PER_LICENSE = Number(web3Instance.web3.utils.fromWei((maxStake as bigint), 'ether'));
	}
	return MAX_STAKE_PER_LICENSE;
}

export const getNodeLicenses = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const nlContract = new web3Instance.web3.eth.Contract(NodeLicenseAbi, web3Instance.nodeLicenseAddress);
	const numLicenses = await nlContract.methods.balanceOf(walletAddress).call();
	return Number(numLicenses);
}

export type RedemptionRequest = {
	redeemAmount: number;
	receiveAmount: number;
	startTime: number;
	endTime: number;
	duration: number;
	completed: boolean;
	cancelled: boolean;
	index: number;	// index of redemption by user wallet address
};

export type OrderedRedemptions = {
	claimable: RedemptionRequest[];
	open: RedemptionRequest[];
	closed: RedemptionRequest[];
};

export const getRedemptions = async (network: NetworkKey, walletAddress: string): Promise<OrderedRedemptions> => {
	const storageKey = "redemptionRequests" + network + walletAddress;
	const storage = localStorage.getItem(storageKey);
	const cachedRedemptions = JSON.parse(storage || "[]");

	const web3Instance = getWeb3Instance(network);
	const esXaiContract = new web3Instance.web3.eth.Contract(esXaiAbi, web3Instance.esXaiAddress);
	const numRedemptions = Number(await esXaiContract.methods.getRedemptionRequestCount(walletAddress).call());

	const numCachedRedemption = cachedRedemptions.length;

	if (numRedemptions != numCachedRedemption) {
		for (let i = numCachedRedemption; i < numRedemptions; i++) {
			const res = await esXaiContract.methods.getRedemptionRequest(walletAddress, i).call();
			const redemption: RedemptionRequest = {
				receiveAmount: Number(web3Instance.web3.utils.fromWei(res.amount, "ether")) * getBurnFeeFromDuration(Number(res.duration)) / 100, //TODO calculate by duration
				duration: Number(res.duration) * 1000,		// contract works with seconds
				startTime: Number(res.startTime) * 1000,	// convert to milliseconds for convenient use with js APIs
				endTime: Number(res.endTime) * 1000,	// convert to milliseconds for convenient use with js APIs
				redeemAmount: Number(web3Instance.web3.utils.fromWei(res.amount, "ether")),
				completed: res.completed,
				cancelled: res.cancelled,
				index: i
			};
			cachedRedemptions.push(redemption);
		}
	}

	let open = [], closed = [], claimable = [];
	for (let i = 0; i < cachedRedemptions.length; i++) {
		const redemption = cachedRedemptions[i];

		if (!redemption.completed) {

			if (i < numCachedRedemption) {
				//Check if cancelled
				const res = await esXaiContract.methods.getRedemptionRequest(walletAddress, i).call();

				if (res.completed) {
					cachedRedemptions[i].completed = res.completed;
					cachedRedemptions[i].cancelled = res.cancelled;
					cachedRedemptions[i].endTime = Number(res.endTime) * 1000;
					closed.push(redemption);
					continue;
				}
			}

			const elapsedSeconds = Date.now() - redemption.startTime;
			if (elapsedSeconds >= redemption.duration) {
				claimable.push(redemption);
			} else {
				redemption.endTime = redemption.startTime + redemption.duration;
				open.push(redemption);
			}
		} else {
			closed.push(redemption);
		}
	}

	localStorage.setItem(storageKey, JSON.stringify(cachedRedemptions));

	return {
		claimable,

		open: open.sort((a: RedemptionRequest, b: RedemptionRequest) => {
			return a.endTime - b.endTime;
		}),

		closed: closed.sort((a: RedemptionRequest, b: RedemptionRequest) => {
			return b.endTime - a.endTime;
		}),
	};
}

export const getEsXaiAllowance = async (network: NetworkKey, owner: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const esXaiContract = new web3Instance.web3.eth.Contract(esXaiAbi, web3Instance.esXaiAddress);
	const allowance = await esXaiContract.methods.allowance(owner, web3Instance.poolFactoryAddress).call();
	return Number(web3Instance.web3.utils.fromWei(allowance.toString(), 'ether'));
}

/**
 * @param network The blockchain network to connect to
 * @returns The total number of pools known to the contract
 */
export const getPoolsCount = async (network: NetworkKey): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	const numPools = await factoryContract.methods.getPoolsCount().call();
	return Number(numPools);
}

/**
 * @param network The blockchain network to connect to
 * @param user The account for which to query number of pools
 * @returns The number of pools owned by user
 */
export const getPoolsOfUserCount = async (network: NetworkKey, user: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	const numPools = await factoryContract.methods.getPoolsOfUserCount(user).call();
	return Number(numPools);
}

type BaseInfo = {
	poolAddress: string;
	owner: string;
	keyBucketTracker: string;
	esXaiBucketTracker: string;
	keyCount: BigInt;
	totalStakedAmount: BigInt;
	updateSharesTimestamp: BigInt;
	ownerShare: BigInt;
	keyBucketShare: BigInt;
	stakedBucketShare: BigInt;
};

type Socials = [string, string, string, string, string, string, string];
type PendingShares = [BigInt, BigInt, BigInt];

type RawPoolInfo = {
	baseInfo: BaseInfo;
	_name: string;
	_description: string;
	_logo: string;
	_socials: Socials;
	_pendingShares: PendingShares;
	_ownerStakedKeys: BigInt;
	_ownerRequestedUnstakeKeyAmount: BigInt;
	_ownerLatestUnstakeRequestLockTime: BigInt;
};

// User-specific data type
type RawUserInfo = {
	userStakedEsXaiAmount: BigInt;
	userClaimAmount: BigInt;
	userStakedKeyIds: BigInt[];
	unstakeRequestkeyAmount: BigInt,
	unstakeRequestesXaiAmount: BigInt,
};

export const getPoolInfo = async (network: NetworkKey, poolAddress: string, userAddress?: string): Promise<PoolInfo> => {
	const web3Instance = getWeb3Instance(network);
	const stakingPoolContract = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddress);

	const poolInfo = await stakingPoolContract.methods.getPoolInfo().call() as RawPoolInfo;

	const maxKeyCount = await getMaxKeyCount(network);
	const maxStakePerLicense = await getMaxStakedAmountPerLicense(network);

	let userInfo: RawUserInfo | undefined;
	if (userAddress) {
		userInfo = await stakingPoolContract.methods.getUserPoolData(userAddress).call() as RawUserInfo;
	}
	return toPoolInfo(web3Instance, poolInfo, userInfo, userAddress, maxKeyCount, maxStakePerLicense);
}

export const getDelegateOwner = async (network: NetworkKey, poolAddress: string): Promise<string> => {
	const web3Instance = getWeb3Instance(network);
	const stakingPoolContract = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddress);

	const delegate = await stakingPoolContract.methods.getDelegateOwner().call();
	return delegate == ZERO_ADDRESS ? "" : delegate;
}

export const getRawPoolInfo = async (network: NetworkKey, poolAddress: string): Promise<RawPoolInfo> => {
	const web3Instance = getWeb3Instance(network);
	const stakingPoolContract = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddress);
	return await stakingPoolContract.methods.getPoolInfo().call() as RawPoolInfo;
}

export const getTotalClaimAmount = async (network: NetworkKey, poolAddresses: string[], userAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);

	let totalClaim = 0;

	for (let i = 0; i < poolAddresses.length; i++) {
		const stakingPoolContract = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddresses[i]);
		const userInfo = await stakingPoolContract.methods.getUserPoolData(userAddress).call() as RawUserInfo;
		totalClaim += Number(web3Instance.web3.utils.fromWei(userInfo.userClaimAmount.toString(), 'ether'));
	}

	return totalClaim;
}


/**
 * @param network The blockchain network to connect to
 * @param userAddress address of user
 * @returns addresses of pools the user has interacted with
 */
export const getPoolAddressesOfUser = async (network: NetworkKey, userAddress?: string): Promise<string[]> => {
	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	const result = await factoryContract.methods.getPoolIndicesOfUser(userAddress).call() as string[];
	return result;
}

/**
 * @param network The blockchain network to connect to
 * @param userAddress The account for which to query owned pools
 * @param index The index of the pool to retrieve
 * @returns (Meta-)data about the pool
 */
export const getPoolAddressOfUserAtIndex = async (network: NetworkKey, userAddress: string, index: number): Promise<string> => {
	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	return await factoryContract.methods.getPoolAddressOfUser(userAddress, index).call() as string;
}

/**
 * @returns The contract address of the pool contract at index
 * @param network The blockchain network to connect to
 * @param index The index of the pool within the array of pools
 */
export const getPoolAddressAtIndex = async (network: NetworkKey, index: number): Promise<string> => {
	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	return await factoryContract.methods.getPoolAddress(index).call() as string;
}

let MAX_KEY_COUNT_PER_POOL = 0;
let MAX_KEY_COUNT_PER_POOL_CACHED_AT = Date.now();

export const getMaxKeyCount = async (network: NetworkKey): Promise<number> => {
	if (MAX_KEY_COUNT_PER_POOL === 0 || (Date.now() - MAX_KEY_COUNT_PER_POOL_CACHED_AT) / 1000 > 60) {
		const web3Instance = getWeb3Instance(network);
		const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
		MAX_KEY_COUNT_PER_POOL_CACHED_AT = Date.now();
		MAX_KEY_COUNT_PER_POOL = Number(await refereeContract.methods.maxKeysPerPool().call() as BigInt);
	}
	return MAX_KEY_COUNT_PER_POOL;
}

export const getUnstakedKeysOfUser = async (network: NetworkKey, walletAddress: string, requestedCount: number): Promise<BigInt[]> => {
	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	const numNodeLicenses = await getNodeLicenses(network, walletAddress);
	const availableKeys: BigInt[] = [];
	try {
		let offset = 0;
		while (availableKeys.length < requestedCount) {
			const keys = await factoryContract.methods.getUnstakedKeyIdsFromUser(walletAddress, BigInt(offset), BigInt(10)).call() as BigInt[];
			keys.forEach(k => {
				if (Number(k) != 0) {
					availableKeys.push(k);
				}
			})
			offset += 10;

			if (offset >= numNodeLicenses) {
				break;
			}
		}
	} catch (error) {
		console.error("Failed to load unstaked keys", error);
	}
	return availableKeys.slice(0, requestedCount);
}

export const getStakedKeysCount = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
	const count = await refereeContract.methods.assignedKeysOfUserCount(walletAddress).call() as BigInt;
	return Number(count);
}

export const getAvailableKeysForStaking = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const count = await getStakedKeysCount(network, walletAddress);
	const numNodeLicenses = await getNodeLicenses(network, walletAddress);
	return numNodeLicenses - count;
}

export const getStakedKeysOfUserInPool = async (network: NetworkKey, poolAddress: string, walletAddress: string): Promise<BigInt[]> => {
	const web3Instance = getWeb3Instance(network);
	const stakingPool = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddress);
	const userPoolData = await stakingPool.methods.getUserPoolData(walletAddress).call() as any[];
	return userPoolData[2] as BigInt[];
}

export const getUserRequestedUnstakeAmounts = async (network: NetworkKey, poolAddress: string, walletAddress: string): Promise<BigInt[]> => {
	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddress);
	const requestedUnstakeAmounts = await factoryContract.methods.getUserRequestedUnstakeAmounts(walletAddress).call();
	return requestedUnstakeAmounts;
};

let BUCKET_MAX_SHARES: [ownerShare: number, keyShare: number, esXaiStakeShare: number];
export const getMaxBucketShares = async (network: NetworkKey): Promise<[ownerShare: number, keyShare: number, esXaiStakeShare: number]> => {
	if (!BUCKET_MAX_SHARES) {
		const web3Instance = getWeb3Instance(network);
		const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
		const ownerShare = await factoryContract.methods.bucketshareMaxValues(0).call() as BigInt;
		const keyShare = await factoryContract.methods.bucketshareMaxValues(1).call() as BigInt;
		const esXaiStakeShare = await factoryContract.methods.bucketshareMaxValues(2).call() as BigInt;
		BUCKET_MAX_SHARES = [Number(ownerShare) / POOL_SHARES_BASE, Number(keyShare) / POOL_SHARES_BASE, Number(esXaiStakeShare) / POOL_SHARES_BASE]
	}
	return BUCKET_MAX_SHARES;
}

export const isKYCApproved = async (network: NetworkKey, walletAddress: string): Promise<boolean> => {
	const web3Instance = getWeb3Instance(network);
	const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
	try {
		const isApproved = await refereeContract.methods.isKycApproved(walletAddress).call() as boolean;
		return isApproved;
	} catch (error) {
		console.log("Error checking isKYCApproved", error);
		return false;
	}
}

export const POOL_SHARES_BASE = 10_000;

/**
 * @param rawPoolInfo A raw PoolInfo data struct, as returned from the contract.
 * @returns A PoolInfo key-value map object.
 */
export const toPoolInfo = async (
	web3Instance: Web3Instance,
	rawPoolInfo: RawPoolInfo,
	rawUserInfo?: RawUserInfo,
	userWallet?: string,
	maxKeyCount: number = MAX_KEY_COUNT_PER_POOL,
	maxStakePerLicense: number = MAX_STAKE_PER_LICENSE
): Promise<PoolInfo> => {
	const baseInfo: BaseInfo = rawPoolInfo.baseInfo;

	const pendingShares: number[] = rawPoolInfo._pendingShares.map(p => Number(p) / POOL_SHARES_BASE);

	let updateSharesTimestamp = Number(baseInfo.updateSharesTimestamp) * 1000;
	let ownerShare = Number(baseInfo.ownerShare) / POOL_SHARES_BASE;
	let keyBucketShare = Number(baseInfo.keyBucketShare) / POOL_SHARES_BASE;
	let stakedBucketShare = Number(baseInfo.stakedBucketShare) / POOL_SHARES_BASE;
	//Remove becasue of bug in the StakingPool contract, it will not return the correct _ownerLatestUnstakeRequestLockTime, we need to get it from the synced db or subgraph
	// let ownerLatestUnstakeRequestCompletionTime = Number(rawPoolInfo._ownerLatestUnstakeRequestLockTime) * 1000;

	if (updateSharesTimestamp != 0 && updateSharesTimestamp <= Date.now()) {
		ownerShare = pendingShares[0]
		keyBucketShare = pendingShares[1]
		stakedBucketShare = pendingShares[2]
		updateSharesTimestamp = 0;
	}

	// if (ownerLatestUnstakeRequestCompletionTime != 0 && ownerLatestUnstakeRequestCompletionTime <= Date.now()) {
	// 	ownerLatestUnstakeRequestCompletionTime = 0;
	// }

	let userStakedKeyIds: number[] = [];
	let userStakedEsXaiAmount = 0;
	let userClaimAmount = 0;
	let unstakeRequestkeyAmount = 0;
	let unstakeRequestesXaiAmount = 0;
	let maxAvailableStake = 0;
	let maxAvailableStakeWei = BigInt(0);
	let maxAvailableUnstake = 0;
	let maxAvailableUnstakeWei = BigInt(0);

	if (rawUserInfo && userWallet) {

		userStakedEsXaiAmount = Number(web3Instance.web3.utils.fromWei(rawUserInfo.userStakedEsXaiAmount.toString(), 'ether'));
		userClaimAmount = Number(web3Instance.web3.utils.fromWei(rawUserInfo.userClaimAmount.toString(), 'ether'));
		unstakeRequestkeyAmount = Number(rawUserInfo.unstakeRequestkeyAmount);
		unstakeRequestesXaiAmount = Number(web3Instance.web3.utils.fromWei(rawUserInfo.unstakeRequestesXaiAmount.toString(), 'ether'));
		maxAvailableStakeWei = BigInt(web3Instance.web3.utils.toWei((MAX_STAKE_PER_LICENSE * Number(baseInfo.keyCount)), "ether").toString()) - BigInt(baseInfo.totalStakedAmount.toString());
		if (maxAvailableStakeWei < 0) {
			maxAvailableStakeWei = BigInt(0);
		} else {
			const userEsXaiBalanceWei = await getEsXaiBalanceWei(web3Instance, userWallet);
			//Math min for bigint
			maxAvailableStakeWei = [userEsXaiBalanceWei, maxAvailableStakeWei].reduce((m, e) => e < m ? e : m);
			maxAvailableStake = Number(web3Instance.web3.utils.fromWei(maxAvailableStakeWei.toString(), 'ether'))
		}

		maxAvailableUnstakeWei = BigInt(rawUserInfo.userStakedEsXaiAmount.toString()) - BigInt(rawUserInfo.unstakeRequestesXaiAmount.toString());
		maxAvailableUnstake = Number(web3Instance.web3.utils.fromWei(maxAvailableUnstakeWei.toString(), 'ether'));
		userStakedKeyIds = rawUserInfo.userStakedKeyIds.map((i: BigInt) => Number(i))
	}

	return {
		address: baseInfo.poolAddress,
		owner: baseInfo.owner,
		keyBucketTracker: baseInfo.keyBucketTracker,
		esXaiBucketTracker: baseInfo.esXaiBucketTracker,
		keyCount: Number(baseInfo.keyCount),
		totalStakedAmount: Number(web3Instance.web3.utils.fromWei(baseInfo.totalStakedAmount.toString(), 'ether')),
		updateSharesTimestamp,
		ownerStakedKeys: Number(rawPoolInfo._ownerStakedKeys),
		ownerRequestedUnstakeKeyAmount: Number(rawPoolInfo._ownerRequestedUnstakeKeyAmount),
		// ownerLatestUnstakeRequestCompletionTime,
		ownerShare,
		keyBucketShare,
		stakedBucketShare,
		maxStakedAmount: Number(baseInfo.keyCount) * maxStakePerLicense,
		maxKeyCount,
		userStakedEsXaiAmount,
		userClaimAmount,
		unstakeRequestkeyAmount,
		unstakeRequestesXaiAmount,
		userStakedKeyIds,
		maxAvailableStake,
		maxAvailableUnstake,
		maxAvailableStakeWei,
		maxAvailableUnstakeWei,
		pendingShares,
		meta: {
			name: rawPoolInfo._name,
			description: rawPoolInfo._description,
			logo: rawPoolInfo._logo,
			website: rawPoolInfo._socials[0],
			discord: rawPoolInfo._socials[1],
			telegram: rawPoolInfo._socials[2],
			twitter: rawPoolInfo._socials[3],
			instagram: rawPoolInfo._socials[4],
			youtube: rawPoolInfo._socials[5],
			tiktok: rawPoolInfo._socials[6],
		},
	};
};

export type UnstakeRequest = {
	open: boolean;
	isKeyRequest: boolean;
	amount: number;
	amountWei: string;
	createdTime: number;
	lockTime: number;
	completeTime: number;
	index: number;	// index of redemption by user wallet address
};

export type OrderedUnstakeRequests = {
	claimable: UnstakeRequest[];
	open: UnstakeRequest[];
	closed: UnstakeRequest[];
};


export const updateRequestClaimed = (network: NetworkKey, walletAddress: `0x${string}`, poolAddress: string, requestIndex: number) => {
	const storageKey = "unstakeRequests" + network + walletAddress + poolAddress;
	const storage = localStorage.getItem(storageKey);
	const cachedUnstakes: UnstakeRequest[] = JSON.parse(storage || "[]");

	if (requestIndex >= cachedUnstakes.length) {
		throw new Error('Invalid requestIndex');
	}

	cachedUnstakes[requestIndex].open = false;
	cachedUnstakes[requestIndex].completeTime = Date.now();
	localStorage.setItem(storageKey, JSON.stringify(cachedUnstakes));
}

export const addUnstakeRequest = async (network: NetworkKey, walletAddress: string, poolAddress: string): Promise<void> => {
	const storageKey = "unstakeRequests" + network + walletAddress + poolAddress;
	const storage = localStorage.getItem(storageKey);
	const cachedUnstakes: UnstakeRequest[] = JSON.parse(storage || "[]");

	const web3Instance = getWeb3Instance(network);
	const poolContract = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddress);

	let res;
	while (!res || res.lockTime == 0) {
		try {
			res = await poolContract.methods.getUnstakeRequest(walletAddress, cachedUnstakes.length).call() as any; // TODO fix when ABI is updated
		} catch {
			await new Promise(resolve => setTimeout(resolve, 500));
		}
	}

	let amount = Boolean(res.isKeyRequest) ? Number(res.amount) : Number(web3Instance.web3.utils.fromWei(res.amount, "ether"));

	const createdTime = res.createdTime ? Number(res.createdTime) * 1000 : Number(res.lockTime) * 1000;

	const unstakeRequest: UnstakeRequest = {
		open: Boolean(res.open),
		isKeyRequest: Boolean(res.isKeyRequest),
		amount: amount,
		amountWei: res.amount.toString(),
		createdTime, // block.timestamp of creating the request
		lockTime: Number(res.lockTime) * 1000,		// contract works with seconds
		completeTime: Number(res.completeTime) * 1000,	// convert to milliseconds for convenient use with js APIs
		index: cachedUnstakes.length
	};

	cachedUnstakes.push(unstakeRequest);
	localStorage.setItem(storageKey, JSON.stringify(cachedUnstakes));
}

export const getUnstakeRequest = async (network: NetworkKey, walletAddress: string, poolAddress: string): Promise<OrderedUnstakeRequests> => {
	const storageKey = "unstakeRequests" + network + walletAddress + poolAddress;
	const storage = localStorage.getItem(storageKey);
	const cachedUnstakes: UnstakeRequest[] = JSON.parse(storage || "[]");

	const web3Instance = getWeb3Instance(network);
	const poolContract = new web3Instance.web3.eth.Contract(StakingPoolAbi, poolAddress);
	const numRequests = Number(await poolContract.methods.getUnstakeRequestCount(walletAddress).call());

	const numCachedUnstakes = cachedUnstakes.length;

	if (numRequests != numCachedUnstakes) {
		for (let i = numCachedUnstakes; i < numRequests; i++) {
			const res = await poolContract.methods.getUnstakeRequest(walletAddress, i).call() as any; // TODO fix when ABI is updated

			let amount = Boolean(res.isKeyRequest) ? Number(res.amount) : Number(web3Instance.web3.utils.fromWei(res.amount, "ether"));
			const createdTime = res.createdTime ? Number(res.createdTime) * 1000 : Number(res.lockTime) * 1000;

			const unstakeRequest: UnstakeRequest = {
				open: Boolean(res.open),
				isKeyRequest: Boolean(res.isKeyRequest),
				amount: amount,
				amountWei: res.amount.toString(),
				createdTime, // block.timestamp of creating the request
				lockTime: Number(res.lockTime) * 1000,		// contract works with seconds
				completeTime: Number(res.completeTime) * 1000,	// convert to milliseconds for convenient use with js APIs
				index: i
			};
			cachedUnstakes.push(unstakeRequest);
		}
	}

	let open = [], closed = [], claimable = [];
	for (let i = 0; i < cachedUnstakes.length; i++) {
		const unstake = cachedUnstakes[i];

		if (unstake.open) {

			if (i < numRequests) {
				//Check if claimed
				const res = await poolContract.methods.getUnstakeRequest(walletAddress, i).call();

				if (!res.open) {
					cachedUnstakes[i].open = res.open;
					cachedUnstakes[i].completeTime = Number(res.completeTime) * 1000;
				}
			}

			if (Date.now() >= unstake.lockTime) {
				claimable.push(unstake);
			} else {
				open.push(unstake);
			}

		} else {
			closed.push(unstake);
		}
	}

	localStorage.setItem(storageKey, JSON.stringify(cachedUnstakes));

	return {
		claimable,

		open: open.sort((a: UnstakeRequest, b: UnstakeRequest) => {
			return a.completeTime - b.completeTime;
		}),

		closed: closed.sort((a: UnstakeRequest, b: UnstakeRequest) => {
			return a.completeTime - b.completeTime;
		}),
	};
}

let TIER_THRESHOLDS: { nextTierRequirement: number, minValue: number, reward: string }[] = [];
export const getTierTresholds = async (network: NetworkKey) => {

	if (TIER_THRESHOLDS.length === 0) {
		const web3Instance = getWeb3Instance(network);
		const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);

		const tierData: [
			{ nextTierRequirement: number, minValue: number, reward: string },
			{ nextTierRequirement: number, minValue: number, reward: string },
			{ nextTierRequirement: number, minValue: number, reward: string },
			{ nextTierRequirement: number, minValue: number, reward: string },
			{ nextTierRequirement: number, minValue: number, reward: string }
		] = [
				{
					nextTierRequirement: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(0).call()), "ether")),
					minValue: 0,
					reward: "1x"
				},
				{
					nextTierRequirement: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(1).call()), "ether")),
					minValue: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(0).call()), "ether")),
					reward: (Number((await refereeContract.methods.stakeAmountBoostFactors(0).call())) / 100) + "x"
				},
				{
					nextTierRequirement: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(2).call()), "ether")),
					minValue: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(1).call()), "ether")),
					reward: (Number((await refereeContract.methods.stakeAmountBoostFactors(1).call())) / 100) + "x"
				},
				{
					nextTierRequirement: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(3).call()), "ether")),
					minValue: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(2).call()), "ether")),
					reward: (Number((await refereeContract.methods.stakeAmountBoostFactors(2).call())) / 100) + "x"
				},
				{
					nextTierRequirement: 0,
					minValue: Number(web3Instance.web3.utils.fromWei((await refereeContract.methods.stakeAmountTierThresholds(3).call()), "ether")),
					reward: (Number((await refereeContract.methods.stakeAmountBoostFactors(3).call())) / 100) + "x"
				}
			]
		TIER_THRESHOLDS = tierData;
	};

	return TIER_THRESHOLDS;
};

export const getUnstakeTimes = async (network: NetworkKey) => {

	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	const unstakeKeysDelayPeriod = Number(await factoryContract.methods.unstakeKeysDelayPeriod().call()) * 1000;
	const unstakeGenesisKeyDelayPeriod = Number(await factoryContract.methods.unstakeGenesisKeyDelayPeriod().call()) * 1000;
	const unstakeEsXaiDelayPeriod = Number(await factoryContract.methods.unstakeEsXaiDelayPeriod().call()) * 1000;

	const unstakePeriods = {
		unstakeKeysDelayPeriod,
		unstakeGenesisKeyDelayPeriod,
		unstakeEsXaiDelayPeriod
	};

	return unstakePeriods;
};

export const getRewardBreakdownUpdateDelay = async (network: NetworkKey) => {

	const web3Instance = getWeb3Instance(network);
	const factoryContract = new web3Instance.web3.eth.Contract(PoolFactoryAbi, web3Instance.poolFactoryAddress);
	const unstakeKeysDelayPeriod = Number(await factoryContract.methods.updateRewardBreakdownDelayPeriod().call()) * 1000;

	return unstakeKeysDelayPeriod;
};