---
id: rpc-operator-data
title: Operator Data From RPC Call
sidebar_label: RPC
sidebar_position: 2
---

# Operator Data From RPC Call

On fallback we get the necessary data for the operator through these functions:

## getBoostFactor

• **Params**: `ownerPublicKey: string`

• **Returns**: `bigint`

**Defined in**:

[operator/getBoostFactor.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/getBoostFactor.ts)

## loadOperatorKeysFromRPC

• **Params**: `operator: string`

• **Returns**: `{sentryKeysMap: { [keyId: string]: SentryKey }, nodeLicenseIds: bigint[]}`

**Defined in**: 

[operator/operatorRuntime.ts:726](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L726)

## reloadPoolKeysForRPC

• **Params**: `operator: string, sentryKeysMap: { [keyId: string]: SentryKey }, operatorOwners?: string[]`

• **Returns**: `{ [keyId: string]: SentryKey }`

**Defined in**:

[operator/operatorRuntime.ts:534](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L534)

## syncOwnerStakedKeysForRPC

• **Params**: `owners: string[], sentryKeysMap: { [keyId: string]: SentryKey }`

• **Returns**: `{ [keyId: string]: SentryKey }`

**Defined in**:

[operator/operatorRuntime.ts:503](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L503)

## getLatestChallenge

• **Returns**: `[bigint, Challenge]`

**Defined in**:

[challenger/getLatestChallenge.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/challenger/getLatestChallenge.ts)