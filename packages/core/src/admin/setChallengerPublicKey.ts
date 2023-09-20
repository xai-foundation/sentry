import { ethers } from "ethers";
import { config, RefereeAbi } from "..";

/**
 * Sets the challenger public key in the Referee contract.
 *
 * @param privateKey - The private key of an admin.
 * @param publicKey - The new challenger public key.
 * @returns A promise that resolves to the transaction receipt.
 */
export async function setChallengerPublicKey(signer: ethers.Signer, publicKey: string) {

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Call the setChallengerPublicKey function
    const tx = await contract.setChallengerPublicKey(publicKey);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    return receipt;
}
