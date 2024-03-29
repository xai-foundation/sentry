import { FilterQuery, ObjectId } from "mongoose";
import IPool from "../types/IPool";
import { CreatePool, PoolInfo, UpdateablePoolProps } from "@/types/Pool";
import PoolModel from "../models/pool.schema";
import { executeQuery } from "./Database.service";
import { getTierByIndex } from "@/app/components/staking/utils";
import { NetworkKey } from "@/services/web3.service";

export type PoolFilter = IPool | { _id: ObjectId | string } | { poolAddress: string };

export async function createPool(createPoolInput: CreatePool): Promise<ObjectId> {

	//TODO create new pool
	const foundPoolAddress = await executeQuery(PoolModel.exists({ poolAddress: createPoolInput.poolAddress }), true) as IPool | null;
	if (foundPoolAddress) {
		return foundPoolAddress._id;
	}

	/**
	 * @dev Assumes that pool has been created on blockchain and gets added to Db after blockchain transaction was successful
	 */
	try {
		const newPool = new PoolModel({
			poolAddress: createPoolInput.poolAddress,
			poolIndex: createPoolInput.poolIndex,
			owner: createPoolInput.owner,
			name: createPoolInput.name.trim(),
			description: createPoolInput.description.trim(),
			logo: createPoolInput.logo,
			keyBucketTracker: createPoolInput.keyBucketTracker,
			esXaiBucketTracker: createPoolInput.esXaiBucketTracker,
			keyCount: createPoolInput.keyCount,
			totalStakedAmount: createPoolInput.totalStakedAmount,
			maxStakedAmount: createPoolInput.maxStakedAmount,
			tierIndex: createPoolInput.tierIndex || 0,
			ownerShare: createPoolInput.ownerShare,
			keyBucketShare: createPoolInput.keyBucketShare,
			stakedBucketShare: createPoolInput.stakedBucketShare,
			updateSharesTimestamp: createPoolInput.updateSharesTimestamp,
			pendingShares: createPoolInput.pendingShares,
			socials: createPoolInput.socials,
			visibility: 'active',
			network: createPoolInput.network,
		});

		await newPool.save();
		return newPool._id;
	} catch (error) {
		throw new Error(`ERROR @createPool: ${error}`);
	}
};


/**
 * UPDATE POOL
 */

type UpdateableProps = "name" | "description" | "logo" | "keyCount" | "totalStakedAmount" | "maxStakedAmount" | "tierIndex" | "ownerShare" | "keyBucketShare" | "stakedBucketShare" | "updateSharesTimestamp" | "pendingShares" | "socials" | "visibility";
type UpdatablePoolProperties = { [key in UpdateableProps]?: string | string[] | number | number[] };
const updateableProperties: UpdateableProps[] = ["name", "description", "logo", "keyCount", "totalStakedAmount", "maxStakedAmount", "tierIndex", "ownerShare", "keyBucketShare", "stakedBucketShare", "updateSharesTimestamp", "pendingShares", "socials", "visibility"];

export async function updatePool(filter: FilterQuery<IPool>, properties: UpdateablePoolProps) {

	let updated: IPool | null = null;

	try {
		const propertiesToUpdate: { $set: UpdatablePoolProperties } = {
			'$set': {}
		}

		updateableProperties.forEach(updateableProperty => {
			if (typeof properties[updateableProperty] !== undefined) {
				propertiesToUpdate['$set'][updateableProperty] = properties[updateableProperty];
			};
		});

		updated = await executeQuery(PoolModel.findOneAndUpdate(filter, propertiesToUpdate).lean()) as IPool | null;
	} catch (error) {
		throw new Error(`ERROR @updatePool: ${error}`);
	};

	if (!updated) {
		throw "Update invalid";
	};

	return updated;
}

export async function findPool(filter: FilterQuery<IPool>): Promise<PoolInfo | null> {

	try {
		const pool = await executeQuery(PoolModel.findOne(filter).lean()) as IPool;
		if (!pool) {
			return null;
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

export type PagedPools = { count: number, poolInfos: PoolInfo[] }

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
	const filter: FilterQuery<IPool> = {
		network
	};
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
			filter.$and = [{ $expr: filter.$expr }, { $expr: { $gt: [600, "$keyCount"] } }];
			delete filter.$expr;
		} else {
			filter.$expr = { $gt: [600, "$keyCount"] }
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

		return {
			count: poolCount,
			poolInfos: filteredPools.map((p) => mapPool(p)),
		};
	} catch (error) {
		throw new Error(`ERROR @findPools: ${error}`);
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
		maxKeyCount: 600,
		userStakedEsXaiAmount: 0,
		userClaimAmount: 0,
		userStakedKeyIds: pool.userStakedKeyIds,
		tier: getTierByIndex(pool.tierIndex),
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
		pendingShares: pool.pendingShares || [0, 0, 0],
	}
};