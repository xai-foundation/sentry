import Web3, { Contract } from "web3";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import { getWeb3Instance, NetworkKey } from "./web3.service";
import { Web3Instance } from "./web3.service";


const REDEMPTION_BATCH_SIZE = 500;
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

export type RedemptionRequest = {
	amount: number;
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

export const getAllRedemptions = async (network: NetworkKey, walletAddress: string): Promise<OrderedRedemptions> => {
	const web3Instance = getWeb3Instance(network);
	let redemptionsFromChain: RedemptionRequest[] = await getAllUserRedemptionsFromChain(web3Instance, walletAddress);

	let open: RedemptionRequest[] = [], closed: RedemptionRequest[] = [], claimable: RedemptionRequest[] = [];

	for (let i = 0; i < redemptionsFromChain.length; i++) {
		const redemption = formatRedemptionRequestEntity(web3Instance, redemptionsFromChain[i], i);

		redemption.completed && closed.push(redemption);
		redemption.cancelled && closed.push(redemption);

		const elapsedSeconds = Date.now() - redemption.startTime;
		if (elapsedSeconds >= redemption.duration && !redemption.completed) {
			claimable.push(redemption);
		} else if(!redemption.completed) {
			redemption.endTime = redemption.startTime + redemption.duration;
			open.push(redemption);
		}
	}
	return {
		claimable: sortLists(claimable),
		open: sortLists(open),
		closed: sortLists(closed, 'desc')
	};
}

export const refreshRedemptions = async (network: NetworkKey, walletAddress: string, currentRedemptions: OrderedRedemptions): Promise<OrderedRedemptions> => {
	const web3Instance = getWeb3Instance(network);
	const openRedemptions = currentRedemptions.open;
	const claimableRedemptions = currentRedemptions.claimable;
	const mergedRedemptions = [...openRedemptions, ...claimableRedemptions];
	const previousTotal = currentRedemptions.closed.length + mergedRedemptions.length;
	const batchesToRefresh = extractIdsToBatches(mergedRedemptions);
	let newTotal = -1;

	let open: RedemptionRequest[] = [], claimable: RedemptionRequest[] = [];
	let closed: RedemptionRequest[] = currentRedemptions.closed;

	for (let i = 0; i < batchesToRefresh.length; i++) {
		const batch = batchesToRefresh[i];
		const { redemptions, totalRedemptions } = await callRefreshRedemptionsFunctionOnContract(web3Instance, walletAddress, batch);
		newTotal = totalRedemptions;

		for (let j = 0; j < redemptions.length; j++) {
			const index = batch[j];
			const redemption = formatRedemptionRequestEntity(web3Instance, redemptions[j], index);

			redemption.completed && closed.push(redemption);
			redemption.cancelled && closed.push(redemption);

			const elapsedSeconds = Date.now() - redemption.startTime;
			if (elapsedSeconds >= redemption.duration && !redemption.completed) {
				claimable.push(redemption);
			} else if(!redemption.completed)  {
				redemption.endTime = redemption.startTime + redemption.duration;
				open.push(redemption);
			}
		}
	}

	// If the total redemptions have increased, fetch the new redemptions
	if (newTotal > previousTotal) {
		let { redemptions: newRedemptions } = await callGetAllRedemptionsFunctionOnContract(web3Instance, walletAddress, REDEMPTION_BATCH_SIZE, previousTotal);
		for (let i = 0; i < newRedemptions.length; i++) {
			const redemption = formatRedemptionRequestEntity(web3Instance, newRedemptions[i], i);

			redemption.completed && closed.push(redemption);
			redemption.cancelled && closed.push(redemption);

			const elapsedSeconds = Date.now() - redemption.startTime;
			if (elapsedSeconds >= redemption.duration && !redemption.completed) {
				claimable.push(redemption);
			} else {
				redemption.endTime = redemption.startTime + redemption.duration;
				open.push(redemption);
			}
		}
	}
	return {
		claimable: sortLists(claimable),
		open: sortLists(open),
		closed: sortLists(closed, 'desc')
	};
};

async function getAllUserRedemptionsFromChain(web3Instance: Web3Instance, walletAddress: string): Promise<RedemptionRequest[]> {
	const allRedemptions: RedemptionRequest[] = [];

	let totalUserRedemptions: number = -1;
	let offset = 0;

	while (totalUserRedemptions < 0 || totalUserRedemptions > offset) {
		let { redemptions, totalRedemptions } = await callGetAllRedemptionsFunctionOnContract(web3Instance, walletAddress, REDEMPTION_BATCH_SIZE, offset);
		allRedemptions.push(...redemptions);
		offset += REDEMPTION_BATCH_SIZE;
		totalUserRedemptions = totalRedemptions;
	}
	return allRedemptions;
}

function extractIdsToBatches(redemptions: RedemptionRequest[]): number[][] {
	const batches: number[][] = [];
	if (redemptions.length > REDEMPTION_BATCH_SIZE) {
		const totalBatches = Math.ceil(redemptions.length / REDEMPTION_BATCH_SIZE);
		for (let i = 0; i < totalBatches; i++) {
			const start = i * REDEMPTION_BATCH_SIZE;
			const end = start + REDEMPTION_BATCH_SIZE;
			batches.push(redemptions.slice(start, end).map(r => r.index));
		}
		return batches;
	}

	const singleBatch = redemptions.map(r => r.index);
	batches.push(singleBatch);

	return batches;
}

async function callRefreshRedemptionsFunctionOnContract(web3Instance: Web3Instance, walletAddress: string, indices: number[]): Promise<{ redemptions: RedemptionRequest[], totalRedemptions: number }> {
	try {
		const esXaiContract = new web3Instance.web3.eth.Contract(esXaiAbi, web3Instance.esXaiAddress);
		const result = await esXaiContract.methods.refreshUserRedemptionsByIndex(walletAddress, indices).call() as unknown[];
		const redemptions = result[0] as unknown[] as RedemptionRequest[];
		const totalRedemptions = Number(result[1]);
		return { redemptions, totalRedemptions };
	} catch (error) {
		console.error("Error fetching refreshed redemptions from contract:", error);
		return { redemptions: [], totalRedemptions: 0 };
	}
}

async function callGetAllRedemptionsFunctionOnContract(web3Instance: Web3Instance, walletAddress: string, batchSize: number, offset: number): Promise<{ redemptions: RedemptionRequest[], totalRedemptions: number }> {
	try {
		const esXaiContract = new web3Instance.web3.eth.Contract(esXaiAbi, web3Instance.esXaiAddress);
		const result = await esXaiContract.methods.getRedemptionsByUser(walletAddress, batchSize, offset).call() as unknown[];
		const redemptions = result[0] as unknown[] as RedemptionRequest[];
		const totalRedemptions = Number(result[1]);
		return { redemptions, totalRedemptions };
	} catch (error) {
		console.error("Error fetching user redemptions from contract:", error);
		return { redemptions: [], totalRedemptions: 0 };
	}

}

function formatRedemptionRequestEntity(web3Instance: Web3Instance, redemptionRequest: RedemptionRequest, index: number): RedemptionRequest {
	return {
		receiveAmount: Number(web3Instance.web3.utils.fromWei(redemptionRequest.amount, "ether")) * getBurnFeeFromDuration(Number(redemptionRequest.duration)) / 100, //TODO calculate by duration
		duration: Number(redemptionRequest.duration) * 1000,		// contract works with seconds
		startTime: Number(redemptionRequest.startTime) * 1000,	// convert to milliseconds for convenient use with js APIs
		endTime: Number(redemptionRequest.endTime) * 1000,		// convert to milliseconds for convenient use with js APIs
		amount: Number(web3Instance.web3.utils.fromWei(redemptionRequest.amount, "ether")),
		completed: redemptionRequest.completed,
		cancelled: redemptionRequest.cancelled,
		index
	};
}

const sortLists = (list1: RedemptionRequest[], sortOrder: 'asc' | 'desc' = 'asc'): RedemptionRequest[] => {
    // Use a Map to remove duplicates based on the 'index' property
    const uniqueMap = new Map<number, RedemptionRequest>();
    list1.forEach(item => {
        if (!uniqueMap.has(item.index)) {
            uniqueMap.set(item.index, item);
        }
    });

    // Convert the Map values back to an array
    const combinedList = Array.from(uniqueMap.values());

    // Sort the combined list
    return combinedList.sort((a, b) => {
        return sortOrder === 'asc' ? a.endTime - b.endTime : b.endTime - a.endTime;
    });
};


