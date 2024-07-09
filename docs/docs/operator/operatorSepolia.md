---
id: operator-sepolia
title: Operator Run On Sepolia
sidebar_label: Sepolia
sidebar_position: 3
---

# Run Operator On Sepolia

To run the operator on the sepolia network the contracts must be deployed. And then update the following values in the config file:

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

To test the operator you need a challenger running on sepolia and a set up testing wallet. We have an interactive Test UI that can assert a new Challenge through an interval or on click. If this should not be available yet, then use the fake challenger from the branch `sepolia-fake-challenger`.