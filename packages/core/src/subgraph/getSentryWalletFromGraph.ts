import { SentryWallet, execute } from "@sentry/sentry-subgraph-client";

/**
 * 
 * @param operator - The public key of the wallet running the operator
 * @returns The SentryWallet entity from the graph
 */
export async function getSentryWalletFromGraph(
  operator: string,
): Promise<SentryWallet> {
  const query = `
    query SentryWallet {
      sentryWallet(id: "${operator.toLowerCase()}") {
        address
        approvedOwners
        id
        isKYCApproved
        ownedPools
      }
    }
  `
  const result = await execute(query, {});
  return result.data.sentryWallet;
}