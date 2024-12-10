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
  submissionsFilter?: { winningKeyCount?: boolean, claimed?: boolean, latestChallengeNumber?: bigint },
  whitelist?: string[],
): Promise<{ wallets: SentryWallet[], pools: PoolInfo[], refereeConfig: RefereeConfig }> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  let submissionQueryFilter: string[] = [];
  if (submissionsFilter) {
    const { winningKeyCount, claimed, latestChallengeNumber } = submissionsFilter;
    if (winningKeyCount != undefined) {
      if (winningKeyCount) {
        submissionQueryFilter.push('winningKeyCount_gt: 0');
      } else {
        submissionQueryFilter.push('winningKeyCount: 0');
      }
    }
    if (claimed != undefined) {
      submissionQueryFilter.push(`claimed: ${claimed}`)
    }
    if (latestChallengeNumber != undefined) {
      submissionQueryFilter.push(`challengeId_gte: ${latestChallengeNumber.toString()}`)
    }
  }

  const bulkSubmissionsFields = `bulkSubmissions(first: 10000, orderBy: challengeId, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) {
    challengeId
    winningKeyCount
    claimed 
  }`

  //NOTE: needed because of inconsistent field names
  const submissionsFields = `submissions(first: 10000, orderBy: challengeId, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) {
    challengeId
    winningKeyCount
    claimed 
  }`

  const query = gql`
    query OperatorAddresses {
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
        totalAccruedAssertionRewards
        ${submissionQueryFilter.length ? bulkSubmissionsFields : ""}
      }
      poolInfos(first: 1000, where: {or: [{owner: "${operator.toLowerCase()}"}, {delegateAddress: "${operator.toLowerCase()}"}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
        metadata
        totalAccruedAssertionRewards
        ${submissionQueryFilter.length ? submissionsFields : ""}
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
    const _whitelist = whitelist.map(w => w.toLowerCase())
    wallets = wallets.filter(w => _whitelist.includes(w.address.toLowerCase()));
    pools = pools.filter(p => _whitelist.includes(p.address.toLowerCase()));
  }

  return { wallets, pools, refereeConfig: result.refereeConfig };
}