import { ethers } from "ethers";
import { config, RefereeAbi } from "..";

/**
 * Toggles the assertion checking in the Referee contract.
 *
 * @param signer - The ethers.js signer to use.
 * @returns A promise that resolves to the transaction receipt.
 */
export async function toggleAssertionChecking(signer: ethers.Signer) {

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Call the toggleAssertionChecking function
    const tx = await contract.toggleAssertionChecking();

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    return receipt;
}
