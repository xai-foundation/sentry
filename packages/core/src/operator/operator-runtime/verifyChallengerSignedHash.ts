import { bls12_381 as bls } from '@noble/curves/bls12-381';
import * as ethers from "ethers";

/**
 * Verifies a BLS signature for a message composed of several parts.
 * The message is composed of an assertion ID, its predecessor's ID, a state root, and a timestamp.
 * The message is ABI-encoded using ethers.js before verification.
 *
 * @param publicKey - The BLS public key of the signer in hexadecimal format.
 * @param assertionId - The ID of the assertion.
 * @param predecessorAssertionId - The ID of the predecessor assertion.
 * @param confirmData - The confirm data.
 * @param assertionTimestamp - The timestamp of the assertion.
 * @param signature - The signature to verify, in hexadecimal format.
 * @returns A boolean indicating whether the signature is valid.
 * @throws Will throw an error if the verification process fails.
 */
export function verifyChallengerSignedHash(
  publicKey: string,
  assertionId: BigInt,
  predecessorAssertionId: BigInt,
  confirmData: string,
  assertionTimestamp: BigInt,
  signature: string
): boolean {
  try {

    // Compose and encode the message
    const message = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint64', 'uint64', 'bytes32', 'uint64'],
      [assertionId, predecessorAssertionId, confirmData, assertionTimestamp]
    );

    const messageHash = ethers.keccak256(message);                                                                            // Hash the message  
    const validMessageHash = messageHash.startsWith('0x') ? messageHash.slice(2) : messageHash;                               // Remove the '0x' prefix

    const signatureBytes = Uint8Array.from(Buffer.from(signature.startsWith('0x') ? signature.slice(2) : signature, 'hex'));  // Convert the signature from hex to Uint8Array
    const publicKeyBytes = Uint8Array.from(Buffer.from(publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey, 'hex'));  // Convert the public key from hex to Uint8Array

    const isValid = bls.verify(signatureBytes, validMessageHash, publicKeyBytes);                                                 // Verify the signature

    return isValid;
  } catch (error) {
    console.error('Error verifying BLS signature:', error);
    return false;
  }
}