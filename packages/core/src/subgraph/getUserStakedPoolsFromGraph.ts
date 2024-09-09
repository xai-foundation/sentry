import { PoolStake, SentryKey } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";
import { BulkOwnerOrPool } from "../operator/operatorRuntime.js";


/**
 * Find all pools specific wallets have at least one key staked in
 * @param wallets - The filter for the wallets we want to get pools for
 * @param excludePools - Filter for pools to exclude if we already loaded them
 * @param includeSubmissions - If the submissions should be included
 * @param submissionsFilter - The filter for the submissions if submissions should be included
 * @returns List of sentry pool infos
 */
export async function getUserStakedPoolsFromGraph(
  wallets: string[],
  excludePools: string[],
  includeSubmissions: boolean,
  submissionsFilter: { winningKeyCount?: boolean, claimed?: boolean, latestChallengeNumber?: bigint }
): Promise<BulkOwnerOrPool[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  let submissionQuery = ``;
  if (includeSubmissions) {

    let submissionQueryFilter: string[] = [];
    const { winningKeyCount, claimed, latestChallengeNumber } = submissionsFilter;
    if (winningKeyCount != undefined) {
      submissionQueryFilter.push(`winningKeyCount_gt: 0`)
    }
    if (claimed != undefined) {
      submissionQueryFilter.push(`claimed: ${claimed}`)
    }
    if (latestChallengeNumber != undefined) {
      submissionQueryFilter.push(`challengeId_gte: ${latestChallengeNumber.toString()}`)
    }

    submissionQuery = gql`
        submissions(first: 10000, orderBy: challengeId, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) { 
          challengeId
          winningKeyCount
          claimed 
        }
      `
  }

  const query = gql`
    query PoolStakeQuery {
      poolStakes(
        where: {
            keyStakeAmount_gt: 0,
            wallet_: {address_in: [${wallets.map(w => `"${w.toLowerCase()}"`).join(",")}]}
            ${excludePools.length ? `pool_: {address_not_in: [${excludePools.map(p => `"${p.toLowerCase()}"`).join(",")}]}` : ""}
          }
      ) {
        esXaiStakeAmount
        keyStakeAmount
        pool {
          address
          metadata
          totalStakedKeyAmount
          totalStakedEsXaiAmount
          totalAccruedAssertionRewards
          ${submissionQuery}
        }
      }
    }
  `
  const result = await client.request(query) as { poolStakes: PoolStake[] };

  return result.poolStakes.map(s => ({
    address: s.pool.address,
    name: s.pool.metadata[0],
    logoUri: s.pool.metadata[2],
    isPool: true,
    keyCount: s.pool.totalStakedKeyAmount,
    bulkSubmissions: s.pool.submissions,
    stakedEsXaiAmount: s.pool.totalStakedEsXaiAmount
  }));
}