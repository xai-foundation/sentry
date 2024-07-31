import { SentryWallet } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * Fetches all Sentry Wallets in batches of 10,000
 * @param whitelist - Optional array of whitelisted addresses
 * @returns Array of SentryWallet objects
 */
export async function getAllSentryWallets(): Promise<SentryWallet[]> {
  const client = new GraphQLClient(config.subgraphEndpoint);
  const batchSize = 10000;
  let allWallets: SentryWallet[] = [];
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const query = gql`
      query OperatorAddresses($offset: Int!) {
        sentryWallets(first: ${batchSize}, skip: $offset) {
          address
          v1EsXaiStakeAmount
          stakedKeyCount
          keyCount
          esXaiStakeAmount
        }
      }
    `;

    const result = await client.request(query, { offset }) as { sentryWallets: SentryWallet[] };

    allWallets = allWallets.concat(result.sentryWallets);
    
    hasMore = result.sentryWallets.length === batchSize;
    offset += batchSize;
  }


  return allWallets;
}