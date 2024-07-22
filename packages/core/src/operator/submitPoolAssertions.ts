import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { retry } from '../index.js';

/**
 * Submits assertions for a list of pools to the Referee contract.
 * @param pools - An array of pool addresses.
 * @param challengeNumber - The challenge number.
 * @param successorConfirmData - The successor confirm data.
 * @param signer - The signer to interact with the contract.
 * @param logger - A logger function to log progress.
 * @returns The number of assertions successfully submitted.
 */
export async function submitPoolAssertions(
    pools: string[],
    challengeNumber: bigint,
    successorConfirmData: string,
    signer: ethers.Signer,
    logger: (log: string) => void
): Promise<number> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    let successfulSubmissions = 0;

    for (const pool of pools) {
        try {
            // Retry submitting the assertion to the Referee contract for each pool up to 3 times
            await retry(() => refereeContract.submitPoolAssertion(
                pool,
                challengeNumber,
                successorConfirmData
            ), 3);

            // Log success for the current pool
            logger(`Successfully submitted assertion for pool: ${pool}`);
            successfulSubmissions++;
        } catch (error) {
            // Log error for the current pool
            logger(`Failed to submit assertion for pool: ${pool}, Error: ${error}`);
        }
    }

    return successfulSubmissions;
}
