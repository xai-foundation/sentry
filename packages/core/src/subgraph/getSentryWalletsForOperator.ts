import { PoolInfo, SentryWallet, RefereeConfig } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * 
 * @param operator - The public key of the wallet running the operator
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
    query OperatorAddresses($timestamp: Int!) {
      sentryWallets(first: 1000, where: {
        or: [
          {address: "${operator.toLowerCase()}"}, 
          {approvedOperators_contains: ["${operator.toLowerCase()}"]}
        ]
      }) {
        isKYCApproved
        address
        v1EsXaiStakeAmount
        stakedKeyCount
        keyCount
      }
      poolInfos(first: 1000, where: {or: [{owner: "${operator.toLowerCase()}"}, {delegateAddress: "${operator.toLowerCase()}"}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
        metadata
        poolSubmissions: submissions(where: {createdTimestamp_gt: $timestamp, claimed: false, winningKeyCount_gt: 0}){
          id
          challenge{
            challengeNumber
          }
        }
      }
      refereeConfig(id: "RefereeConfig") {
        maxKeysPerPool
        maxStakeAmountPerLicense
        stakeAmountBoostFactors
        stakeAmountTierThresholds
        version
      }
    }
  `

  const result = await client.request(query, { timestamp }) as any;

  let wallets: SentryWallet[] = result.sentryWallets;
  let pools: PoolInfo[] = result.poolInfos;

  if (whitelist && whitelist.length) {
    const _whitelist = whitelist.map(w => w.toLowerCase())
    wallets = wallets.filter(w => _whitelist.includes(w.address.toLowerCase()));
    pools = pools.filter(p => _whitelist.includes(p.address.toLowerCase()));
  }

  return { wallets, pools, refereeConfig: result.refereeConfig };
}