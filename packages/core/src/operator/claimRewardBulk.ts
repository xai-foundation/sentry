import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { retry } from '../index.js';

/**
 * Claims rewards for multiple successful assertions.
 * @param nodeLicenseIds - The IDs of the NodeLicenses.
 * @param challengeId - The ID of the challenge.
 * @param claimForAddressInBatch - The address to claim rewards for in the batch.
 * @param keysPerBatch - The number of keys we claim for per batched transaction.
 * @param signer - The signer to interact with the contract.
 */
export async function claimRewardsBulk(
    nodeLicenseIds: bigint[],
    challengeId: bigint,
    claimForAddressInBatch: string,
    keysPerBatch: number = 100,
    signer: ethers.Signer,
    logger: (message: string) => void
): Promise<void> {
    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    const BATCH_SIZE = keysPerBatch;

    // Convert BigInts to strings for the contract call
    const challengeIdStr = challengeId.toString();

    //Break up keys in batches of BATCH_SIZE
    for (let i = 0; i < nodeLicenseIds.length; i += BATCH_SIZE) {
        const batch = nodeLicenseIds.slice(i, i + BATCH_SIZE);
        const nodeLicenseIdsStr = batch.map(id => id.toString());

        // Submit the assertion to the Referee contract
        await retry(() => refereeContract.claimMultipleRewards(
            nodeLicenseIdsStr,
            challengeIdStr,
            claimForAddressInBatch
        ), 3)
            .then(() => {
                logger(`Submitted batch claim for challenge ${challengeId.toString()} for keys ${batch.map(k => k.toString()).join(", ")}`);
            })
            .catch((error) => {
                logger(`Error on batch claim for challenge ${challengeId.toString()} for keys ${batch.map(k => k.toString()).join(", ")} ${error}`);
            })

    }
}
