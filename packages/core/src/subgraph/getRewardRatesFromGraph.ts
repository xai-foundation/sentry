import { GraphQLClient, gql } from "graphql-request";
import { config } from "../config.js";
import { PoolInfo } from "@sentry/sentry-subgraph-client";

type PoolRewardRates = {
  poolAddress: string;
  averageDailyEsXaiReward: number;
  averageDailyKeyReward: number;
}

const AVERAGE_WINDOW_DAYS = 7n;

/**
 * Get the calculated average daily rewards per staked unit for staking pools
 * 
 * @param poolAddresses - The filter for the pool address (leave empty to get for all pools)
 * @returns {PoolRewardRates[]} List of pool reward rate objects with the pool address and average daily reward rates for esXAI and keys per staked unit 
 * (averageDailyRewardPerEsXai = 0.1 means for 1 staked esXai you will get 0.1 esXai per day).
 */
export async function getRewardRatesFromGraph(
  poolAddresses: string[]
): Promise<PoolRewardRates[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  let queryWhere = "";
  if (poolAddresses.length !== 0) {
    queryWhere = `, where: {address_in: [${poolAddresses.map(o => `"${o.toLowerCase()}"`).join(",")}]}`;
  }

  const unixAverageWindowPlus5Mins = Number(AVERAGE_WINDOW_DAYS) * 24 * 60 * 60 * 1000 + 5 * 60 * 1000;
  const startTimestamp = Math.floor((Date.now() - unixAverageWindowPlus5Mins)/1000);

  const query = gql`
    query PoolInfos {
      poolInfos(first: 10000, orderBy: totalStakedEsXaiAmount, orderDirection: desc${queryWhere}) {
        poolChallenges(where: {challenge_: {assertionTimestamp_gt: ${startTimestamp}}}) {
          totalClaimedEsXaiAmount
          totalStakedEsXaiAmount
          totalStakedKeyAmount
        }
        address
        keyBucketShare
        stakedBucketShare
      }
    }
  `

  const result = await client.request(query) as any;
  const poolInfos: PoolInfo[] = result.poolInfos;

  const poolRewardRates: PoolRewardRates[] = [];

  for (let index = 0; index < poolInfos.length; index++) {

    const poolInfo: PoolInfo = result.poolInfos[index];

    const stakedBucketShare = BigInt(poolInfo.stakedBucketShare);
    const keyBucketShare = BigInt(poolInfo.keyBucketShare);

    let totalEsXaiRewards = 0n;
    let totalKeyRewards = 0n;

    poolInfo.poolChallenges.forEach(challenge => {
      const stakedEsXaiAmountWei = BigInt(challenge.totalStakedEsXaiAmount);
      const stakedKeyAmount = BigInt(challenge.totalStakedKeyAmount);

      // esXAI
      const esXaiBucketClaimWei = (BigInt(challenge.totalClaimedEsXaiAmount) * stakedBucketShare) / 1_000_000n;
      const rewardPerStakedEsXaiWei = esXaiBucketClaimWei / (stakedEsXaiAmountWei || 1n);

      totalEsXaiRewards += rewardPerStakedEsXaiWei;

      // keys
      const keyBucketClaimWei = (BigInt(challenge.totalClaimedEsXaiAmount) * keyBucketShare) / 1_000_000n;
      const rewardPerStakedKeyWei = keyBucketClaimWei / (stakedKeyAmount || 1n);

      totalKeyRewards += rewardPerStakedKeyWei;
    });

    const averageDailyRewardPerEsXai = totalEsXaiRewards / AVERAGE_WINDOW_DAYS;
    const averageDailyRewardPerKey = totalKeyRewards / AVERAGE_WINDOW_DAYS

    const averageDailyEsXaiReward = Number(averageDailyRewardPerEsXai);
    const averageDailyKeyReward = Number(averageDailyRewardPerKey);

    poolRewardRates.push({ poolAddress: poolInfo.address, averageDailyEsXaiReward, averageDailyKeyReward });

    // every 10 pools wait 100 ms to unblock thread
    // TODO figure out if we can open multiple threads for this calculation - this function is not used in the operator, only in the CLI
    if (index % 10 == 0) {
      await new Promise((resolve) => { setTimeout(resolve, 100) });
    }
  }

  return poolRewardRates;
}
