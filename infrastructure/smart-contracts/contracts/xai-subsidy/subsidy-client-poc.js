const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");

const XAI_FORWARDER_ADDRESS = "0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99";
const XAI_CHAIN_ID = 1;

const RECEIVER_CONTRACT = "0xEc29164D68c4992cEdd1D386118A47143fdcF142"; //Test contract on ARB Sepolia
//Is only relevant for localKeyProvider / HDWalletProvider initialization, for production, it won't matter what RPC URL is used here 

const testSignMetaTX = async (
    forwardRequest,
    signerWallet,
    localKeyProvider
) => {

    const domain = {
        name: "Forwarder",
        version: '1',
        chainId: XAI_CHAIN_ID,
        verifyingContract: XAI_FORWARDER_ADDRESS,
    };

    const message = {
        from: forwardRequest.from,
        to: forwardRequest.to,
        value: "0",
        gas: forwardRequest.gas,
        nonce: forwardRequest.nonce,
        data: new Web3().utils.sha3(forwardRequest.data), //Important to hash the data field
    };

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
        message: message,
    };


    console.log("TypedData:", typedData);

    const payload = {
        id: Math.floor(Math.random() * 10000000000),
        method: 'eth_signTypedData_v4',
        params: [signerWallet.address, JSON.stringify(typedData)],
    };

    return new Promise((resolve, reject) => {
        const callback = (err, result) => {
            if (err) {
                reject(err);
                localKeyProvider.engine.stop();
            } else if (result.error) {
                console.error(result.error);
                reject(result.error);
                localKeyProvider.engine.stop();
            } else {
                resolve({
                    signature: result.result
                });
                localKeyProvider.engine.stop();
            }
        };
        localKeyProvider.sendAsync(payload, callback);
    });
};

const main = async () => {

    try {
        const RPC_URL = "https://xai-chain.net/rpc";
        let web3 = new Web3(RPC_URL);
        const SIGNER_PRIVATEKEY = "0xa6f1456af5a8e29446b1a140576a13e17dbabfda70fa893a06fa604ec52fae63";

        const signerWallet = web3.eth.accounts.privateKeyToAccount(SIGNER_PRIVATEKEY);
        console.log("SIGNER PUBKEY", signerWallet.address);

        const localKeyProvider = new HDWalletProvider({
            privateKeys: [SIGNER_PRIVATEKEY.substring(2)],
            providerOrUrl: RPC_URL,
        });

        // Function signature
        const functionObject = {
            "inputs": [],
            "name": "increaseCounter",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        };

        // Encode function signature to get function selector (bytes)
        const data = web3.eth.abi.encodeFunctionCall(functionObject, []);

        const forwardRequest = {
            from: signerWallet.address,
            to: RECEIVER_CONTRACT,
            gas: "1000000",
            nonce: "0", //TODO get nonce from forwarder
            data: data,
        };

        const signature = await testSignMetaTX(forwardRequest, signerWallet, localKeyProvider);

        console.log("Done", signature);

    } catch (ex) {
        console.error("Failed to sign locally", ex);
    }
};


main();