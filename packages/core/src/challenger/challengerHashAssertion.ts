import { bls12_381 as bls } from '@noble/curves/bls12-381';
import * as ethers from "ethers";

/**
 * Signs a message composed of several parts with a BLS secret key and returns the signature in hexadecimal format.
 * The message is composed of an assertion ID, its predecessor's ID, a state root, and a timestamp.
 * The message is ABI-encoded using ethers.js before signing.
 *
 * @param challengerBlsSecretKey - The BLS secret key of the challenger in hexadecimal format.
 * @param assertionId - The ID of the assertion.
 * @param predecessorAssertionId - The ID of the predecessor assertion.
 * @param confirmData - The confirm data.
 * @param assertionTimestamp - The timestamp of the assertion.
 * @returns The signature of the ABI-encoded message in hexadecimal format.
 */
export async function challengerHashAssertion(
    challengerBlsSecretKey: string,
    assertionId: BigInt,
    predecessorAssertionId: BigInt,
    confirmData: string,
    assertionTimestamp: BigInt
): Promise<string> {
    const message = ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint64', 'uint64', 'bytes32', 'uint64'],
        [assertionId, predecessorAssertionId, confirmData, assertionTimestamp]
    );
    const messageHash = ethers.keccak256(message);
    const validMessageHash = messageHash.startsWith('0x') ? messageHash.slice(2) : messageHash;
    const keyBuffer = Buffer.from(challengerBlsSecretKey, 'hex');
    const hexKey = keyBuffer.toString('hex');
    const signature = await bls.sign(validMessageHash, hexKey);
    return "0x" + Buffer.from(signature).toString('hex');
}