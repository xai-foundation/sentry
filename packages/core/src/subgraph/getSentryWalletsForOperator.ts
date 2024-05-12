import { PoolInfo, SentryWallet, RefereeConfig } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'

/**
 * 
 * @param operator - The public key of the wallet running the operator
 * @returns The SentryWallet entity from the graph
 */
export async function getSentryWalletsForOperator(
  client: GraphQLClient,
  operator: string,
  whitelist?: string[]
): Promise<{ wallets: SentryWallet[], pools: PoolInfo[], refereeConfig: RefereeConfig }> {
  const query = gql`
    query OperatorAddresses {
      sentryWallets(where: {
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
      poolInfos(where: {or: [{owner: "${operator.toLowerCase()}"}, {delegateAddress: "${operator.toLowerCase()}"}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
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

  const result = await client.request(query) as any;

  let wallets: SentryWallet[] = result.sentryWallets;
  let pools: PoolInfo[] = result.poolInfos;

  if (whitelist && whitelist.length) {
    wallets = wallets.filter(w => whitelist.includes(w.address));
    pools = pools.filter(p => whitelist.includes(p.address));
  }

  return { wallets, pools, refereeConfig: result.refereeConfig };
}