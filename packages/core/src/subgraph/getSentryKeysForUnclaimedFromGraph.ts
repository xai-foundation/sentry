import { SentryKey } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * Load SentryKeys from the graph for up to a specific keyId for processing unclaimed submissions
 * 
 * @param owners - The filter for the owner field
 * @param stakingPools - The filter for the assigned pool field
 * @param maxKeyId - The highest key Id we will select from the graph
 * @returns List of sentry key objects with metadata.
 */
export async function getSentryKeysForUnclaimedFromGraph(
  owners: string[],
  stakingPools: string[],
  latestChallengeNumber: bigint,
  maxKeyId: number
): Promise<SentryKey[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  let filter = ``
  if (owners.length && stakingPools.length) {

    filter = gql`
      and: [
        {or: [
          {owner_in: [${owners.map(o => `"${o.toLowerCase()}"`).join(",")}]}, 
          {assignedPool_in: [${stakingPools.map(o => `"${o.toLowerCase()}"`).join(",")}]}
        ]},
        { keyId_lte: ${maxKeyId} }
      ]
    `
  } else {
    const filters: string[] = [];
    if (owners.length) {
      filters.push(`owner_in: [${owners.map(o => `"${o.toLowerCase()}"`).join(",")}]`)
    }
    if (stakingPools.length) {
      filters.push(`assignedPool_in: [${stakingPools.map(o => `"${o.toLowerCase()}"`).join(",")}]`)
    }
    filters.push(`keyId_lte: ${maxKeyId}`);
    filter = filters.join(",");
  }



  const query = gql`
      query SentryKeysQuery {
        sentryKeys(first: 10000, orderBy: keyId, orderDirection: asc, where: {${filter}} ) {
          assignedPool
          id
          keyId
          mintTimeStamp
          owner
          sentryWallet {
            isKYCApproved
            v1EsXaiStakeAmount
            keyCount
            stakedKeyCount
          }
          submissions(first: 10000, orderBy: challengeNumber, orderDirection: desc, where: {eligibleForPayout: true, claimed: false, challengeNumber_gte: ${latestChallengeNumber.toString()}}) { 
            challengeNumber
            nodeLicenseId
            claimAmount 
            claimed 
            eligibleForPayout
          }
        }
      }
    `

  const result = await client.request(query) as any;
  return result.sentryKeys;
}