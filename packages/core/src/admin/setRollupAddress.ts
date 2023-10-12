import { ethers } from "ethers";
import { config, RefereeAbi } from "../index.js";

/**
 * Sets the rollup address in the Referee contract.
 *
 * @param signer - The ethers.js signer to use.
 * @param rollupAddress - The new rollup address.
 * @returns A promise that resolves to the transaction receipt.
 */
export async function setRollupAddress(signer: ethers.Signer, rollupAddress: string) {

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Call the setRollupAddress function
    const tx = await contract.setRollupAddress(rollupAddress);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    return receipt;
}
