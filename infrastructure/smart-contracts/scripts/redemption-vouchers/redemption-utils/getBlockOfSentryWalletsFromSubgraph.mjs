import { GraphQLClient, gql } from 'graphql-request';
import { config } from "@sentry/core";

/**
 * Fetches a block of operator addresses from the subgraph.
 *
 * @param {number} maxQty - The maximum number of sentryWallets to retrieve.
 * @param {number} offset - The number of sentryWallets to skip for pagination.
 * @returns {Promise<any>} - A promise that resolves to the data fetched from the subgraph.
 */
export async function getBlockOfSentryWalletsFromSubgraph(maxQty, offset) {
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

    const result = await client.request(query, variables);
    return result.sentryWallets;
}
