import { ethers } from "ethers";

/**
 * @dev Calculates the number of winning keys for a bulk submission, this is a off-chain implementation of the same function inside the Referee
 * @param _keyCount Amount of keys for the bulk submission (# of keys staked in pool, or # of unstaked keys for an owner)
 * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator
 * @param _bulkAddress The Address to be used for randomize
 * @param _challengeId The ID of the challenge. Is only used for randomize
 * @param _confirmData The confirm data of the assertion.
 * @param _challengerSignedHash The signed hash for the challenge
 * @return {number} winningKeyCount Number of winning keys
 */
export const getWinningKeyCount = (keyCount: number, boostFactor: number, bulkAddress: string, challengeId: bigint, confirmData: string, challengerSignedHash: string): number => {
    if (keyCount == 0) {
        return 0;
    }

    const probability = boostFactor;

    // Create a unique seed for this submission
    const seedHash = ethers.keccak256(
        ethers.solidityPacked(
            ['address', 'uint256', 'bytes', 'bytes'],
            [bulkAddress, challengeId, confirmData, challengerSignedHash]
        )
    );
    const seed = BigInt(seedHash);

    const expectedWinningKeys = Math.floor((keyCount * probability) / 10000);

    if (expectedWinningKeys === 0) {
        const scaleFactor = 1000000;
        const scaledProbability = Math.floor((probability * scaleFactor) / 10000);
        const scaledExpectedWinningKeys = BigInt(keyCount) * BigInt(scaledProbability);

        const randomThreshold = generateRandomNumber(seed, "threshold") % BigInt(scaleFactor);

        return randomThreshold < scaledExpectedWinningKeys ? 1 : 0;
    }

    if (expectedWinningKeys > 0 && expectedWinningKeys < 4) {
        const randomThreshold = generateRandomNumber(seed, "threshold") % BigInt(1000);
        const randomFactor = generateRandomNumber(seed, "factor") % BigInt(2);

        if (randomThreshold < 300) {
            if (randomFactor === BigInt(0)) {
                return expectedWinningKeys + 1;
            } else {
                return expectedWinningKeys - 1;
            }
        } else {
            return expectedWinningKeys;
        }
    }

    const maxAdjustmentPercentage = 30;

    const randomFactor1 = generateRandomNumber(seed, "factor1") % BigInt(1000);
    const randomFactor2 = generateRandomNumber(seed, "factor2") % BigInt(2);

    const adjustmentPercentage = Number((randomFactor1 * BigInt(maxAdjustmentPercentage)) / BigInt(1000));
    const adjustment = Math.floor((expectedWinningKeys * adjustmentPercentage) / 100);

    let winningKeyCount;
    if (randomFactor2 % BigInt(2) === BigInt(0)) {
        winningKeyCount = expectedWinningKeys + adjustment;
    } else {
        winningKeyCount = expectedWinningKeys > adjustment ? expectedWinningKeys - adjustment : 0;
    }

    return winningKeyCount;
}

function generateRandomNumber(seed: bigint, suffix: string) {
    return BigInt(ethers.keccak256(ethers.solidityPacked(['uint256', 'string'], [seed, suffix])));
}