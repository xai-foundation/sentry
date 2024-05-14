import { PoolInfo, RefereeConfig } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'

/**
 * 
 * @param poolAddresses - The filter for the pool address
 * @param extendPoolInfo - Will extend the query for all the pool info attributes
 * @param fetchRefereeConfig - Will add a query for the RefereeConfig
 * @returns List of sentry key objects with metadata.
 */
export async function getPoolInfosFromGraph(
  client: GraphQLClient,
  poolAddresses: string[],
  extendPoolInfo?: boolean,
  fetchRefereeConfig?: boolean
): Promise<{ pools: PoolInfo[], refereeConfig?: RefereeConfig }> {

  let extendedInfo = ""
  if (extendPoolInfo) {
    extendedInfo = `
      pendingShares
      ownerLatestUnstakeRequestCompletionTime
      ownerRequestedUnstakeKeyAmount
      ownerShare
      ownerStakedKeys
      socials
      stakedBucketShare
      updateSharesTimestamp
      metadata
      keyBucketShare
    `
  }

  let refereeConfigQuery = ""
  if (fetchRefereeConfig) {
    refereeConfigQuery = gql`
      refereeConfig(id: "RefereeConfig") {
        maxKeysPerPool
        maxStakeAmountPerLicense
        stakeAmountBoostFactors
        stakeAmountTierThresholds
        version
      }
    `
  }

  const query = gql`
    query PoolInfos {
      poolInfos(where: {address_in: [${poolAddresses.map(o => `"${o.toLowerCase()}"`).join(",")}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
        ${extendedInfo}
      }
      ${refereeConfigQuery}
    }
  `

  const result = await client.request(query) as any;

  return { pools: result.poolInfos, refereeConfig: result.refereeConfig };
}