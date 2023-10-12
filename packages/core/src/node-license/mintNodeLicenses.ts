import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Mints NodeLicense tokens if the signer has enough balance and the amount is less than the maximum mint amount.
 * @param amount - The amount of tokens to mint.
 * @param signer - The signer to interact with the contract.
 * @returns An object containing an array of minted NFT IDs, the transaction receipt, and the price paid.
 */
export async function mintNodeLicenses(
    amount: number,
    signer: ethers.Signer
): Promise<{ mintedNftIds: bigint[], txReceipt: ethers.TransactionReceipt, pricePaid: bigint }> {

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, signer);

    // Get the maximum mint amount
    const maxMintAmount = await nodeLicenseContract.MAX_MINT_AMOUNT();

    // Check if the amount is less than the maximum mint amount
    if (amount > maxMintAmount) {
        throw new Error(`Amount exceeds the maximum mint amount of ${maxMintAmount}`);
    }

    // Get the price for minting the specified amount of tokens
    const price = await nodeLicenseContract.price(amount);

    // Get the signer's provider
    const provider = signer.provider;

    // Check if the provider is defined and is an instance of ethers.providers.Provider
    if (!provider) {
        throw new Error('Signer does not have a valid provider');
    }

    // Get the signer's address
    const address = await signer.getAddress();

    // Get the balance of the signer's address
    const balance = await provider.getBalance(address)

    // Check if the signer has enough balance
    if (balance < price) {
        throw new Error('Insufficient balance to mint the specified amount of tokens');
    }

    // Mint the tokens, passing the price as the msg.value
    const mintTx = await nodeLicenseContract.mint(amount, { value: price },);
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

    return { mintedNftIds, txReceipt, pricePaid: price };
}
