---
id: "operator-keys"
title: "Operator Interaction With NodeLicenses"
sidebar_label: "NodeLicenses"
sidebar_position: 6
custom_edit_url: null
---

# Operator Interaction With NodeLicenses

The operator interacts with NodeLicenses through the following function:

## loadOperatorKeysFromGraph

• **Params**: `operator: string, latestChallengeNumber?: bigint`

• **Returns**: `{ wallets: SentryWallet[], sentryKeys: SentryKey[], sentryWalletMap: { [owner: string]: SentryWallet }, sentryKeysMap: { [keyId: string]: SentryKey }, nodeLicenseIds: bigint[],mappedPools: [poolAddress: string]: PoolInfo }, refereeConfig: RefereeConfig }`

**Defined in**:

[operator/operatorRuntime.ts:598](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/operatorRuntime.ts#L598)