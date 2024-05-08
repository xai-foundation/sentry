import { PoolInfo, SentryWallet } from "@sentry/sentry-subgraph-client";
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
): Promise<{ wallets: SentryWallet[], pools: PoolInfo[] }> {
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
      }
      poolInfos(where: {or: [{owner: "${operator.toLowerCase()}"}, {delegateAddress: "${operator.toLowerCase()}"}]}) {
        address
        owner
        delegateAddress
      }
    }
  `
  
  const result = await client.request(query) as any;

  let wallets: SentryWallet[] = result.sentryWallets;
  let pools: PoolInfo[] = result.poolInfos;

  if(whitelist && whitelist.length){
    wallets = wallets.filter(w => whitelist.includes(w.address));
    pools = pools.filter(p => whitelist.includes(p.address));
  }

  return { wallets, pools };
}