import { PoolInfo, SentryWallet, RefereeConfig, PoolStake } from "@sentry/sentry-subgraph-client";
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
      }
    }
  `

  const result = await client.request(query, { timestamp, operator: operator.toLowerCase() }) as any;

  let wallets: SentryWallet[] = result.sentryWallets;
  let pools: PoolInfo[] = result.poolInfos;
  let stakedPools: PoolStake[] = result.poolStakes;

  // Merge Staked Pools into Pools

  // Create a Set of existing pool addresses for faster lookup
  const existingPoolAddresses = new Set(pools.map(p => p.address.toLowerCase()));

  // Check to see if the pool is already in the list of pools
  stakedPools.forEach(stakedPool => {
    const poolAddress = stakedPool.pool.address.toLowerCase();

    // If the pool is not in the list of pools, add it    
    if (!existingPoolAddresses.has(poolAddress)) {
      const newPool = stakedPool.pool;
      
      // Add the pool to the list of pools
      pools.push(newPool);
      existingPoolAddresses.add(poolAddress);
    }
  });

  if (whitelist && whitelist.length > 0) {
    const _whitelist = whitelist.map(w => w.toLowerCase())
    wallets = wallets.filter(w => _whitelist.includes(w.address.toLowerCase()));
    pools = pools.filter(p => _whitelist.includes(p.address.toLowerCase()));
  }

  return { wallets, pools, refereeConfig: result.refereeConfig };
}