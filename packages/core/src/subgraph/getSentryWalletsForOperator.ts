import { PoolInfo, SentryWallet, RefereeConfig } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * 
 * @param operator - The public key of the wallet running the operator
 * @param whitelist - Optional array of whitelisted addresses
 * @returns The SentryWallet entity from the graph
 */
export async function getSentryWalletsForOperator(
  operator: string,
  whitelist?: string[]
): Promise<{ wallets: SentryWallet[], pools: PoolInfo[], refereeConfig: RefereeConfig }> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  // Get the timestamp for the last claimable duration (270 days in seconds)
  const claimableDuration = 270 * 24 * 60 * 60;
  const timestamp = Math.floor(Date.now() / 1000) - claimableDuration;

  const query = gql`
    query OperatorAddresses($timestamp: Int!, $operator: String!) {
      sentryWallets(first: 1000,
        where: {
          or: [
            {address: $operator}, 
            {approvedOperators_contains: [$operator]}
          ]
        }
      ) {
        isKYCApproved
        address
        v1EsXaiStakeAmount
        stakedKeyCount
        keyCount
      }
      poolInfos(first: 1000, where: {or: [{owner: $operator}, {delegateAddress: $operator}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
        metadata
        poolSubmissions: submissions(where: {createdTimestamp_gt: $timestamp}){
          id
          challengeId
          claimed
          winningKeyCount
        }
      }
      refereeConfig(id: "RefereeConfig") {
        maxKeysPerPool
        maxStakeAmountPerLicense
        stakeAmountBoostFactors
        stakeAmountTierThresholds
        version
      }
      poolStakes(first:1000, where: {
        wallet_: {address: $operator}
      }){
        id
        pool{
          address
          poolSubmissions: submissions(where: {createdTimestamp_gt: $timestamp}){
            id
            challengeId
            claimed
            winningKeyCount
          }
        }
      }
    }
  `

  const result = await client.request(query, { timestamp, operator: operator.toLowerCase() }) as any;

  let wallets: SentryWallet[] = result.sentryWallets;
  let pools: PoolInfo[] = result.poolInfos;

  // TODO: Merge poolStakes into pools
  // This needs to be implemented to combine the poolStakes data with the pools data

  if (whitelist && whitelist.length > 0) {
    const _whitelist = whitelist.map(w => w.toLowerCase())
    wallets = wallets.filter(w => _whitelist.includes(w.address.toLowerCase()));
    pools = pools.filter(p => _whitelist.includes(p.address.toLowerCase()));
  }

  return { wallets, pools, refereeConfig: result.refereeConfig };
}