---
id: "modules"
title: "@xai-vanguard-node/core"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Enumerations

- [NodeLicenseStatus](enums/NodeLicenseStatus.md)

## Interfaces

- [AssertionNode](interfaces/AssertionNode.md)
- [Challenge](interfaces/Challenge.md)
- [CheckoutTierSummary](interfaces/CheckoutTierSummary.md)
- [NodeLicenseInformation](interfaces/NodeLicenseInformation.md)
- [ReferralReward](interfaces/ReferralReward.md)
- [Submission](interfaces/Submission.md)
- [Tier](interfaces/Tier.md)

## Type Aliases

### NodeLicenseStatusMap

Ƭ **NodeLicenseStatusMap**: `Map`\<`bigint`, [`NodeLicenseInformation`](interfaces/NodeLicenseInformation.md)\>

#### Defined in

[operator/operatorRuntime.ts:17](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/operator/operatorRuntime.ts#L17)

## Variables

### NodeLicenseAbi

• `Const` **NodeLicenseAbi**: (\{ `anonymous`: `boolean` = false; `constant?`: `undefined` = true; `inputs`: \{ `indexed`: `boolean` = true; `name`: `string` = "owner"; `type`: `string` = "address" }[] ; `name`: `string` = "Approval"; `outputs?`: `undefined` ; `payable?`: `undefined` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "event" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = false; `inputs`: \{ `name`: `string` = "to"; `type`: `string` = "address" }[] ; `name`: `string` = "approve"; `outputs`: `never`[] = []; `payable`: `boolean` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = true; `inputs`: \{ `name`: `string` = "owner"; `type`: `string` = "address" }[] ; `name`: `string` = "balanceOf"; `outputs`: \{ `name`: `string` = ""; `type`: `string` = "uint256" }[] ; `payable`: `boolean` = false; `stateMutability`: `string` = "view"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = true; `inputs`: \{ `name`: `string` = "\_index"; `type`: `string` = "uint256" }[] ; `name`: `string` = "getPricingTier"; `outputs`: \{ `components`: \{ `name`: `string` = "price"; `type`: `string` = "uint256" }[] ; `name`: `string` = ""; `type`: `string` = "tuple" }[] ; `payable`: `boolean` = false; `stateMutability`: `string` = "view"; `type`: `string` = "function" })[]

#### Defined in

[abis/NodeLicenseAbi.ts:1](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/abis/NodeLicenseAbi.ts#L1)

___

### RefereeAbi

• `Const` **RefereeAbi**: (\{ `anonymous`: `boolean` = false; `constant?`: `undefined` = true; `inputs`: (\{ `components?`: `undefined` ; `indexed`: `boolean` = true; `name`: `string` = "challengeNumber"; `type`: `string` = "uint256" } \| \{ `components`: \{ `name`: `string` = "openForSubmissions"; `type`: `string` = "bool" }[] ; `indexed`: `boolean` = false; `name`: `string` = "challenge"; `type`: `string` = "tuple" })[] ; `name`: `string` = "ChallengeSubmitted"; `outputs?`: `undefined` ; `payable?`: `undefined` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "event" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = false; `inputs`: \{ `name`: `string` = "wallet"; `type`: `string` = "address" }[] ; `name`: `string` = "addKycWallet"; `outputs`: `never`[] = []; `payable`: `boolean` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = true; `inputs`: \{ `name`: `string` = ""; `type`: `string` = "uint256" }[] ; `name`: `string` = "challenges"; `outputs`: \{ `name`: `string` = "openForSubmissions"; `type`: `string` = "bool" }[] ; `payable`: `boolean` = false; `stateMutability`: `string` = "view"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = true; `inputs`: \{ `name`: `string` = "\_challengeId"; `type`: `string` = "uint64" }[] ; `name`: `string` = "getChallenge"; `outputs`: \{ `components`: \{ `name`: `string` = "openForSubmissions"; `type`: `string` = "bool" }[] ; `name`: `string` = ""; `type`: `string` = "tuple" }[] ; `payable`: `boolean` = false; `stateMutability`: `string` = "view"; `type`: `string` = "function" })[]

#### Defined in

[abis/RefereeAbi.ts:1](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/abis/RefereeAbi.ts#L1)

___

### RollupAdminLogicAbi

• `Const` **RollupAdminLogicAbi**: (\{ `anonymous`: `boolean` = false; `inputs`: (\{ `components?`: `undefined` ; `indexed`: `boolean` = true; `internalType`: `string` = "uint64"; `name`: `string` = "nodeNum"; `type`: `string` = "uint64" } \| \{ `components`: (\{ `components`: (\{ `components`: \{ `internalType`: `string` = "bytes32[2]"; `name`: `string` = "bytes32Vals"; `type`: `string` = "bytes32[2]" }[] ; `internalType`: `string` = "struct GlobalState"; `name`: `string` = "globalState"; `type`: `string` = "tuple" } \| \{ `components?`: `undefined` ; `internalType`: `string` = "enum MachineStatus"; `name`: `string` = "machineStatus"; `type`: `string` = "uint8" })[] ; `internalType`: `string` = "struct ExecutionState"; `name`: `string` = "beforeState"; `type`: `string` = "tuple" } \| \{ `components?`: `undefined` ; `internalType`: `string` = "uint64"; `name`: `string` = "numBlocks"; `type`: `string` = "uint64" })[] ; `indexed`: `boolean` = false; `internalType`: `string` = "struct Assertion"; `name`: `string` = "assertion"; `type`: `string` = "tuple" })[] ; `name`: `string` = "NodeCreated"; `outputs?`: `undefined` ; `stateMutability?`: `undefined` = "view"; `type`: `string` = "event" } \| \{ `anonymous?`: `undefined` = false; `inputs`: \{ `internalType`: `string` = "address"; `name`: `string` = ""; `type`: `string` = "address" }[] ; `name`: `string` = "\_stakerMap"; `outputs`: \{ `internalType`: `string` = "uint256"; `name`: `string` = "amountStaked"; `type`: `string` = "uint256" }[] ; `stateMutability`: `string` = "view"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `inputs`: (\{ `components?`: `undefined` ; `internalType`: `string` = "uint64"; `name`: `string` = "prevNode"; `type`: `string` = "uint64" } \| \{ `components`: (\{ `components`: (\{ `components`: \{ `internalType`: `string` = "bytes32[2]"; `name`: `string` = "bytes32Vals"; `type`: `string` = "bytes32[2]" }[] ; `internalType`: `string` = "struct GlobalState"; `name`: `string` = "globalState"; `type`: `string` = "tuple" } \| \{ `components?`: `undefined` ; `internalType`: `string` = "enum MachineStatus"; `name`: `string` = "machineStatus"; `type`: `string` = "uint8" })[] ; `internalType`: `string` = "struct ExecutionState"; `name`: `string` = "beforeState"; `type`: `string` = "tuple" } \| \{ `components?`: `undefined` ; `internalType`: `string` = "uint64"; `name`: `string` = "numBlocks"; `type`: `string` = "uint64" })[] ; `internalType`: `string` = "struct Assertion"; `name`: `string` = "assertion"; `type`: `string` = "tuple" })[] ; `name`: `string` = "forceCreateNode"; `outputs`: `never`[] = []; `stateMutability`: `string` = "nonpayable"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `inputs`: \{ `internalType`: `string` = "uint64"; `name`: `string` = "nodeNum"; `type`: `string` = "uint64" }[] ; `name`: `string` = "getNode"; `outputs`: \{ `components`: \{ `internalType`: `string` = "bytes32"; `name`: `string` = "stateHash"; `type`: `string` = "bytes32" }[] ; `internalType`: `string` = "struct Node"; `name`: `string` = ""; `type`: `string` = "tuple" }[] ; `stateMutability`: `string` = "view"; `type`: `string` = "function" })[]

#### Defined in

[abis/RollupAdminLogicAbi.ts:1](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/abis/RollupAdminLogicAbi.ts#L1)

___

### XaiAbi

• `Const` **XaiAbi**: (\{ `anonymous`: `boolean` = false; `constant?`: `undefined` = true; `inputs`: \{ `indexed`: `boolean` = true; `name`: `string` = "owner"; `type`: `string` = "address" }[] ; `name`: `string` = "Approval"; `outputs?`: `undefined` ; `payable?`: `undefined` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "event" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = true; `inputs`: \{ `name`: `string` = "owner"; `type`: `string` = "address" }[] ; `name`: `string` = "allowance"; `outputs`: \{ `name`: `string` = ""; `type`: `string` = "uint256" }[] ; `payable`: `boolean` = false; `stateMutability`: `string` = "view"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = false; `inputs`: \{ `name`: `string` = "spender"; `type`: `string` = "address" }[] ; `name`: `string` = "approve"; `outputs`: \{ `name`: `string` = ""; `type`: `string` = "bool" }[] ; `payable`: `boolean` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "function" })[]

#### Defined in

[abis/XaiAbi.ts:1](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/abis/XaiAbi.ts#L1)

___

### config

• **config**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `arbitrumBlockExplorer` | `string` |
| `arbitrumGoerliBlockExplorer` | `string` |
| `defaultRpcUrl` | `string` |
| `esXaiAddress` | `string` |
| `esXaiDeployedBlockNumber` | `number` |
| `esXaiImplementationAddress` | `string` |
| `nodeLicenseAddress` | `string` |
| `nodeLicenseDeployedBlockNumber` | `number` |
| `nodeLicenseImplementationAddress` | `string` |
| `refereeAddress` | `string` |
| `refereeDeployedBlockNumber` | `number` |
| `refereeImplementationAddress` | `string` |
| `rollupAddress` | `string` |
| `xaiAddress` | `string` |
| `xaiDeployedBlockNumber` | `number` |
| `xaiImplementationAddress` | `string` |

#### Defined in

[config.ts:1](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/config.ts#L1)

___

### esXaiAbi

• `Const` **esXaiAbi**: (\{ `anonymous`: `boolean` = false; `constant?`: `undefined` = true; `inputs`: \{ `indexed`: `boolean` = true; `name`: `string` = "owner"; `type`: `string` = "address" }[] ; `name`: `string` = "Approval"; `outputs?`: `undefined` ; `payable?`: `undefined` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "event" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = true; `inputs`: \{ `name`: `string` = "owner"; `type`: `string` = "address" }[] ; `name`: `string` = "allowance"; `outputs`: \{ `name`: `string` = ""; `type`: `string` = "uint256" }[] ; `payable`: `boolean` = false; `stateMutability`: `string` = "view"; `type`: `string` = "function" } \| \{ `anonymous?`: `undefined` = false; `constant`: `boolean` = false; `inputs`: \{ `name`: `string` = "spender"; `type`: `string` = "address" }[] ; `name`: `string` = "approve"; `outputs`: \{ `name`: `string` = ""; `type`: `string` = "bool" }[] ; `payable`: `boolean` = false; `stateMutability?`: `undefined` = "view"; `type`: `string` = "function" })[]

#### Defined in

[abis/esXaiAbi.ts:1](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/abis/esXaiAbi.ts#L1)

## Functions

### addAddressToRole

▸ **addAddressToRole**(`signer`, `role`, `address`): `Promise`\<`ethers.ContractTransaction`\>

Adds a role to an address in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The ethers.js signer to use. |
| `role` | `string` | The role to add to the address. |
| `address` | `string` | The address to add the role to. |

#### Returns

`Promise`\<`ethers.ContractTransaction`\>

A promise that resolves when the transaction has been sent.

#### Defined in

[access-control/addAddressToRole.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/access-control/addAddressToRole.ts#L13)

___

### addOperatorToReferee

▸ **addOperatorToReferee**(`operatorAddress`, `isApproved`, `signer`): `Promise`\<`void`\>

Adds an operator to the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `operatorAddress` | `string` | The address of the operator to be added. |
| `isApproved` | `boolean` | The approval status to be set for the operator. |
| `signer` | `Signer` | The signer to interact with the contract. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[node/addOperator.ts:11](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node/addOperator.ts#L11)

___

### challengerHashAssertion

▸ **challengerHashAssertion**(`challengerBlsSecretKey`, `assertionId`, `predecessorAssertionId`, `stateRoot`, `assertionTimestamp`): `Promise`\<`string`\>

Signs a message composed of several parts with a BLS secret key and returns the signature in hexadecimal format.
The message is composed of an assertion ID, its predecessor's ID, a state root, and a timestamp.
The message is ABI-encoded using ethers.js before signing.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `challengerBlsSecretKey` | `string` | The BLS secret key of the challenger in hexadecimal format. |
| `assertionId` | `BigInt` | The ID of the assertion. |
| `predecessorAssertionId` | `BigInt` | The ID of the predecessor assertion. |
| `stateRoot` | `string` | The state root. |
| `assertionTimestamp` | `BigInt` | The timestamp of the assertion. |

#### Returns

`Promise`\<`string`\>

The signature of the ABI-encoded message in hexadecimal format.

#### Defined in

[challenger/challengerHashAssertion.ts:16](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/challenger/challengerHashAssertion.ts#L16)

___

### changeWhitelistStatus

▸ **changeWhitelistStatus**(`signer`, `walletsStatuses`, `callback?`): `Promise`\<\{ `isWhitelisted`: `boolean` ; `wallet`: `string`  }[]\>

Changes the whitelist status of an object of wallets in the esXai contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The signer with DEFAULT_ADMIN_ROLE. |
| `walletsStatuses` | `Object` | Object with wallet addresses as keys and their whitelist status as values. |
| `callback?` | (`wallet`: `string`, `isWhitelisted`: `boolean`) => `void` | Optional callback function to handle wallets and their whitelist status as they are processed. |

#### Returns

`Promise`\<\{ `isWhitelisted`: `boolean` ; `wallet`: `string`  }[]\>

An array of objects, each containing a wallet address and its new whitelist status.

#### Defined in

[xai-token/changeWhitelistStatus.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/xai-token/changeWhitelistStatus.ts#L13)

___

### checkKycStatus

▸ **checkKycStatus**(`wallets`, `callback?`): `Promise`\<\{ `isKycApproved`: `boolean` ; `wallet`: `string`  }[]\>

Checks the KYC status of an array of wallets in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wallets` | `string`[] | Array of wallet addresses to check KYC status. |
| `callback?` | (`wallet`: `string`, `isKycApproved`: `boolean`) => `void` | Optional callback function to handle each wallet and its KYC status as they are retrieved. |

#### Returns

`Promise`\<\{ `isKycApproved`: `boolean` ; `wallet`: `string`  }[]\>

An array of objects, each containing a wallet address and its KYC status.

#### Defined in

[kyc/checkKycStatus.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/kyc/checkKycStatus.ts#L13)

___

### checkWhitelist

▸ **checkWhitelist**(`addresses`, `callback?`): `Promise`\<\{ `address`: `string` ; `isWhitelisted`: `boolean`  }[]\>

Checks if the provided addresses are in the whitelist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `addresses` | `string`[] | The addresses to check. |
| `callback?` | (`address`: `string`, `isWhitelisted`: `boolean`) => `void` | Optional callback function to handle addresses and their whitelist status as they are retrieved. |

#### Returns

`Promise`\<\{ `address`: `string` ; `isWhitelisted`: `boolean`  }[]\>

An array of objects, each containing an address and its whitelist status.

#### Defined in

[xai-token/checkWhitelist.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/xai-token/checkWhitelist.ts#L12)

___

### createBlsKeyPair

▸ **createBlsKeyPair**(`secretKeyString?`): `Promise`\<\{ `publicKeyHex`: `string` ; `secretKeyHex`: `string`  }\>

Creates a BLS Key Pair and returns the secret and public key in hexadecimal format.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `secretKeyString?` | `string` | An optional string representing the secret key. If not provided, a new secret key is generated. |

#### Returns

`Promise`\<\{ `publicKeyHex`: `string` ; `secretKeyHex`: `string`  }\>

An object containing the secret key and public key in hexadecimal format.

**`Example`**

```ts
const { secretKeyHex, publicKeyHex } = await createBlsKeyPair();
const { secretKeyHex, publicKeyHex } = await createBlsKeyPair('yourSecretKeyString');
```

#### Defined in

[utils/createBlsKeyPair.ts:11](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/utils/createBlsKeyPair.ts#L11)

___

### createMnemonic

▸ **createMnemonic**(): `Object`

Creates a mnemonic using ethers.js and returns it.

#### Returns

`Object`

An object containing the generated Mnemonic object and its corresponding phrase as a string.

| Name | Type |
| :------ | :------ |
| `mnemonic` | `Mnemonic` |
| `phrase` | `string` |

#### Defined in

[utils/createMnemonic.ts:7](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/utils/createMnemonic.ts#L7)

___

### findEventTopic

▸ **findEventTopic**(`abi`, `eventName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `abi` | `any` |
| `eventName` | `string` |

#### Returns

`string`

#### Defined in

[utils/findEventTopic.ts:3](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/utils/findEventTopic.ts#L3)

___

### getAssertion

▸ **getAssertion**(`assertionId`): `Promise`\<[`AssertionNode`](interfaces/AssertionNode.md)\>

Fetches the node of a given assertion Id.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `assertionId` | `number` | The ID of the assertion. |

#### Returns

`Promise`\<[`AssertionNode`](interfaces/AssertionNode.md)\>

The node.

#### Defined in

[utils/getAssertion.ts:42](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/utils/getAssertion.ts#L42)

___

### getBalances

▸ **getBalances**(`addresses`, `callback?`): `Promise`\<\{ `address`: `string` ; `esXaiBalance`: `bigint` ; `xaiBalance`: `bigint`  }[]\>

Returns the balance of Xai and esXai for an array of addresses.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `addresses` | `string`[] | The array of addresses to check the balance for. |
| `callback?` | (`address`: `string`, `xaiBalance`: `bigint`, `esXaiBalance`: `bigint`) => `void` | Optional callback function to handle addresses and their balances as they are retrieved. |

#### Returns

`Promise`\<\{ `address`: `string` ; `esXaiBalance`: `bigint` ; `xaiBalance`: `bigint`  }[]\>

An array of objects, each containing an address and its Xai and esXai balances.

#### Defined in

[xai-token/balance.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/xai-token/balance.ts#L12)

___

### getDiscountAndRewardForReferrals

▸ **getDiscountAndRewardForReferrals**(): `Promise`\<\{ `referralDiscountPercentage`: `bigint` ; `referralRewardPercentage`: `bigint`  }\>

Fetches the referral discount and reward percentages from the NodeLicense contract.

#### Returns

`Promise`\<\{ `referralDiscountPercentage`: `bigint` ; `referralRewardPercentage`: `bigint`  }\>

An object containing the referral discount and reward percentages.

#### Defined in

[node-license/getDiscountAndRewardForReferrals.ts:10](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/getDiscountAndRewardForReferrals.ts#L10)

___

### getIsCheckingAssertions

▸ **getIsCheckingAssertions**(): `Promise`\<`boolean`\>

Fetches the value of isCheckingAssertions.

#### Returns

`Promise`\<`boolean`\>

The value of isCheckingAssertions.

#### Defined in

[challenger/isCheckingAssertions.ts:10](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/challenger/isCheckingAssertions.ts#L10)

___

### getMintTimestamp

▸ **getMintTimestamp**(`tokenId`): `Promise`\<`bigint`\>

Fetches the mint timestamp from the NodeLicense contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenId` | `bigint` | The ID of the token. |

#### Returns

`Promise`\<`bigint`\>

The minting timestamp.

#### Defined in

[node-license/getMintTimestamp.ts:11](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/getMintTimestamp.ts#L11)

___

### getPriceForQuantity

▸ **getPriceForQuantity**(`quantity`): `Promise`\<\{ `nodesAtEachPrice`: [`CheckoutTierSummary`](interfaces/CheckoutTierSummary.md)[] ; `price`: `bigint`  }\>

Fetches the price for a given quantity of NodeLicenses and the number of nodes at each price.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `quantity` | `number` | The quantity of NodeLicenses. |

#### Returns

`Promise`\<\{ `nodesAtEachPrice`: [`CheckoutTierSummary`](interfaces/CheckoutTierSummary.md)[] ; `price`: `bigint`  }\>

An object containing the price for the given quantity of NodeLicenses and a list of how many nodes are at each price.

#### Defined in

[node-license/getPriceForQuantity.ts:21](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/getPriceForQuantity.ts#L21)

___

### getProvider

▸ **getProvider**(`rpcUrl?`): `ethers.JsonRpcProvider`

Creates an ethers provider from a given RPC URL. If the same RPC URL is passed in, 
the same instance of the provider is returned (Singleton nature).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rpcUrl` | `string` | `config.defaultRpcUrl` | The RPC URL. Defaults to Arbitrum One's public RPC. |

#### Returns

`ethers.JsonRpcProvider`

An ethers provider.

#### Defined in

[utils/getProvider.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/utils/getProvider.ts#L13)

___

### getReferralRewards

▸ **getReferralRewards**(`fromTimestamp?`, `toTimestamp?`, `buyerAddress?`, `referralAddress?`, `callback?`): `Promise`\<\{ `[key: string]`: [`ReferralReward`](interfaces/ReferralReward.md);  }\>

Fetches all referral rewards from the NodeLicense contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fromTimestamp?` | `number` | - |
| `toTimestamp?` | `number` | - |
| `buyerAddress?` | `string` | Optional buyer address. |
| `referralAddress?` | `string` | Optional referral address. |
| `callback?` | (`logs?`: `Log`[], `from?`: `BlockTag`, `to?`: `BlockTag`) => `void` | Optional callback function that is called whenever a new set of logs is fetched. |

#### Returns

`Promise`\<\{ `[key: string]`: [`ReferralReward`](interfaces/ReferralReward.md);  }\>

An object of addresses to their referral rewards.

#### Defined in

[node-license/getReferralRewards.ts:31](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/getReferralRewards.ts#L31)

___

### getSignerFromMnemonic

▸ **getSignerFromMnemonic**(`mnemonic`, `index`): `Object`

Creates an ethers signer from a given Mnemonic object and index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mnemonic` | `string` | The Mnemonic string |
| `index` | `number` | The index of the account in the mnemonic. |

#### Returns

`Object`

An object containing the signer, address, and private key.

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `privateKey` | `string` |
| `signer` | `ethers.Signer` |

#### Defined in

[utils/getSignerFromMnemonic.ts:10](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/utils/getSignerFromMnemonic.ts#L10)

___

### getSignerFromPrivateKey

▸ **getSignerFromPrivateKey**(`privateKey`): `Object`

Creates an ethers signer from a given private key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `privateKey` | `string` | The private key. |

#### Returns

`Object`

An object containing the signer, address, and private key.

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `privateKey` | `string` |
| `signer` | `ethers.Signer` |

#### Defined in

[utils/getSignerFromPrivateKey.ts:9](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/utils/getSignerFromPrivateKey.ts#L9)

___

### getSubmissionForChallenge

▸ **getSubmissionForChallenge**(`challengeId`, `_nodeLicenseId`): `Promise`\<[`Submission`](interfaces/Submission.md)\>

Fetches the submission of a given challenge Id.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `challengeId` | `bigint` | The ID of the challenge. |
| `_nodeLicenseId` | `bigint` | The node license ID to look up for. |

#### Returns

`Promise`\<[`Submission`](interfaces/Submission.md)\>

The submission.

#### Defined in

[operator/getSubmissionForChallenge.ts:21](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/operator/getSubmissionForChallenge.ts#L21)

___

### getTotalSupply

▸ **getTotalSupply**(): `Promise`\<\{ `esXaiTotalSupply`: `bigint` ; `totalSupply`: `bigint` ; `xaiTotalSupply`: `bigint`  }\>

Returns the total supply of tokens in circulation.

#### Returns

`Promise`\<\{ `esXaiTotalSupply`: `bigint` ; `totalSupply`: `bigint` ; `xaiTotalSupply`: `bigint`  }\>

An object that shows the total supply of esXai and Xai, and their total supply added together.

#### Defined in

[xai-token/totalSupply.ts:10](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/xai-token/totalSupply.ts#L10)

___

### getTotalSupplyAndCap

▸ **getTotalSupplyAndCap**(): `Promise`\<\{ `maxSupply`: `bigint` ; `totalSupply`: `bigint`  }\>

Fetches the total supply and max supply of tokens from the NodeLicense contract.

#### Returns

`Promise`\<\{ `maxSupply`: `bigint` ; `totalSupply`: `bigint`  }\>

An object containing the total supply and max supply of tokens.

#### Defined in

[node-license/getTotalSupplyAndCap.ts:10](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/getTotalSupplyAndCap.ts#L10)

___

### listAddressesForRole

▸ **listAddressesForRole**(`role`, `callback?`): `Promise`\<`string`[]\>

Lists all addresses that have a particular role in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `role` | `string` | The role to list addresses for. |
| `callback?` | (`address`: `string`) => `void` | Optional callback function to handle addresses as they are retrieved. |

#### Returns

`Promise`\<`string`[]\>

The addresses that have the given role.

#### Defined in

[access-control/listAddressesForRole.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/access-control/listAddressesForRole.ts#L13)

___

### listChallenges

▸ **listChallenges**(`openForSubmissions?`, `callback?`): `Promise`\<[`Challenge`](interfaces/Challenge.md)[]\>

Fetches all Challenges from the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `openForSubmissions?` | `boolean` | Optional argument to filter challenges that are open for submissions. |
| `callback?` | (`challengeNumber`: `bigint`, `challenge`: [`Challenge`](interfaces/Challenge.md)) => `void` | Optional callback function to handle challenges as they are retrieved. |

#### Returns

`Promise`\<[`Challenge`](interfaces/Challenge.md)[]\>

An array of challenges.

#### Defined in

[challenger/listChallenges.ts:27](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/challenger/listChallenges.ts#L27)

___

### listKycStatuses

▸ **listKycStatuses**(`callback?`): `Promise`\<\{ `isKycApproved`: `boolean` ; `wallet`: `string`  }[]\>

Lists all wallets and their KYC status in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback?` | (`wallet`: `string`, `isKycApproved`: `boolean`) => `void` | Optional callback function to handle wallets and their KYC status as they are retrieved. |

#### Returns

`Promise`\<\{ `isKycApproved`: `boolean` ; `wallet`: `string`  }[]\>

An array of objects, each containing a wallet address and its KYC status.

#### Defined in

[kyc/listKycStatuses.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/kyc/listKycStatuses.ts#L12)

___

### listNodeLicenses

▸ **listNodeLicenses**(`ownerAddress`, `callback?`): `Promise`\<`bigint`[]\>

Fetches all NodeLicense token IDs owned by a given address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ownerAddress` | `string` | The address of the owner. |
| `callback?` | (`tokenId`: `bigint`) => `void` | Optional callback function to handle token IDs as they are retrieved. |

#### Returns

`Promise`\<`bigint`[]\>

An array of token IDs.

#### Defined in

[node-license/listNodeLicenses.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/listNodeLicenses.ts#L12)

___

### listOperatorsForAddress

▸ **listOperatorsForAddress**(`ownerAddress`, `callback?`): `Promise`\<`string`[]\>

Lists all operators for a particular address in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ownerAddress` | `string` | The address to list operators for. |
| `callback?` | (`operator`: `string`, `index`: `number`) => `void` | Optional callback function to handle operators as they are retrieved. |

#### Returns

`Promise`\<`string`[]\>

The operators for the given address.

#### Defined in

[node/listOperators.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node/listOperators.ts#L13)

___

### listOwnersForOperator

▸ **listOwnersForOperator**(`operatorAddress`, `callback?`): `Promise`\<`string`[]\>

Lists all owners for a particular operator in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `operatorAddress` | `string` | The address to list owners for. |
| `callback?` | (`owner`: `string`, `index`: `number`) => `void` | Optional callback function to handle owners as they are retrieved. |

#### Returns

`Promise`\<`string`[]\>

The owners for the given operator.

#### Defined in

[node/listOwnersForOperator.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node/listOwnersForOperator.ts#L13)

___

### listTiers

▸ **listTiers**(`callback?`): `Promise`\<[`Tier`](interfaces/Tier.md)[]\>

Fetches all pricing tiers from the NodeLicense contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback?` | (`tier`: [`Tier`](interfaces/Tier.md)) => `void` | Optional callback function to handle tiers as they are retrieved. |

#### Returns

`Promise`\<[`Tier`](interfaces/Tier.md)[]\>

An array of pricing tiers.

#### Defined in

[node-license/listTiers.ts:19](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/listTiers.ts#L19)

___

### listWhitelistAddresses

▸ **listWhitelistAddresses**(`callback?`): `Promise`\<`string`[]\>

Lists all whitelisted addresses in the esXai contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback?` | (`address`: `string`) => `void` | Optional callback function to handle whitelisted addresses as they are retrieved. |

#### Returns

`Promise`\<`string`[]\>

An array of whitelisted addresses.

#### Defined in

[xai-token/listWhitelistAddresses.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/xai-token/listWhitelistAddresses.ts#L12)

___

### listenForAssertions

▸ **listenForAssertions**(`callback`): () => `void`

Listens for NodeConfirmed events and triggers a callback function when the event is emitted.
Keeps a map of nodeNums that have called the callback to ensure uniqueness.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`nodeNum`: `any`, `blockHash`: `any`, `sendRoot`: `any`, `event`: `any`) => `void` | The callback function to be triggered when NodeConfirmed event is emitted. |

#### Returns

`fn`

A function that can be called to stop listening for the event.

▸ (): `void`

##### Returns

`void`

#### Defined in

[challenger/listenForAssertions.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/challenger/listenForAssertions.ts#L12)

___

### listenForChallenges

▸ **listenForChallenges**(`callback`): () => `void`

Listens for ChallengeSubmitted events and triggers a callback function when the event is emitted.
Keeps a map of challengeNumbers that have called the callback to ensure uniqueness.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`challengeNumber`: `bigint`, `challenge`: [`Challenge`](interfaces/Challenge.md), `event`: `any`) => `void` | The callback function to be triggered when ChallengeSubmitted event is emitted. |

#### Returns

`fn`

A function that can be called to stop listening for the event.

▸ (): `void`

##### Returns

`void`

#### Defined in

[operator/listenForChallenges.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/operator/listenForChallenges.ts#L13)

___

### mintNodeLicenses

▸ **mintNodeLicenses**(`amount`, `signer`, `referralAddress?`): `Promise`\<\{ `mintedNftIds`: `bigint`[] ; `pricePaid`: `bigint` ; `txReceipt`: `ethers.TransactionReceipt`  }\>

Mints NodeLicense tokens if the signer has enough balance and the amount is less than the maximum mint amount.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `number` | The amount of tokens to mint. |
| `signer` | `Signer` | The signer to interact with the contract. |
| `referralAddress?` | `string` | - |

#### Returns

`Promise`\<\{ `mintedNftIds`: `bigint`[] ; `pricePaid`: `bigint` ; `txReceipt`: `ethers.TransactionReceipt`  }\>

An object containing an array of minted NFT IDs, the transaction receipt, and the price paid.

#### Defined in

[node-license/mintNodeLicenses.ts:11](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node-license/mintNodeLicenses.ts#L11)

___

### operatorRuntime

▸ **operatorRuntime**(`signer`, `statusCallback?`, `logFunction?`): `Promise`\<() => `Promise`\<`void`\>\>

Operator runtime function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The signer. |
| `statusCallback?` | (`status`: [`NodeLicenseStatusMap`](modules.md#nodelicensestatusmap)) => `void` | Optional function to monitor the status of the runtime. |
| `logFunction?` | (`log`: `string`) => `void` | Optional function to log the process. |

#### Returns

`Promise`\<() => `Promise`\<`void`\>\>

The stop function.

#### Defined in

[operator/operatorRuntime.ts:26](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/operator/operatorRuntime.ts#L26)

___

### removeAddressFromRole

▸ **removeAddressFromRole**(`signer`, `role`, `address`): `Promise`\<`ethers.ContractTransaction`\>

Removes a role from an address in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The ethers.js signer to use. |
| `role` | `string` | The role to remove from the address. |
| `address` | `string` | The address to remove the role from. |

#### Returns

`Promise`\<`ethers.ContractTransaction`\>

A promise that resolves when the transaction has been sent.

#### Defined in

[access-control/removeAddressFromRole.ts:13](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/access-control/removeAddressFromRole.ts#L13)

___

### removeOperatorFromReferee

▸ **removeOperatorFromReferee**(`operatorAddress`, `signer`): `Promise`\<`void`\>

Removes an operator from the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `operatorAddress` | `string` | The address of the operator to be removed. |
| `signer` | `Signer` | The signer to interact with the contract. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[node/removeOperator.ts:10](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/node/removeOperator.ts#L10)

___

### setChallengerPublicKey

▸ **setChallengerPublicKey**(`signer`, `publicKey`): `Promise`\<`any`\>

Sets the challenger public key in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | - |
| `publicKey` | `string` | The new challenger public key. |

#### Returns

`Promise`\<`any`\>

A promise that resolves to the transaction receipt.

#### Defined in

[admin/setChallengerPublicKey.ts:11](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/admin/setChallengerPublicKey.ts#L11)

___

### setConfig

▸ **setConfig**(`_config`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_config` | `any` |

#### Returns

`void`

#### Defined in

[config.ts:20](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/config.ts#L20)

___

### setDiscountAndRewardForReferrals

▸ **setDiscountAndRewardForReferrals**(`signer`, `referralDiscountPercentage`, `referralRewardPercentage`): `Promise`\<`any`\>

Sets the referral discount and reward percentages in the NodeLicense contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The ethers.js signer to use. |
| `referralDiscountPercentage` | `number` | The new referral discount percentage. |
| `referralRewardPercentage` | `number` | The new referral reward percentage. |

#### Returns

`Promise`\<`any`\>

A promise that resolves to the transaction receipt.

#### Defined in

[admin/setDiscountAndRewardForReferrals.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/admin/setDiscountAndRewardForReferrals.ts#L12)

___

### setKycStatus

▸ **setKycStatus**(`signer`, `walletsStatuses`, `callback?`): `Promise`\<\{ `isKycApproved`: `boolean` ; `wallet`: `string`  }[]\>

Sets the KYC status of an object of wallets in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The signer with KYC_ADMIN_ROLE. |
| `walletsStatuses` | `Object` | Object with wallet addresses as keys and their KYC status as values. |
| `callback?` | (`wallet`: `string`, `isKycApproved`: `boolean`) => `void` | Optional callback function to handle wallets and their KYC status as they are processed. |

#### Returns

`Promise`\<\{ `isKycApproved`: `boolean` ; `wallet`: `string`  }[]\>

An array of objects, each containing a wallet address and its new KYC status.

#### Defined in

[kyc/setKycStatus.ts:14](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/kyc/setKycStatus.ts#L14)

___

### setRollupAddress

▸ **setRollupAddress**(`signer`, `rollupAddress`): `Promise`\<`any`\>

Sets the rollup address in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The ethers.js signer to use. |
| `rollupAddress` | `string` | The new rollup address. |

#### Returns

`Promise`\<`any`\>

A promise that resolves to the transaction receipt.

#### Defined in

[admin/setRollupAddress.ts:11](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/admin/setRollupAddress.ts#L11)

___

### submitAssertionToChallenge

▸ **submitAssertionToChallenge**(`nodeLicenseId`, `challengeId`, `successorStateRoot`, `signer`): `Promise`\<`void`\>

Submits an assertion to the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeLicenseId` | `bigint` | The ID of the NodeLicense. |
| `challengeId` | `bigint` | The ID of the challenge. |
| `successorStateRoot` | `string` | The successor state root. |
| `signer` | `Signer` | The signer to interact with the contract. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[operator/submitAssertionToChallenge.ts:12](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/operator/submitAssertionToChallenge.ts#L12)

___

### submitAssertionToReferee

▸ **submitAssertionToReferee**(`challengerBlsSecretKey`, `assertionId`, `assertionNode`, `signer`): `Promise`\<`void`\>

Submits an assertion to the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `challengerBlsSecretKey` | `string` | The BLS secret key of the challenger in hexadecimal format. |
| `assertionId` | `number` | The ID of the assertion. |
| `assertionNode` | [`AssertionNode`](interfaces/AssertionNode.md) | - |
| `signer` | `Signer` | The signer to interact with the contract. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[challenger/submitAssertionToReferee.ts:15](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/challenger/submitAssertionToReferee.ts#L15)

___

### toggleAssertionChecking

▸ **toggleAssertionChecking**(`signer`): `Promise`\<`any`\>

Toggles the assertion checking in the Referee contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The ethers.js signer to use. |

#### Returns

`Promise`\<`any`\>

A promise that resolves to the transaction receipt.

#### Defined in

[admin/toggleAssertionChecking.ts:10](https://github.com/xai-foundation/vanguard-node/blob/d5581f0/packages/core/src/admin/toggleAssertionChecking.ts#L10)
