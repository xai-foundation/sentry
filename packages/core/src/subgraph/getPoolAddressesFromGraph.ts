import { PoolInfo, RefereeConfig } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * 
 * @returns List of pool addresses
 */
export async function getPoolAddressesFromGraph(): Promise<string[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);
  const query = gql`
    query PoolInfos {
      poolInfos(first: 1000) {
        address
      }
    }
  `
  const result = await client.request(query) as any;

  return (result.poolInfos as PoolInfo[]).map(p => p.address);
}