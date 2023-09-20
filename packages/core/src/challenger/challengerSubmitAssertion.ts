import { challengerHashAssertion } from './challengerHashAssertion';
import { ethers } from 'ethers';
import { AssertionNode } from '../utils/getAssertion';
import { RefereeAbi } from '../abis';
import { config } from '../config';

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
    signer: ethers.Signer
): Promise<void> {

    // Hash the assertion
    const assertionHash: string = await challengerHashAssertion(
        challengerBlsSecretKey,
        BigInt(assertionId),
        assertionNode.prevNum,
        assertionNode.stateHash,
        assertionNode.createdAtBlock
    );

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Submit the challenge to the Referee contract
    await refereeContract.submitChallenge(
        assertionId,
        assertionNode.prevNum,
        assertionNode.stateHash,
        Number(assertionNode.createdAtBlock),
        assertionHash
    );
}

