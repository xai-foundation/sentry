import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * This function fetches the reward rate for a specific pool from the graph.
 * @param poolAddress The address of the pool for which the reward rate is to be fetched.
 * @returns The daily average rewards/key for a specific pool for the last 7 days from the graph.
 */
export async function getPoolRewardRate(poolAddress:string): Promise<number> {

    const client = new GraphQLClient(config.subgraphEndpoint);

    const now = Date.now(); // current time in milliseconds
    const sevenDaysPlus5Mins = 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000;
    const startTimestamp = Math.floor((now - sevenDaysPlus5Mins)/1000); // 7 days ago in seconds

    const query = gql`
    query GetPoolRewardRateQuery {
        poolChallenges(
            orderBy: id,
            orderDirection: desc,
            where: {
                pool: {address: ${poolAddress}}, 
                challenge:{assertionTimestamp_gt: ${startTimestamp}}
            }
            ) {
                pool {
                    address
                    keyBucketShare
                    totalStakedKeyAmount
                    ownerStakedKeys
                }
                totalClaimedEsXaiAmount
            }
        }
    `
    const result = await client.request(query) as any;

  // 1. Loop through the pool challenges and sum the total of all claimed rewards
    const totalClaimedRewards = calculateTotalClaimedRewards(result.poolChallenges);

  // 2. Determine the daily average reward rate by dividing the total rewards by the number of days(7)
    const dailyAverageRewards = totalClaimedRewards/7;

  // 3. Extract the keyBucketShare from the PoolInfo
    const keyBucketSharePercentage = result.poolChallenges[0].keyBucketShare/100;

  // 4. Calculate the Daily Rewards allocated to Key Stakers
    const dailyRewardsAllocatedToKeyStakers = dailyAverageRewards * keyBucketSharePercentage;

  // 5. Extract the total number of keys staked in the pool 
    const totalKeysStaked = result.poolChallenges[0].totalStakedKeyAmount + result.poolChallenges[0].ownerStakedKeys;

  // 6. Calculate the daily rewards/key
    const dailyRewardsPerKey = dailyRewardsAllocatedToKeyStakers/totalKeysStaked;

    return dailyRewardsPerKey;
}

const calculateTotalClaimedRewards = (poolChallenges: any): number => {
    let totalClaimedRewards = 0;
    for (const poolChallenge of poolChallenges) {
        totalClaimedRewards += poolChallenge.totalClaimedEsXaiAmount;
    }
    return totalClaimedRewards;
};