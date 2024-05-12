import { PoolInfo } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'

/**
 * 
 * @param poolAddresses - The filter for the pool address
 * @returns List of sentry key objects with metadata.
 */
export async function getPoolInfosFromGraph(
  client: GraphQLClient,
  poolAddresses: string[],
): Promise<PoolInfo[]> {

  const query = gql`
    query PoolInfos {
      poolInfos(where: {address_in: [${poolAddresses.map(o => `"${o.toLowerCase()}"`).join(",")}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
      }
    }
  `

  const result = await client.request(query) as any;
  return result.poolInfos;
}