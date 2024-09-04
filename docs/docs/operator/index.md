---
id: "operator"
title: "Operator"
sidebar_label: "Operator"
sidebar_position: 0
custom_edit_url: null
---

# Operator

The operator is an instance that is running within the sentry desktop app. It operates the keys from pools and confirms challenges. Everyone can run the operator locally, but only users with keys are able to gain rewards for running the operator. 

The operator gets its data that it needs to operate from the subgraph. The subgraph gets updates through listening to blockchain events. For the occasion that the subgraph connection failed, we use direct RPC calls to the blockchain as fallback. 