---
id: "operator-referee"
title: "Operator Interaction With Referee"
sidebar_label: "Referee Interactions"
sidebar_position: 4
custom_edit_url: null
---

# Operator Interaction With Referee

The operator interacts with the referee contract through the following functions:

## getSubmissionsForChallenges

• **Description**: Fetches the Challenge submissions for an array of challengeIds.

• **Params**: `challengeIds: bigint[], _nodeLicenseId: bigint, callback?: (submission: Submission, index: number) => Promise<void>, chunkSize: number = 20`

• **Returns**: `Submission[]`

**Defined in**:

[operator/getSubmissionsForChallenges.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/getSubmissionsForChallenges.ts)

## checkKycStatus

• **Description**: Checks the KYC status of an array of wallets in the Referee contract.

• **Params**: `wallets: string[], callback?: (wallet: string, isKycApproved: boolean) => void`

• **Returns**: `{ wallet: string, isKycApproved: boolean }[]`

**Defined in**:

[kyc/checkKycStatus.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/kyc/checkKycStatus.ts)

## claimRewardsBulk

• **Description**: Claims rewards for multiple successful assertions on the referee contract.

• **Params**: `nodeLicenseIds: bigint[], challengeId: bigint, claimForAddressInBatch: string, keysPerBatch: number = 100, signer: ethers.Signer, logger: (message: string) => void`

• **Returns**: `{ wallet: string, isKycApproved: boolean }[]`

**Defined in**:

[operator/claimRewardBulk.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/claimRewardBulk.ts)

## submitMultipleAssertions

• **Description**: Submits assertion for multiple keys on the referee contract.

• **Params**: `nodeLicenseIds: bigint[], challengeId: bigint, successorConfirmData: string, keysPerBatch: number = 100, signer: ethers.Signer, logger: (message: string) => void`

• **Returns**: `void`

**Defined in**:

[operator/submitMultipleAssertions.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/submitMultipleAssertions.ts)
