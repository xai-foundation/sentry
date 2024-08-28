---
id: "operator-keys"
title: "Operator Interaction With NodeLicenses"
sidebar_label: "NodeLicenses Interactions"
sidebar_position: 6
custom_edit_url: null
---

# Operator Interaction With NodeLicenses

The operator interacts with NodeLicenses through the following function:

## loadOperatorKeysFromGraph

• **Description**: Loads all operating keys and metadata from the subgraph. It will find all keys of the operator, all approved owners and their keys and all keys staked in pools owned / delegated to the operator. This will attach metadata to key entities including key timestamps, assigned pools and owner kyc status and it will also attach submission objects to each sentryKey for processing the last closed challenge.

• **Params**: `operator: string, latestChallengeNumber?: bigint`

• **Returns**: `{ wallets: SentryWallet[], sentryKeys: SentryKey[], sentryWalletMap: { [owner: string]: SentryWallet }, sentryKeysMap: { [keyId: string]: SentryKey }, nodeLicenseIds: bigint[],mappedPools: [poolAddress: string]: PoolInfo }, refereeConfig: RefereeConfig }`

**Defined in**:

[operator/operatorRuntime.ts:598](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L598)