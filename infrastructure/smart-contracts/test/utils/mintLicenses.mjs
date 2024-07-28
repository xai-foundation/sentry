/**
 * Mint a batch of licenses in a way that the gas limit is not exceeded.
 * @param {BigInt} amount - The amount of licenses to mint.
 * @param {Contract} nodeLicenseContract - The contract to mint the licenses from. (must have signer attached)
 * @param {Wallet} signerWallet - The signer wallet to connect to the contract.
 * @returns {Promise<BigInt[]>} - An array of minted token IDs.
 */
export const mintBatchedLicenses = async (amount, nodeLicenseContract, signerWallet) => {
    // Connect the contract to the signer wallet
    nodeLicenseContract = nodeLicenseContract.connect(signerWallet);

    // Get the current total supply to determine the starting point for new token IDs
    const startingSupply = await nodeLicenseContract.totalSupply();

    // Initialize the amount left to mint and an array to store the minted token IDs
    let amountLeft = amount;
    let mintedTokenIds = [];

    // Loop until all licenses are minted
    while (amountLeft != 0) {
        if (amountLeft > 50) {
            // Get the price for minting 50 licenses
            const price = await nodeLicenseContract.price(50, "");

            // Mint 50 licenses
            await nodeLicenseContract.mint(50, "", { value: price });

            // Add the minted token IDs to the array
            for (let i = 0; i < 50; i++) {
                mintedTokenIds.push(startingSupply + BigInt(mintedTokenIds.length) + 1n);
            }

            // Decrease the amount left to mint by 50
            amountLeft -= 50n;
        } else {
            // Get the price for minting the remaining licenses
            const price = await nodeLicenseContract.price(amountLeft, "");

            // Mint the remaining licenses
            await nodeLicenseContract.mint(amountLeft, "", { value: price });

            // Add the minted token IDs to the array
            for (let i = 0; i < amountLeft; i++) {
                mintedTokenIds.push(startingSupply + BigInt(mintedTokenIds.length) + 1n);
            }

            // Set the amount left to mint to 0
            amountLeft = 0n;
        }
    }

    // Return the array of minted token IDs
    return mintedTokenIds;
}

/**
 * Mint a single license.
 * @param {Contract} nodeLicenseContract - The contract to mint the license from. (must have signer attached)
 * @param {Wallet} signerWallet - The signer wallet to connect to the contract.
 * @returns {Promise<BigInt>} - The token ID of the minted license.
 */
export const mintSingleLicense = async (nodeLicenseContract, signerWallet) => {
    // Connect the contract to the signer wallet
    nodeLicenseContract = nodeLicenseContract.connect(signerWallet);

    // Get the current total supply to determine the new token ID
    const startingSupply = await nodeLicenseContract.totalSupply();

    // Get the price for minting a single license
    const price = await nodeLicenseContract.price(1, "");

    // Mint the license
    await nodeLicenseContract.mint(1, "", { value: price });

    // The new token ID will be the next in sequence after the starting supply
    const newTokenId = startingSupply + 1n;

    // Return the new token ID
    return newTokenId;
}
