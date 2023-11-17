import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Claims a reward for a successful assertion.
 * @param nodeLicenseId - The ID of the NodeLicense.
 * @param challengeId - The ID of the challenge.
 * @param signer - The signer to interact with the contract.
 */
export async function claimReward(
    nodeLicenseId: bigint,
    challengeId: bigint,
    signer: ethers.Signer
): Promise<void> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Claim the reward from the Referee contract
    await refereeContract.claimReward(
        nodeLicenseId,
        challengeId
    );
}