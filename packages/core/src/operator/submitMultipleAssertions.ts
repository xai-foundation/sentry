import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { retry } from '../index.js';

/**
 * Submits an assertion to the Referee contract for multiple keys.
 * @param nodeLicenseId - The ID of the NodeLicense.
 * @param challengeId - The ID of the challenge.
 * @param successorConfirmData - The successor confirm data.
 * @param signer - The signer to interact with the contract.
 */
export async function submitMultipleAssertions(
    nodeLicenseIds: bigint[],
    challengeId: bigint,
    successorConfirmData: string,
    signer: ethers.Signer,
    logger: (message: string) => void
): Promise<void[]> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    const BATCH_SIZE = 50;

    const promises: Promise<void>[] = []

    //Break up keys in batches of 50
    for (let i = 0; i < nodeLicenseIds.length; i += BATCH_SIZE) {
        const batch = nodeLicenseIds.slice(i, i + BATCH_SIZE);

        // Submit the assertion to the Referee contract
        promises.push(retry(() => refereeContract.submitMultipleAssertions(
            batch,
            challengeId,
            successorConfirmData
        ), 3));

        logger(`Submitted batch for keys ${batch.map(k => k.toString()).join(", ")}`);
    }

    return Promise.all(promises);
}
