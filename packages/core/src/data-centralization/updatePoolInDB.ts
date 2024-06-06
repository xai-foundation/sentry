import mongoose from 'mongoose';
import { formatEther } from 'ethers';
import { getTierIndexByStakedAmount } from "./getTierIndexByStakedAmount.js";
import { IPool, PoolSchema } from './types.js';
import { config } from "../config.js";
import { getPoolInfosFromGraph } from '../subgraph/getPoolInfosFromGraph.js';
import { GraphQLClient } from 'graphql-request'
import { getPoolInfo } from './getPoolInfo.js';

const POOL_SHARES_BASE = 10_000;

const graphClient = new GraphQLClient(config.subgraphEndpoint);

/**
 * Loads the current Pool Data from the blockchain and syncs the database
 * @param poolAddress - The pool address to sync.
 * @param eventName - The poolFactory event that triggered the update.
 */
export async function updatePoolInDB(
    poolAddress: string,
    eventName: string
): Promise<void> {

    const PoolModel = mongoose.models.Pool || mongoose.model<IPool>('Pool', PoolSchema);

    //Timeout to wait for subgraph sync to updates for pools
    await new Promise(resolve => setTimeout(resolve, 2000));
    //Load poolInfo from subgraph
    const { pools, refereeConfig } = await getPoolInfosFromGraph([poolAddress], true, true);
    if (!pools.length || !pools[0]) {
        throw new Error(`Pool ${poolAddress} could not be found on subgraph - event: ${eventName}`);
    }
    if (!refereeConfig) {
        throw new Error(`RefereeConfig not found. Pool: ${poolAddress}, event: ${eventName}`);
    }

    const poolInfo = pools[0];

    const baseInfo = {
        poolAddress: poolInfo.address,
        owner: poolInfo.owner,
        keyCount: poolInfo.totalStakedKeyAmount,
        totalStakedAmount: poolInfo.totalStakedEsXaiAmount,
        updateSharesTimestamp: poolInfo.updateSharesTimestamp,
        ownerShare: poolInfo.ownerShare,
        keyBucketShare: poolInfo.keyBucketShare,
        stakedBucketShare: poolInfo.stakedBucketShare
    };

    const maxStakedAmount = Number(formatEther((BigInt(baseInfo.keyCount) * BigInt(refereeConfig.maxStakeAmountPerLicense)).toString()))
    const amountForTier = Math.min(Number(formatEther(baseInfo.totalStakedAmount.toString())), maxStakedAmount);
    const tierIndex = getTierIndexByStakedAmount(
        amountForTier,
        refereeConfig.stakeAmountTierThresholds.map(s => Number(formatEther(s.toString())))
    );

    const pendingShares: number[] = poolInfo.pendingShares.map(p => Number(p) / POOL_SHARES_BASE);

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

    let updatePool: any = {
        poolAddress: poolAddress,
        owner: baseInfo.owner,
        name: poolInfo.metadata ? poolInfo.metadata[0].trim() : "",
        description: poolInfo.metadata ? poolInfo.metadata[1].trim() : "",
        logo: poolInfo.metadata ? poolInfo.metadata[2].trim() : "",
        keyCount: Number(baseInfo.keyCount),
        totalStakedAmount: Number(formatEther(baseInfo.totalStakedAmount.toString())),
        maxStakedAmount,
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

    if (eventName === "PoolCreated") {
        const blockPoolInfo = await getPoolInfo(poolAddress);
        updatePool.keyBucketTracker = blockPoolInfo.baseInfo.keyBucketTracker;
        updatePool.esXaiBucketTracker = blockPoolInfo.baseInfo.esXaiBucketTracker;
    }

    //Write poolInfo to database
    await PoolModel.findOneAndUpdate(
        { poolAddress },
        updatePool,
        { upsert: true, setDefaultsOnInsert: true }
    );
}
