---
id: "operator-challenger"
title: "Operator Interaction With Challenger"
sidebar_label: "Challenger Interactions"
sidebar_position: 5
custom_edit_url: null
---

# Operator Interaction With Challenger

The operator interacts indirectly with the challenger through the following function:

## listenForChallenges

• **Description**: Listens for ChallengeSubmitted events and triggers a callback function when the event is emitted. Keeps a map of challengeNumbers that have called the callback to ensure uniqueness.

• **Params**: `callback: (challengeNumber: bigint, challenge: Challenge, event: any) => void`

• **Returns**: `() => void`

**Defined in**:

[operator/listenForChallenges.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/operator/listenForChallenges.ts)