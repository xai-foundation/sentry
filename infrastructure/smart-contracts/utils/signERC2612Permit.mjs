import HDWalletProvider from "@truffle/hdwallet-provider";


// Create a map to store the localKeyProvider
const localKeyProviderMap = new Map();

/**
 * Signs an ERC2612 permit using the provided parameters.
 * 
 * @param {string} verifyingContract - The contract to verify.
 * @param {number} chainId - The ID of the blockchain network.
 * @param {string} user - The address of the user.
 * @param {bigint} amount - The amount to permit.
 * @param {string} mnemonic - The mnemonic of the wallet.
 * @param {number} index - The index of the wallet.
 * @param {object} signer - The signer from ethers.
 * @param {number} noncePerRun - The nonce per run.
 * @param {string} claimContractName - The name of the claim contract.
 * 
 * @returns {Promise<object>} A promise that resolves to an object containing the signature.
 */
export async function signERC2612Permit(
    verifyingContract,
    chainId,
    user,
    amount,
    mnemonic,
    index,
    signer,
    noncePerRun,
    claimContractName
){

    // Create a key for the map
    const key = `${mnemonic}-${index}-${hre.network.config.url}`;

    // Check if the localKeyProvider already exists in the map
    if (!localKeyProviderMap.has(key)) {
        // Create localKeyProvider
        const localKeyProvider = new HDWalletProvider({
            mnemonic: {
                phrase: mnemonic
            },
            providerOrUrl: hre.network.config.url,
            numberOfAddresses: 1,
            addressIndex: index
        });

        // Store the localKeyProvider in the map
        localKeyProviderMap.set(key, localKeyProvider);
    }

    // Get the localKeyProvider from the map
    const localKeyProvider = localKeyProviderMap.get(key);

    // Get the wallet address
    const walletAddress = localKeyProvider.getAddresses()[0];

    // Check if the wallet address matches the signer address
    if (walletAddress.toLowerCase() !== signer.address.toLowerCase()) {
        throw new Error("The wallet address does not match the signer address");
    }

    const message = {
        user,
        amount: amount.toString(),
        nonce: noncePerRun
    };

    const domain = { name: claimContractName, version: '1', chainId: chainId.toString(), verifyingContract };

    const typedData = {
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            Permit: [
                { name: "user", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "nonce", type: "uint256" }
            ],
        },
        primaryType: "Permit",
        domain,
        message,
    };

    const payload = {
        id: Math.floor(Math.random() * 10000000000),
        method: 'eth_signTypedData_v4',
        params: [walletAddress, JSON.stringify(typedData)],
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
                    r: result.result.slice(0, 66),
                    s: '0x' + result.result.slice(66, 130),
                    v: parseInt(result.result.slice(130, 132), 16),
                });
                localKeyProvider.engine.stop();
            }
        };
        localKeyProvider.sendAsync(payload, callback);
    });
};
