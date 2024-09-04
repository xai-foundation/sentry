---
id: rpc-operator-data
title: Operator Data From RPC Call
sidebar_label: RPC
sidebar_position: 2
---

# Operator Data From RPC Call

In the case of a failed subgraph connection, we use the RPC fallback option to get the necessary data for the operator through these functions:

## getBoostFactor

• **Description**: Get the boost factor for a key from the referee contract.

• **Params**: `ownerPublicKey: string`

• **Returns**: `bigint`

**Defined in**:

[operator/getBoostFactor.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/getBoostFactor.ts)

## loadOperatorKeysFromRPC

• **Description**: Loads all keys and metadata for the operator wallet. 

• **Params**: `operator: string`

• **Returns**: `{sentryKeysMap: { [keyId: string]: SentryKey }, nodeLicenseIds: bigint[]}`

**Defined in**: 

[operator/operatorRuntime.ts:726](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L726)

## reloadPoolKeysForRPC

• **Description**: Load all the keys from pool the operator should operate and exclude pools which are not whitelisted.

• **Params**: `operator: string, sentryKeysMap: { [keyId: string]: SentryKey }, operatorOwners?: string[]`

• **Returns**: `{ [keyId: string]: SentryKey }`

**Defined in**:

[operator/operatorRuntime.ts:534](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L534)

## syncOwnerStakedKeysForRPC

• **Description**: Syncs the keys that are assigned to a pool. This needs to happen in case someone stakes or unstakes their keys from a pool.

• **Params**: `owners: string[], sentryKeysMap: { [keyId: string]: SentryKey }`

• **Returns**: `{ [keyId: string]: SentryKey }`

**Defined in**:

[operator/operatorRuntime.ts:503](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L503)

## getLatestChallenge

• **Description**: Gets the latest challenge from the referee contract.

• **Returns**: `[bigint, Challenge]`

**Defined in**:

[challenger/getLatestChallenge.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/challenger/getLatestChallenge.ts)