import { challengerHashAssertion } from './challengerHashAssertion.js';
import { ethers } from 'ethers';
import { AssertionNode } from '../utils/getAssertion.js';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getMultipleChallengeConfirmData } from '../utils/getMultipleChallengeConfirmData.js';

/**
 * Submits an assertion to the Referee contract.
 * @param challengerBlsSecretKey - The BLS secret key of the challenger in hexadecimal format.
 * @param assertionId - The ID of the assertion.
 * @param predecessorAssertionId - The ID of the predecessor assertion.
 * @param refereeContractAddress - The address of the Referee contract.
 * @param signer - The signer to interact with the contract.
 */
export async function submitAssertionToReferee(
    challengerBlsSecretKey: string,
    assertionId: number,
    assertionNode: AssertionNode,
    signer: ethers.Signer,
    lastSubmittedAssertionId: BigInt
): Promise<void> {

    // Get the assertion node for the current challenge
    const assertionIdGap = assertionId -  Number(lastSubmittedAssertionId);

    const isBatch = assertionIdGap > 1;

    let finalConfirmData = assertionNode.confirmData;  
    
    if(isBatch) {

        // Get the assertion IDs for the batch
        const assertionIds = [...Array(assertionIdGap).keys()].map(i => i + Number(lastSubmittedAssertionId) + 1);

        // Get the confirm data for all of the assertions
        const [_, confirmDataHash] = await getMultipleChallengeConfirmData(assertionIds);

        finalConfirmData = confirmDataHash;
    }

    // Hash the assertion
    const assertionHash: string = await challengerHashAssertion(
        challengerBlsSecretKey,
        BigInt(assertionId),
        lastSubmittedAssertionId,
        finalConfirmData,
        assertionNode.createdAtBlock
    );

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Submit the challenge to the Referee contract
    await refereeContract.submitChallenge(
        assertionId,
        lastSubmittedAssertionId,
        finalConfirmData,
        Number(assertionNode.createdAtBlock),
        assertionHash
    );
}

