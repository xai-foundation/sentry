import { GraphQLClient, gql } from "graphql-request";
import { config } from "../config.js";
import { PoolInfo } from "@sentry/sentry-subgraph-client";

type PoolRewardRates = {
  poolAddress: string;
  totalEsXaiClaimed: number;
  averageDailyEsXaiReward: number;
  averageDailyKeyReward: number;
}

const AVERAGE_WINDOW_DAYS = 7n;
const QUERY_CHALLENGE_COUNT = 24 * Number(AVERAGE_WINDOW_DAYS);

/**
 * Get the calculated average daily rewards per staked unit for staking pools
 * 
 * @param poolAddresses - The filter for the pool address (leave empty to get for all pools)
 * @returns {PoolRewardRates[]} List of pool reward rate objects with the pool address and average daily reward rates for esXAI and keys per staked unit 
 * (averageDailyRewardPerEsXai = 0.1 means for 1 staked esXAI you will get 0.1 esXAI per day).
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
  const startTimestamp = Math.floor((Date.now() - unixAverageWindowPlus5Mins) / 1000);

  const query = gql`
    query PoolInfos {
      poolInfos(first: 1000, orderBy: totalStakedEsXaiAmount, orderDirection: desc${queryWhere}) {
        poolChallenges(first: ${QUERY_CHALLENGE_COUNT}, where: {challenge_: {createdTimestamp_gt: ${startTimestamp}}}) {
          totalClaimedEsXaiAmount
        }
        address
        keyBucketShare
        stakedBucketShare
        totalStakedEsXaiAmount
        totalStakedKeyAmount
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

    let totalEsXaiRewardsWei = 0n;
    let totalKeyRewardsWei = 0n;
    let totalRewards = 0;

    // TODO this needs to be refactored for efficiency !
    // We needed to quickly remove the average calculation by staked amounts at the challenge
    // Without having to average out the code bellow should only sum up the total rewards, then divide by bucket shares and staked amount once.
    // Because of urgency and lack of time for testing we now only updated to use the pool's current stake amounts and still do the same calculation in the loop
    poolInfo.poolChallenges.forEach(challenge => {
      const stakedEsXaiAmountWei = BigInt(poolInfo.totalStakedEsXaiAmount);
      const stakedKeyAmount = BigInt(poolInfo.totalStakedKeyAmount);
      const totalRewardsWei = BigInt(challenge.totalClaimedEsXaiAmount);
      totalRewards = Number(totalRewardsWei / BigInt(10**18)) 

      // ### esXAI ###
      // divide by 1,000,000 to transform bucketShare to percent
      const esXaiBucketClaimWei = (BigInt(challenge.totalClaimedEsXaiAmount) * stakedBucketShare) / 1_000_000n;
      // scale by 10**18 first and then divide to not lose information
      // if no esXAI staked default to 1 wei because the first esXAI staked would accumulate all rewards
      const rewardPerStakedEsXaiWei = (esXaiBucketClaimWei * BigInt(10**18)) / (stakedEsXaiAmountWei || BigInt(10**18));

      totalEsXaiRewardsWei += rewardPerStakedEsXaiWei;

      // ### keys ###
      // divide by 1,000,000 to transform bucketShare to percent
      const keyBucketClaimWei = (BigInt(challenge.totalClaimedEsXaiAmount) * keyBucketShare) / 1_000_000n;
      // if no keys staked default to 1 because the first key staked would accumulate all rewards
      const rewardPerStakedKeyWei = keyBucketClaimWei / (stakedKeyAmount || 1n);

      totalKeyRewardsWei += rewardPerStakedKeyWei;
    });

    // average sum over the desired number of days
    const averageDailyEsXaiRewardWei = totalEsXaiRewardsWei / AVERAGE_WINDOW_DAYS;
    const averageDailyKeyRewardWei = totalKeyRewardsWei / AVERAGE_WINDOW_DAYS;

    // convert reward rates to number and convert form wei to esXAI amount for storage in db
    const averageDailyEsXaiReward = Number(averageDailyEsXaiRewardWei) / 10**18;
    const averageDailyKeyReward = Number(averageDailyKeyRewardWei) / 10**18;

    

    poolRewardRates.push({ poolAddress: poolInfo.address, averageDailyEsXaiReward, averageDailyKeyReward, totalEsXaiClaimed: totalRewards});

    // every 10 pools wait 100 ms to unblock thread
    // TODO figure out if we can open multiple threads for this calculation - this function is not used in the operator, only in the CLI
    if (index % 10 == 0) {
      await new Promise((resolve) => { setTimeout(resolve, 100) });
    }
  }

  return poolRewardRates;
}
