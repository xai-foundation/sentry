---
id: operator-sepolia
title: Operator Run On Sepolia
sidebar_label: Run On Sepolia Network
sidebar_position: 3
---

# Run Operator On Sepolia

To run the operator on the sepolia network the contracts must be deployed on the `Arbitrum Sepolia Testnet` with the chainId `421614`. And then update the following values in the config file:

• arbitrumOneJsonRpcUrl

• arbitrumOneWebSocketUrl

• subgraphEndpoint

• rollupAddress

• refereeAddress

• poolFactoryAddress

• nodeLicenseAddress

**Defined in**:

[config.ts](https://github.com/xai-foundation/sentry/blob/fe751c5eb031e20365a15eef1f0eba36a8144d5e/packages/core/src/config.ts)

To run the operator enter:

```
pnpm clean
pnpm build
pnpm cli
boot-operator
```

For testing the operatorRuntime on sepolia challenges with incrementing assertionIds can be submitted to the [sepolia Referee](https://sepolia.arbiscan.io/address/0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b#writeProxyContract) `submitChallenge()`. Additionally there should be an option to submit a sepolia test challenge from the [end-to-end testing framework](https://github.com/xai-foundation/sentry-e2e).