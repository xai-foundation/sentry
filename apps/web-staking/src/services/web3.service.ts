import Web3, { Contract, EventLog } from "web3";
import { RefereeAbi } from "../assets/abi/RefereeAbi";
import { XaiAbi } from "@/assets/abi/XaiAbi";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import { NodeLicenseAbi } from "@/assets/abi/NodeLicenseAbi";

export type Web3Instance = {
	name: string,
	web3: Web3, //TODOD type ; TODO will this still work with ethers ?
	rpcUrl: string,
	chainId: number,
	refereeAddress: string,
	xaiAddress: string,
	esXaiAddress: string,
	nodeLicenseAddress: string,
	explorer: string
}

export const networkKeys = ["arbitrum", "arbitrumSepolia"] as const;
export type NetworkKey = typeof networkKeys[number];

export const MAINNET_ID = 42161;
export const TESTNET_ID = 421614;

export const ACTIVE_NETWORK_IDS = process.env.NEXT_PUBLIC_APP_ENV === "development" ? [MAINNET_ID, TESTNET_ID] : [MAINNET_ID];

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
		explorer: 'https://arbiscan.io/'
	},
	'arbitrumSepolia': {
		name: 'Arbitrum Sepolia',
		// web3: new Web3('https://sepolia-rollup.arbitrum.io/rpc'),
		// rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
		web3: new Web3('https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B'),
		rpcUrl: 'https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B',
		chainId: 421614,
		refereeAddress: "0x41Bdf5c462e79Cef056B12B801Fd854c13e2BEE6",
		xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
		esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
		nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2",
		explorer: 'https://sepolia.arbiscan.io/'
	}
} as const;

const redemptionFactors = [25, 62.5, 100] as const;
export type RedemptionFactor = typeof redemptionFactors[number];
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
	"Something went wrong";

export const mapWeb3Error = (error: any): MappedWeb3Error => {
	error = error.toString();
	if (error.includes("Staking not enabled")) {
		// feature is disabled on contract-side
		return "Staking not enabled";;
	} else if (error.includes("Redemption is currently inactive")) {
		// feature is disabled on contract-side
		return "Redemption is currently inactive";;
	} else if (error.includes("Insufficient funds")) {
		// user does not have enough coin to pay for transaction
		return "Insufficient funds";
	} else if (error.includes("User rejected the request")) {
		// user clicked 'Reject' in wallet provider
		return "User rejected the request";
	} else if (error.includes("Maximum staking amount exceeded")) {
		// user clicked 'Confirm' in stake 
		return "Maximum staking amount exceeded";
	} else {
		// unknown error
		console.error("Blockchain transaction failed with error", error);
		return "Something went wrong";
	}
}

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

export const isZeroAddress = (address: string) => {
	return parseInt(address, 16) === 0;
}

export const getXaiBalance = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const xaiContract = new web3Instance.web3.eth.Contract(XaiAbi, web3Instance.xaiAddress);
	const balance = await xaiContract.methods.balanceOf(walletAddress).call();
	return Number(web3Instance.web3.utils.fromWei(balance.toString(), 'ether'));
}

export const getEsXaiBalance = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const esXaiContract = new web3Instance.web3.eth.Contract(esXaiAbi, web3Instance.esXaiAddress);
	const balance = await esXaiContract.methods.balanceOf(walletAddress).call();
	return Number(web3Instance.web3.utils.fromWei(balance.toString(), 'ether'));
}

export const getStakedAmount = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
	try {
		const staked = await refereeContract.methods.stakedAmounts(walletAddress).call();
		return Number(web3Instance.web3.utils.fromWei(staked.toString(), 'ether'));
	} catch (error) {
		console.log("Error getting stakedAmount", error);
		return 0;
	}
}

export const getMaxStakedAmount = async (network: NetworkKey, walletAddress: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const refereeContract = new web3Instance.web3.eth.Contract(RefereeAbi, web3Instance.refereeAddress);
	const numNodeLicenses = await getNodeLicenses(network, walletAddress);
	try {
		const maxStake = await refereeContract.methods.getMaxStakeAmount(numNodeLicenses).call();
		const stakedAmount = await refereeContract.methods.stakedAmounts(walletAddress).call();
		return Number(web3Instance.web3.utils.fromWei((maxStake as bigint) - (stakedAmount as bigint), 'ether'));
	} catch (error) {
		console.log("Error getting getMaxStakedAmount", error);
		return 0;
	}
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
			return a.endTime - b.endTime;
		}),
	};
}

export const getEsXaiAllowance = async (network: NetworkKey, owner: string): Promise<number> => {
	const web3Instance = getWeb3Instance(network);
	const esXaiContract = new web3Instance.web3.eth.Contract(esXaiAbi, web3Instance.esXaiAddress);
	const allowance = await esXaiContract.methods.allowance(owner, web3Instance.refereeAddress).call();
	return Number(web3Instance.web3.utils.fromWei(allowance.toString(), 'ether'));
}