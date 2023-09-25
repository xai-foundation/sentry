import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis';
import { config } from '../config';

/**
 * Mints NodeLicense tokens if the signer has enough balance and the amount is less than the maximum mint amount.
 * @param amount - The amount of tokens to mint.
 * @param signer - The signer to interact with the contract.
 * @returns An array of minted NFT IDs and the transaction receipt.
 */
export async function mintNodeLicenses(
    amount: number,
    signer: ethers.Signer
): Promise<{ mintedNftIds: number[], txReceipt: ethers.TransactionReceipt }> {

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
    const mintTx = await nodeLicenseContract.mint({ value: price }, amount);

    // Wait for the transaction to be mined and get the receipt
    const txReceipt = await mintTx.wait();

    // Get the minted NFT IDs from the "Transfer" events in the transaction receipt
    const mintedNftIds = txReceipt.events
        ?.map((event: ethers.Log) => nodeLicenseContract.interface.parseLog({
            ...event,
            topics: [...event.topics],
        }))
        .filter((event: ethers.LogDescription) => event.name === 'Transfer')
        .map((event: ethers.LogDescription) => event.args?.tokenId.toNumber()) ?? [];

    return { mintedNftIds, txReceipt };
}
