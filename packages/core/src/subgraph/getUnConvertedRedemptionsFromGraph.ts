import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";


export async function getUnConvertedRedemptionsFromGraph(
    maxQty: number, 
    redemptionsFilter: { closed?: boolean, cancelled?: boolean, voucher?: boolean }): Promise<number> {

    const client = new GraphQLClient(config.subgraphEndpoint);

    const now = Date.now(); // current time in milliseconds

    // Building dynamic filters for the query
    const redemptionFilters: string[] = [];
    if (redemptionsFilter.closed !== undefined) {
        redemptionFilters.push(`completed: ${redemptionsFilter.closed}`);
    }
    if (redemptionsFilter.cancelled !== undefined) {
        redemptionFilters.push(`cancelled: ${redemptionsFilter.cancelled}`);
    }
    if (redemptionsFilter.voucher !== undefined) {
        redemptionFilters.push(`voucherIssued: ${redemptionsFilter.voucher}`);
    }
    // Combine the filters into a single string
    const redemptionFilterString = redemptionFilters.length
        ? `where: { ${redemptionFilters.join(', ')} }`
        : '';

    // GraphQL query with dynamic filtering
    const query = gql`
    query GetUnConvertedRedemptions($maxQty: Int) {
        sentryWallets(first: $maxQty, where: { redemptions_: { ${redemptionFilters.join(', ')} } }) {
        id
        address
        isKYCApproved
        v1EsXaiStakeAmount
        esXaiStakeAmount
        keyCount
        stakedKeyCount

        redemptions(${redemptionFilterString}) {
            id
            index
            amount
            startTime
            endTime
            duration
            completed
            cancelled
            voucherIssued
        }
        }
    }
    `;

    const result = await client.request(query) as any;

    return result;
}