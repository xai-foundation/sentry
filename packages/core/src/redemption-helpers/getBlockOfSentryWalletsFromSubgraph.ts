import { GraphQLClient, gql } from 'graphql-request';
import { config } from '../index.js';
import { SentryWallet } from '@sentry/sentry-subgraph-client';


/**
 * Fetches a block of sentry wallets from the subgraph, including their addresses and redemption indices.
 *
 * @param {number} maxQty - The maximum number of sentry wallets to fetch.
 * @param {number} offset - The number of sentry wallets to skip in the query.
 * @returns {Promise<SentryWallet[]>} A promise that resolves to an array of sentry wallet objects, each containing an address and an array of redemptions.
 */
export async function getBlockOfSentryWalletsFromSubgraph(maxQty: number, offset: number) {
    const client = new GraphQLClient(config.subgraphEndpoint);
    const query = gql`
        query SentryWallets($maxQty: Int, $offset: Int) {
            sentryWallets(first: $maxQty, skip: $offset) {
                address
                redemptions(where: { voucherIssued: false, completed: false }) {
                    id
                    index
                }
            }
        }
    `;

    // Pass the variables to the request
    const variables = {
        maxQty,
        offset
    };

    const result = await client.request(query, variables) as { sentryWallets: SentryWallet[] };
    return result.sentryWallets;
}
