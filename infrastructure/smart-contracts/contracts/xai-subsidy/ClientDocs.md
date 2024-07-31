# XAI Gas Subsidy

The XAI Gas Subsidy uses the ERC-2771 standard for secure protocol for native meta transactions.
With the XAI Gas Subsidy XAI can sponsor your users transactions so they don't have to own native XAI.

## How the XAI Gas Subsidy works

Instead of using a contract write function, you let the user sign a typed data message ([EIP-712](https://eips.ethereum.org/EIPS/eip-712)) with the message implementing the [ERC-2771](https://eips.ethereum.org/EIPS/eip-2771) `meta-transaction`. This means when you use the XAI Gas Subsidy your user does not call the contract directly, instead the XAI relayer will forward to your smart contract.

### Relayer Endpoints:

**Xai Mainnet Relayer**: https://relayer.xai.games/
**Xai Mainnet API Docs**: https://docs.xai.games/gas-relayer/#/relayer

**Xai Testnet Relayer**: https://develop.relayer.xai.games/
**Xai Testnet API Docs**: https://develop.docs.xai.games/gas-relayer/#/relayer

## Requirements

To use the XAI Gas Subsidy your contracts need to follow the [ERC-2771](https://eips.ethereum.org/EIPS/eip-2771) _msgSender() overwrite and make sure to only use the _msgSender() when updating a user's state. This requires the check for the trusted forwarder. The trusted forwarder should either be the XAI trusted forwarder:

- **Xai mainnet Forwarder: TBD**
- **Xai testnet Forwarder: 0x31635b37347258d7c6f83bDC664c5516Da8e6fD7**

The _msgSender() overrides the default msg.sender. As the default msg.sender would be the address of the forward contract instead of the user wallet address:

```javascript
function _msgSender() internal view returns (address) {
    uint256 calldataLength = msg.data.length;
    if (isTrustedForwarder(msg.sender) && calldataLength >= 20) {
        return address(bytes20(msg.data[calldataLength - 20:]));
    } else {
        return super._msgSender();
    }
}
```

The _msgDate() overrides the default msg.data:

```javascript
function _msgData() internal view returns (bytes calldata) {
    uint256 calldataLength = msg.data.length;
    if (isTrustedForwarder(msg.sender) && calldataLength >= 20) {
        return msg.data[:calldataLength - 20];
    } else {
        return super._msgData();
    }
}
```

The trusted forwarder check is important to only allow a whitelisted forwarder contract to call the functions:

```javascript
function isTrustedForwarder( address forwarder ) public view returns (bool) {
    return forwarder == trustedForwarder;
}
```

#### How to sign meta transactions

The user needs to signs a message based on the EIP-712 sign typed message using the 2771 forward request standard:

```javascript
export function createTypedData(wallet: `0x${string}`, receiver: `0x${string}`, forwarderAddress: `0x${string}`, nonce: number) {

    //Create the data from your smart contract instance
    const data = receiverContract.methods.mint(wallet, BigInt(amount)).encodeABI();
    
    const domain = {
        name: "Forwarder",                      // Forwarder typed name (https://eips.ethereum.org/EIPS/eip-2771)
        version: '1',                           // Forwarder typed version (https://eips.ethereum.org/EIPS/eip-2771)
        chainId: BigInt(660279),                // XAI mainnet
        verifyingContract: forwarderAddress,    //Forwarder address
    } as const;
    const message = {
        from: wallet,                           // The user wallet (the wallet that should be msgSender in your contract)
        to: receiver,                           // The address of the contract to call the write function from
        value: BigInt(0),                       // Value has to be 0, the XAI Relayer can only sponsor transaction fees
        gas: BigInt(DEFAULT_GAS),               // The expected transaction gas costs 
        nonce: BigInt(nonce),                   // The nonce for the user on the forwarder contract (https://eips.ethereum.org/EIPS/eip-2771)
        data,                                   // The encoded function identifier to define the contract function to 
    } as const;

    const typedData = {
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            ForwardRequest: [
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "gas", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "data", type: "bytes" },
            ],
        },
        primaryType: "ForwardRequest",
        domain,
        message
    } as const;

    return typedData;
}
```

The nonce must be the latest nonce from the forwarder:

```javascript
export const getNonce = async (userWallet: string, forwarderAddress: string): Promise<number> => {
	const forwarderContract = new web3.eth.Contract(ForwarderABI, forwarderAddress);
	const nonce = await forwarderContract.methods.nonces(userWallet).call();
	return Number(nonce);
}
```

Now to sign this typedData we use the EIP-712 standard to get the signature. We use the signTypedData() from wagmi/core:

```javascript
const signature = await signTypedData(config, typedData);
```

The config in this example is our defaultWagmiConfig.

## How to forward the meta-transaction to the XAI Relayer API

Use the signed request signature and the raw request body to forward the transaction and get the transaction fee sponsored by the XAI Gas Subsidy:

```javascript
type ForwardRequest = {
    from: string;
    to: string;
    value: string;
    gas: string;
    nonce: string;
    data: string;
    signature: string;
    forwarderAddress: string;
};

const forwardTransaction = async (
    {
        typedData, // Typed data from createTypedData()
        signature, // user signature from signTypedData()
        forwarderAddress // The forwarder address used
    }:
    {
        typedData: TypedData,
        signature: string,
        forwarderAddress: string
    }
) => {

    //Create the request body from the meta-transaction object the user signed
    const requestBody: ForwardRequest = {
        from: typedData.message.from,
        to: typedData.message.to,
        value: "0",
        gas: typedData.message.gas,
        nonce: typedData.message.nonce,
        data: typedData.message.data,
        signature,
        forwarderAddress
    }

    try {
        const res = await fetch(`https://relayer.xai.games/forward/[YOUR_PROJECT_ID]`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message);
        }
        console.log("Transaction complete: ", data.txHash)

    } catch (error) {
        console.error('Error fetching data:', error);
        alert("Error sending to relayer\n" + error);
    }
}
```

The request will return the transaction hash as a success response or an error string if the transaction would fail or the user has not enough balance left for their sponsoring with your project.

You can request the users current balance from a GET request to the XAI Relayer API `https://relayer.xai.games/quota/[YOUR_PROJECT_ID]/[USER_WALLET]`
This will return the user's quota Object:

```javascript
{
    balanceWei: string;             // The remaining amount for a user that you pay for his transaction gas
    nextRefillTimestamp: number;    // The next moment the balance gets refilled
    nextRefillAmountWei: string;    // The amount of wei that gets refilled on the next refill
    lastRefillTimestamp: number;    // The last time the balance for a user got refilled
}
```

## Get ProjectID

To get the projectId you need to get in touch with XAI first, as we must create your project. After the project is successfully created you will receive your projectId. 