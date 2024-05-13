import mongoose from 'mongoose';
import { formatEther } from 'ethers';
import { getPoolInfo } from "./getPoolInfo.js";
import { getMaxStakeAmountPerLicense } from "./getMaxStakeAmountPerLicense.js";
import { getTierIndexByStakedAmount } from "./getTierIndexByStakedAmount.js";
import { IPool, PoolSchema } from './types.js';
import { config } from "../config.js";
import { getPoolInfosFromGraph } from '../subgraph/getPoolInfosFromGraph.js';
import { GraphQLClient } from 'graphql-request'

const POOL_SHARES_BASE = 10_000;

const graphClient = new GraphQLClient(config.subgraphEndpoint);

/**
 * Loads the current Pool Data from the blockchain and syncs the database
 * @param poolAddress - The pool address to sync.
 */
export async function updatePoolInDB(
    poolAddress: string
): Promise<void> {

    const PoolModel = mongoose.models.Pool || mongoose.model<IPool>('Pool', PoolSchema);

    //Load poolInfo from blockchain

    // const poolInfo = await getPoolInfo(poolAddress);
    const poolInfo = (await getPoolInfosFromGraph(graphClient, [poolAddress]))[0];
    const baseInfo = {
        poolAddress: poolInfo.address,
        owner: poolInfo.owner,
        keyBucketTracker: poolInfo.keyBucketTracker,
        esXaiBucketTracker: poolInfo.esXaiBucketTracker,
        keyCount: poolInfo.totalStakedKeyAmount,
        totalStakedAmount: poolInfo.totalStakedEsXaiAmount,
        updateSharesTimestamp: poolInfo.updateSharesTimestamp,
        ownerShare: poolInfo.ownerShare,
        keyBucketShare: poolInfo.keyBucketShare,
        stakedBucketShare: poolInfo.stakedBucketShare
    };

    const maxStakePerLicense = await getMaxStakeAmountPerLicense();
    const maxStakedAmount = Number(baseInfo.keyCount) * maxStakePerLicense;

    const amountForTier = Math.min(Number(formatEther(baseInfo.totalStakedAmount.toString())), maxStakedAmount);
    const tierIndex = await getTierIndexByStakedAmount(amountForTier);

    const pendingShares: number[] = poolInfo.pendingShares!.map(p => Number(p) / POOL_SHARES_BASE);

    let updateSharesTimestamp = Number(baseInfo.updateSharesTimestamp) * 1000;
    let ownerShare = Number(baseInfo.ownerShare) / POOL_SHARES_BASE;
    let keyBucketShare = Number(baseInfo.keyBucketShare) / POOL_SHARES_BASE;
    let stakedBucketShare = Number(baseInfo.stakedBucketShare) / POOL_SHARES_BASE;
    let ownerLatestUnstakeRequestCompletionTime = Number(poolInfo.ownerLatestUnstakeRequestCompletionTime) * 1000;

    if (updateSharesTimestamp != 0 && updateSharesTimestamp <= Date.now()) {
        ownerShare = pendingShares[0]
        keyBucketShare = pendingShares[1]
        stakedBucketShare = pendingShares[2]
        updateSharesTimestamp = 0;
    }

    const updatePool = {
        poolAddress: poolAddress,
        owner: baseInfo.owner,
        name: poolInfo.metadata ? poolInfo.metadata[0].trim() : "",
        description: poolInfo.metadata ? poolInfo.metadata[1].trim() : "",
        logo: poolInfo.metadata ? poolInfo.metadata[2].trim() : "",
        keyBucketTracker: baseInfo.keyBucketTracker,
        esXaiBucketTracker: baseInfo.esXaiBucketTracker,
        keyCount: Number(baseInfo.keyCount),
        totalStakedAmount: Number(formatEther(baseInfo.totalStakedAmount.toString())),
        maxStakedAmount: Number(baseInfo.keyCount) * maxStakePerLicense,
        tierIndex,
        ownerShare,
        keyBucketShare,
        stakedBucketShare,
        updateSharesTimestamp,
        pendingShares,
        socials: poolInfo.socials,
        network: config.defaultNetworkName,
        ownerStakedKeys: Number(poolInfo.ownerStakedKeys),
        ownerRequestedUnstakeKeyAmount: Number(poolInfo.ownerRequestedUnstakeKeyAmount),
        ownerLatestUnstakeRequestCompletionTime,
    }

    //Write poolInfo to database
    await PoolModel.findOneAndUpdate(
        { poolAddress },
        updatePool,
        { upsert: true, setDefaultsOnInsert: true }
    );
}
