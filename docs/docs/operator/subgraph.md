---
id: "subgraph-operator-data"
title: "Operator Data From Subgraph"
sidebar_label: "Subgraph"
sidebar_position: 1
custom_edit_url: null
---

# Operator Data From Subgraph

We get the subgraph data for the operator through these functions:

## getSubgraphHealthStatus

• **Description**: Checks the subgraph url for the current health status.

• **Returns**: `{ healthy: boolean, error?: string }`

**Defined in**:

[subgraph/getSubgraphHealthStatus.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/subgraph/getSubgraphHealthStatus.ts)

## getLatestChallengeFromGraph

• **Description**: Submits a query to the subgraph to get the latest challenge.

• **Returns**: `Challenge`

**Defined in**:

[subgraph/getLatestChallengeFromGraph.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/subgraph/getLatestChallengeFromGraph.ts)

## getPoolInfosFromGraph

• **Description**: Submits a query to the subgraph to retrieve information of the pools specified in the params.

• **Params**: `poolAddresses: string[], extendPoolInfo?: boolean, fetchRefereeConfig?: boolean`

• **Returns**: `{ pools: PoolInfo[], refereeConfig?: RefereeConfig }`

**Defined in**: 

[subgraph/getPoolInfosFromGraph.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/subgraph/getPoolInfosFromGraph.ts)

## getSentryKeysFromGraph

• **Description**: Submits a query to the subgraph to get a list of sentry keys from a list of owners and pools.

• **Params**: `owners: string[], stakingPools: string[], includeSubmissions: boolean, submissionsFilter: { eligibleForPayout?: boolean, claimed?: boolean, latestChallengeNumber?: bigint }`

• **Returns**: `SentryKey[]`

**Defined in**:

[subgraph/getSentryKeysFromGraph.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/subgraph/getSentryKeysFromGraph.ts)

## getSentryWalletsForOperator

• **Description**: Submits a query to the subgraph to get the sentry wallets, pools and refereeConfig from a list of whitelisted pools and wallets.

• **Params**: `operator: string, whitelist?: string[]`

• **Returns**: `{ wallets: SentryWallet[], pools: PoolInfo[], refereeConfig: RefereeConfig }`

**Defined in**:

[subgraph/getSentryWalletsForOperator.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/subgraph/getSentryWalletsForOperator.ts)