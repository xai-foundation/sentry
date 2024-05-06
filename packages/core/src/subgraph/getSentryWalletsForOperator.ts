import { PoolInfo, SentryWallet, execute } from "@sentry/sentry-subgraph-client";

/**
 * 
 * @param operator - The public key of the wallet running the operator
 * @returns The SentryWallet entity from the graph
 */
export async function getSentryWalletsForOperator(
  operator: string,
  whitelist?: string[]
): Promise<{ wallets: SentryWallet[], pools: PoolInfo[] }> {
  const query = `
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
  const result = await execute(query, {});

  let wallets: SentryWallet[] = result.data.sentryWallets;
  let pools: PoolInfo[] = result.data.poolInfos;

  if(whitelist && whitelist.length){
    wallets = wallets.filter(w => whitelist.includes(w.address));
    pools = pools.filter(p => whitelist.includes(p.address));
  }

  return { wallets, pools };
}