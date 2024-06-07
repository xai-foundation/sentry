import { FilterQuery, ObjectId } from "mongoose";
import IPool from "../types/IPool";
import { PoolInfo } from "@/types/Pool";
import PoolModel from "../models/pool.schema";
import { executeQuery } from "./Database.service";
import { getMaxKeyCount, NetworkKey } from "@/services/web3.service";
import { IDocument } from "@/server/types/IModel";

export type PoolFilter = IPool | { _id: ObjectId | string } | { poolAddress: string };

export async function findPool(filter: FilterQuery<IPool>): Promise<PoolInfo> {

	try {
		const pool = await executeQuery(PoolModel.findOne(filter).lean()) as IPool;
		if (!pool) {
			throw new Error(`ERROR @findPool: No pool found`);
		};
		return mapPool(pool);
	} catch (error) {
		throw new Error(`ERROR @findPool: ${error}`);
	}
}

type Pagination = {
	limit: number,
	page: number,
	sort: Array<[string, 1 | -1]>,
	// direction: 0 | 1,
}

export type PagedPools = { count: number, poolInfos: PoolInfo[], totalPoolsInDB: number }

export const findPools = async ({
	pagination = {
		limit: 10,
		page: 1,
		sort: [['tierIndex', -1], ['name', 1]],
	},
	hideFullEsXai = false,
	hideFullKeys = false,
	searchName,
	owner,
	network
}: {
	pagination: Pagination;
	searchName?: string;
	owner?: string;
	hideFullEsXai?: boolean,
	hideFullKeys?: boolean,
	network: NetworkKey
}): Promise<PagedPools> => {

	const maxKeyCount = await getMaxKeyCount(network);

	const filter: FilterQuery<IPool> = {
		network
	};
	filter.visibility = { $ne: "banned" };
	if (searchName) {
		filter.name = { $regex: searchName, $options: "i" };
	}
	if (owner) {
		filter.owner = owner;
	}
	if (hideFullEsXai) {
		filter.$expr = { $gt: ["$maxStakedAmount", "$totalStakedAmount"] }
	}
	if (hideFullKeys) {
		if (filter.$expr) {
			//TODO what if maxKeyPerPool is updated ?
			filter.$and = [{ $expr: filter.$expr }, { $expr: { $gt: [maxKeyCount, "$keyCount"] } }];
			delete filter.$expr;
		} else {
			filter.$expr = { $gt: [maxKeyCount, "$keyCount"] };
		}
	}

	try {
		const filteredPools = (await executeQuery(
			PoolModel.find(filter)
				.limit(pagination.limit)
				.skip(pagination.limit * (pagination.page - 1))
				.sort(pagination.sort)
				.lean()
		)) as IPool[];

		const poolCount = (await executeQuery(
			PoolModel.find(filter).countDocuments()
		)) as number;

		const totalPoolsInDB = (await executeQuery(
            PoolModel.find().countDocuments()
        )) as number;

		return {
			count: poolCount,
			poolInfos: filteredPools.map((p) => mapPool(p)),
			totalPoolsInDB
		};
	} catch (error) {
		throw new Error(`ERROR @findPools: ${error}`);
	}
}

export interface INetworkData extends IDocument {
	networkTotalStakedKeys: number;
	networkTotalStakedEsXAI: number;
	networkPoolsCount: number;
}

export async function getNetworkData(network: NetworkKey): Promise<INetworkData> {
	try {
		const aggregatedData = await executeQuery(PoolModel.aggregate([
			{ $match: { network: network } },
			{
				$group: {
					_id: "null",
					networkTotalStakedKeys: { $sum: "$keyCount" },
					networkTotalStakedEsXAI: { $sum: "$totalStakedAmount" },
					networkPoolsCount: { $count: {} }
				}
			}
		])) as INetworkData[];
		
		return aggregatedData[0];

	} catch (error) {
		throw new Error(`ERROR @getNetworkData: ${error}`);
	}
}

export function mapPool(pool: IPool): PoolInfo {

	/**
	 * //TODO Helper functions to get data from Blockchain
	 *
	 * @dev DB Socials structure: [website: string, twitter: string, discord: string, telegram: string, instagram: string, tiktok: string, youtube: string]
	 */
	return {
		address: pool.poolAddress,
		owner: pool.owner,
		keyBucketTracker: pool.keyBucketTracker,
		esXaiBucketTracker: pool.esXaiBucketTracker,
		keyCount: pool.keyCount,
		totalStakedAmount: pool.totalStakedAmount,
		maxStakedAmount: pool.maxStakedAmount,
		ownerShare: pool.ownerShare,
		keyBucketShare: pool.keyBucketShare,
		stakedBucketShare: pool.stakedBucketShare,
		userStakedEsXaiAmount: 0,
		userClaimAmount: 0,
		userStakedKeyIds: pool.userStakedKeyIds,
		meta: {
			name: pool.name,
			description: pool.description,
			logo: pool.logo || "",
			website: pool.socials[0] || "",
			twitter: pool.socials[1] || "",
			discord: pool.socials[2] || "",
			telegram: pool.socials[3] || "",
			instagram: pool.socials[4] || "",
			tiktok: pool.socials[5] || "",
			youtube: pool.socials[6] || "",
		},
		updateSharesTimestamp: pool.updateSharesTimestamp || 0,
		ownerStakedKeys: pool.ownerStakedKeys,
		ownerRequestedUnstakeKeyAmount: pool.ownerRequestedUnstakeKeyAmount,
		ownerLatestUnstakeRequestCompletionTime: pool.ownerLatestUnstakeRequestCompletionTime,
		pendingShares: pool.pendingShares || [0, 0, 0],
		visibility: pool.visibility
	}
};

export async function isPoolBanned(poolAddress: string): Promise<boolean> {

	let isBannedPool = false;

	try {
		const pool = await executeQuery(PoolModel.findOne({ poolAddress: poolAddress }).select('visibility').lean()) as IPool;

		if (!pool) {
			throw "Pool not found";
		}
		isBannedPool = pool.visibility == "banned";
		
	} catch (error) {
		throw new Error(`ERROR @isPoolBanned: ${error}`);
	}

	return isBannedPool;
}