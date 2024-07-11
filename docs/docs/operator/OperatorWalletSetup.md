---
id: "operator-wallet"
title: "Operator Setup Wallet"
sidebar_label: "Add Wallet"
sidebar_position: 7
custom_edit_url: null
---

# Operator Setup Wallet

To add a new testing wallet, the operating wallet needs to approve the wallet through the sepolia referee contract by following this link to the [Referee on sepolia](https://sepolia.arbiscan.io/address/0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b#writeProxyContract).

Press the button `Connect to Web3` and connect with your new testing wallet. Go to `setApprovalForOperator` and enter the `operator address` and the bool `true`.

The testing wallet should have a balance on the network `Arbitrum Sepolia Testnet` with the chainId `421614`.

Go to `addKycWallet` and approve your wallet with the wallet address.

Then go to the nodeLicense contract to mint test keys [NodeLicense](https://sepolia.arbiscan.io/address/0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2#writeProxyContract). Connect with your testing wallet by pressing `Connect to Web3`.

Go to `mintDev` and mint the amount of keys to test. (Please keep in mind that this is not available on the current version 7 of the smart contract.)

Now on `boot-operator` the new testing wallet with its keys should be included.