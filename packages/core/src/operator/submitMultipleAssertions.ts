import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { retry } from '../index.js';

/**
 * Submits an assertion to the Referee contract for multiple keys.
 * @param nodeLicenseId - The ID of the NodeLicense.
 * @param challengeId - The ID of the challenge.
 * @param successorConfirmData - The successor confirm data.
 * @param keysPerBatch - The number of keys we claim for per batched transaction.
 * @param signer - The signer to interact with the contract.
 */
export async function submitMultipleAssertions(
    nodeLicenseIds: bigint[],
    challengeId: bigint,
    successorConfirmData: string,
    keysPerBatch: number = 100,
    signer: ethers.Signer,
    logger: (message: string) => void
): Promise<void> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    const BATCH_SIZE = keysPerBatch;

    //Break up keys in batches of BATCH_SIZE
    for (let i = 0; i < nodeLicenseIds.length; i += BATCH_SIZE) {
        const batch = nodeLicenseIds.slice(i, i + BATCH_SIZE);

        // Submit the assertion to the Referee contract
        await retry(() => refereeContract.submitMultipleAssertions(
            batch,
            challengeId,
            successorConfirmData
        ), 3)
            .then(() => {
                logger(`Submitted batch assertion for challenge ${challengeId.toString()} for keys ${batch.map(k => k.toString()).join(", ")}`);
            })
            .catch((error) => {
                logger(`Error on batch assertion for challenge ${challengeId.toString()} for keys ${batch.map(k => k.toString()).join(", ")} ${error}`);
            })
    }
}
