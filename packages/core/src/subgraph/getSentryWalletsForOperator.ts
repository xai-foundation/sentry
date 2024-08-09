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
  whitelist?: string[],
): Promise<{ wallets: SentryWallet[], pools: PoolInfo[], refereeConfig: RefereeConfig }> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  let submissionQueryFilter: string[] = [];
  const { eligibleForPayout, claimed, latestChallengeNumber } = submissionsFilter;
  if (eligibleForPayout != undefined) {
    submissionQueryFilter.push(`eligibleForPayout: ${eligibleForPayout}`)
  }
  if (claimed != undefined) {
    submissionQueryFilter.push(`claimed: ${claimed}`)
  }
  if (latestChallengeNumber != undefined) {
    submissionQueryFilter.push(`challengeNumber_gte: ${latestChallengeNumber.toString()}`)
  }

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
        bulkSubmissions(first: 10000, orderBy: challengeNumber, orderDirection: desc, where: {${submissionQueryFilter.join(",")}})
      }
      poolInfos(first: 1000, where: {or: [{owner: "${operator.toLowerCase()}"}, {delegateAddress: "${operator.toLowerCase()}"}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
        metadata
        bulkSubmissions(first: 10000, orderBy: challengeNumber, orderDirection: desc, where: {${submissionQueryFilter.join(",")}})
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