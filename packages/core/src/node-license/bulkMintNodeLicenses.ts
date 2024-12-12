import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Mints NodeLicense tokens in batches if the signer has enough balance and the amount is less than the maximum mint amount.
 * @param amount - The total amount of tokens to mint.
 * @param signer - The signer to interact with the contract.
 * @param promoCode - The promo code.
 * @param batchAmount - The number of tokens to mint per batch. Defaults to 175.
 * @returns An object containing an array of all minted NFT IDs, the transaction receipts, and the total price paid.
 */
export async function bulkMintNodeLicenses(
    amount: number,
    signer: ethers.Signer,
    promoCode?: string,
    batchAmount: number = 175
): Promise<{ mintedNftIds: bigint[], txReceipts: ethers.TransactionReceipt[], totalPricePaid: bigint }> {

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, signer);

    // Get the signer's provider
    const provider = signer.provider;

    // Check if the provider is defined and is an instance of ethers.providers.Provider
    if (!provider) {
        throw new Error('Signer does not have a valid provider');
    }

    // Get the signer's address
    const address = await signer.getAddress();

    // Initialize arrays to store all minted NFT IDs and transaction receipts
    const allMintedNftIds: bigint[] = [];
    const allTxReceipts: ethers.TransactionReceipt[] = [];
    let totalPricePaid = BigInt(0);

    // Calculate the number of full batches and the remaining tokens
    const fullBatches = Math.floor(amount / batchAmount);
    const remainingTokens = amount % batchAmount;

    // Function to mint a batch of tokens
    const mintBatch = async (batchSize: number) => {
        // Get the price for minting the specified batch size
        const price = await nodeLicenseContract.price(batchSize, promoCode ? promoCode : "");

        // Get the balance of the signer's address
        const balance = await provider.getBalance(address);

        // Check if the signer has enough balance
        if (balance < price) {
            throw new Error('Insufficient balance to mint the specified amount of tokens');
        }

        // Mint the tokens, passing the price as the msg.value
        const mintTx = await nodeLicenseContract.mint(batchSize, promoCode ? promoCode : "", { value: price });

        // Wait for the transaction to be mined and get the receipt
        const txReceipt = await mintTx.wait();

        // Get the "Transfer" events from the transaction receipt logs
        const transferEvents = txReceipt.logs.filter((log: ethers.Log) => log.topics[0] === ethers.id("Transfer(address,address,uint256)"));

        // Extract the mintedNftIds from the transfer events
        const mintedNftIds = transferEvents.map((event: ethers.EventLog) => {
            // Parse the event log using the contract interface
            const parsedLog = nodeLicenseContract.interface.parseLog({
                topics: [...event.topics],
                data: event.data
            });

            // Check if parsedLog is not null before accessing args
            if (parsedLog) {
                // Return the tokenId from the parsed log
                return parsedLog.args.tokenId;
            }

            // Return a default value or throw an error if parsedLog is null
            throw new Error('Failed to parse log. Please double check your transaction when through on chain.');
        });

        // Add the minted NFT IDs and transaction receipt to the arrays
        allMintedNftIds.push(...mintedNftIds);
        allTxReceipts.push(txReceipt);
        totalPricePaid += price;
    };

    // Mint full batches
    for (let i = 0; i < fullBatches; i++) {
        await mintBatch(batchAmount);
    }

    // Mint remaining tokens if any
    if (remainingTokens > 0) {
        await mintBatch(remainingTokens);
    }

    return { mintedNftIds: allMintedNftIds, txReceipts: allTxReceipts, totalPricePaid };
}
