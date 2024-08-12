import hardhat from "hardhat";
const { ethers } = hardhat;

export function getWinningKeyCountLocal(keyCount, boostFactor, bulkAddress, challengeId, confirmData, challengerSignedHash) {
    if (keyCount <= 0) throw new Error("Error: Key Count Must Be Greater Than 0.");
    if (boostFactor <= 0) throw new Error("Error: Boost factor must be greater than zero.");

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

    if(expectedWinningKeys > 0 && expectedWinningKeys < 4) {
        const randomThreshold = generateRandomNumber(seed, "threshold") % BigInt(1000);
        const randomFactor = generateRandomNumber(seed, "factor") % BigInt(2);
        
        if(randomThreshold < 300){
            if(randomFactor === BigInt(0)){
                return expectedWinningKeys + 1;
            }else{
                return expectedWinningKeys - 1;
            }
        }else{
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

function generateRandomNumber(seed, suffix) {
    return BigInt(ethers.keccak256(ethers.solidityPacked(['uint256', 'string'], [seed, suffix])));
}

// Example usage:
// const result = getWinningKeyCount(100, 200, '0x1234...', 123456, '0x5678...', '0x9ABC...');
// console.log(result);