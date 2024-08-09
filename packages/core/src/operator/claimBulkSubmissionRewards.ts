import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { retry } from '../index.js';

/**
 * Claims submission rewards for a list of pools from the Referee contract.
 * @param pools - An array of pool addresses.
 * @param challengeNumber - The challenge number.
 * @param signer - The signer to interact with the contract.
 * @param logger - A logger function to log progress.
 * @returns The number of rewards successfully claimed.
 */
export async function claimBulkSubmissionRewards(
    bulkAddresses: string[],
    challengeNumber: bigint,
    signer: ethers.Signer,
    logger: (log: string) => void
): Promise<number> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    let successfulClaims = 0;

    for (const address of bulkAddresses) {
        try {
            // Retry claiming the submission reward for each pool up to 3 times
            await retry(() => refereeContract.claimBulkRewards(
                address,
                challengeNumber
            ), 3);

            // Log success for the current pool
            logger(`Successfully claimed bulk submission reward for: ${address}`);
            successfulClaims++;
        } catch (error) {
            // Log error for the current pool
            logger(`Failed to claim bulk submission reward for: ${address}, Error: ${error}`);
        }
    }

    return successfulClaims;
}
