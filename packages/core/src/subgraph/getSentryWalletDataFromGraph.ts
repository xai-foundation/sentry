import { SentryWallet } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * 
 * @param wallets - List of wallets to find on the graph
 * @returns The SentryWallets entities from the graph
 */
export async function getSentryWalletDataFromGraph(
  wallets: string[]
): Promise<SentryWallet[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  const query = gql`
    query OperatorAddresses {
      sentryWallets(first: 1000, where: {address_in: [${wallets.map(o => `"${o.toLowerCase()}"`).join(",")}]}) {
        isKYCApproved
        address
        v1EsXaiStakeAmount
        stakedKeyCount
        keyCount
        totalAccruedAssertionRewards
      }
    }
  `

  const result = await client.request(query) as any;

  return result.sentryWallets;
}