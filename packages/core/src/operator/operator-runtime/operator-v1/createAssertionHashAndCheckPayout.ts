import { ethers } from "ethers";


/**
 * @notice Creates an assertion hash and determines if the hash payout is below the threshold - this is the same function as in the Referee contract
 * @param nodeLicenseId The ID of the NodeLicense.
 * @param challengeId The ID of the challenge.
 * @param boostFactor The factor controlling the chance of eligibility for payout as a multiplicator (base chance is 1/100 - Example: _boostFactor 2 will double the payout chance to 1/50, _boostFactor 16 maps to 1/6.25).
 * @param confirmData The confirm hash, will change to assertionState after BOLD.
 * @param challengerSignedHash The signed hash for the challenge
 * @return {[boolean, string]} a boolean indicating if the hash is eligible, and the assertionHash.
 */
export const createAssertionHashAndCheckPayout_V1 = (nodeLicenseId: bigint, challengeId: bigint, boostFactor: bigint, confirmData: string, challengerSignedHash: string): [boolean, string] => {
    const assertionHash = ethers.keccak256(ethers.solidityPacked(["uint256", "uint256", "bytes", "bytes"], [nodeLicenseId, challengeId, confirmData, challengerSignedHash]));
    return [Number((BigInt(assertionHash) % BigInt(10_000))) < Number(boostFactor), assertionHash];
}