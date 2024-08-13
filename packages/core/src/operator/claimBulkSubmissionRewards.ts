import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { retry } from '../index.js';

/**
 * Claims submission rewards for a list of pools from the Referee contract.
 * @param bulkAddresses - List of addresses to claim for
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
            //Try once to catch the already claimed error, else try again
            await refereeContract.claimBulkRewards(
                address,
                challengeNumber
            );
            logger(`Successfully claimed bulk submission reward for: ${address}`);
            successfulClaims++;
            continue;

        } catch (error: any) {

            if (error && error.message && error.message.includes('execution reverted: "58"')) {
                // If error code is 58, we don't need to log the error, it just means for this pool we already claimed
                successfulClaims++;
                continue;
            }
        }

        try {
            // Retry claiming the submission reward for each pool up to 2 more times
            await retry(() => refereeContract.claimBulkRewards(
                address,
                challengeNumber
            ), 2);

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
