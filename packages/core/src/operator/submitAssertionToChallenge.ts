import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Submits an assertion to the Referee contract.
 * @param nodeLicenseId - The ID of the NodeLicense.
 * @param challengeId - The ID of the challenge.
 * @param successorConfirmData - The successor confirm data.
 * @param signer - The signer to interact with the contract.
 */
export async function submitAssertionToChallenge(
    nodeLicenseId: bigint,
    challengeId: bigint,
    successorConfirmData: string,
    signer: ethers.Signer
): Promise<void> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Submit the assertion to the Referee contract
    await refereeContract.submitAssertionToChallenge(
        nodeLicenseId,
        challengeId,
        successorConfirmData
    );
}
