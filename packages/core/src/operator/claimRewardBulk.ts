import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Claims rewards for multiple successful assertions.
 * @param nodeLicenseIds - The IDs of the NodeLicenses.
 * @param challengeId - The ID of the challenge.
 * @param claimForAddressInBatch - The address to claim rewards for in the batch.
 * @param signer - The signer to interact with the contract.
 */
export async function claimRewardsBulk(
    nodeLicenseIds: bigint[],
    challengeId: bigint,
    claimForAddressInBatch: string,
    signer: ethers.Signer
): Promise<void> {
    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Convert BigInts to strings for the contract call
    const nodeLicenseIdsStr = nodeLicenseIds.map(id => id.toString());
    const challengeIdStr = challengeId.toString();

    // Claim the rewards from the Referee contract for multiple NodeLicenses
    await refereeContract.claimMultipleRewards(
        nodeLicenseIdsStr,
        challengeIdStr,
        claimForAddressInBatch
    );
}
