import { challengerHashAssertion } from './challengerHashAssertion.js';
import { ethers } from 'ethers';
import { AssertionNode } from '../utils/getAssertion.js';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Submits an assertion to the Referee contract.
 * @param {string} challengerBlsSecretKey - The BLS secret key of the challenger in hexadecimal format.
 * @param {number} assertionId - The ID of the assertion to be submitted.
 * @param {number} previousAssertionId - The ID of the previous assertion in the chain.
 * @param {string} confirmData - The confirmation data of the assertion.
 * @param {BigInt} createdAtBlock - The block number at which the assertion was created.
 * @param {ethers.Signer} signer - The signer to interact with the contract, typically the wallet of the user submitting the assertion.
 * @returns {Promise<void>} A promise that resolves when the transaction is successfully sent to the blockchain.
 */
export async function submitAssertionToReferee(
    challengerBlsSecretKey: string,
    assertionId: number,
    previousAssertionId: number,
    confirmData: string,
    createdAtBlock: BigInt,
    signer: ethers.Signer
): Promise<void> {

    // Hash the assertion using the challenger's BLS secret key and assertion details
    const assertionHash: string = await challengerHashAssertion(
        challengerBlsSecretKey,
        BigInt(assertionId),
        BigInt(previousAssertionId),
        confirmData,
        createdAtBlock
    );

    // Create an instance of the Referee contract using the provided signer
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Submit the challenge to the Referee contract with the generated assertion hash and other required data
    await refereeContract.submitChallenge(
        assertionId,
        previousAssertionId,
        confirmData,
        createdAtBlock,
        assertionHash
    );
}