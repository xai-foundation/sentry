import { PoolInfo, SentryWallet, execute } from "@sentry/sentry-subgraph-client";

/**
 * 
 * @param operator - The public key of the wallet running the operator
 * @returns The SentryWallet entity from the graph
 */
export async function getSentryWalletsForOperator(
  operator: string,
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

  const wallets: SentryWallet[] = result.data.sentryWallets;
  const pools: PoolInfo[] = result.data.poolInfos;

  return { wallets, pools };
}