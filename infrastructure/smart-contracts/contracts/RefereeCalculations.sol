// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract RefereeCalculations is Initializable, AccessControlUpgradeable {
    using Math for uint256;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    function initialize() public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Calculate the emission and tier for a challenge.
     * @dev This function uses a halving formula to determine the emission tier and challenge emission.
     * The formula is as follows:
     * 1. Start with the max supply divided by 2 as the initial emission tier.
     * 2. The challenge emission is the emission tier divided by 17520.
     * 3. While the total supply is less than the emission tier, halve the emission tier and challenge emission.
     * 4. The function returns the challenge emission and the emission tier.
     *
     * @param totalSupply The current total supply of tokens.
     * @param maxSupply The maximum supply of tokens.
     * @return uint256 The challenge emission.
     * @return uint256 The emission tier.
     */
    function calculateChallengeEmissionAndTier(
        uint256 totalSupply,
        uint256 maxSupply
    ) public pure returns (uint256, uint256) {
        require(maxSupply > totalSupply, "5");

        uint256 tier = Math.log2(maxSupply / (maxSupply - totalSupply)); // calculate which tier we are in starting from 0
        require(tier <= 23, "6");

        uint256 emissionTier = maxSupply / (2 ** (tier + 1)); // equal to the amount of tokens that are emitted during this tier

        // determine what the size of the emission is based on each challenge having an estimated static length
        return (emissionTier / 17520, emissionTier);
    }

    /**
     * @dev Calculates the number of winning keys for a bulk submission.
     * @notice This function determines the winning key count based on the boost factor and the number of keys,
     * with a random adjustment.
     * @param _keyCount Amount of keys for the bulk submission (# of keys staked in pool, or # of unstaked keys for an owner)
     * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator
     * @param _bulkAddress The Address to be used for randomize
     * @param _challengeId The ID of the challenge. Is only used for randomize
     * @param _confirmData The confirm data of the assertion.
     * @param _challengerSignedHash The signed hash for the challenge
     * @return winningKeyCount Number of winning keys
     */
    function getWinningKeyCount(
        uint256 _keyCount,
        uint256 _boostFactor,
        address _bulkAddress,
        uint256 _challengeId,
        bytes memory _confirmData,
        bytes memory _challengerSignedHash
    ) public pure returns (uint256 winningKeyCount) {
        // We first check to confirm the bulk submission has some keys and the boost factor is valid.
        require(_keyCount > 0, "Error: Key Count Must Be Greater Than 0.");
        require(
            _boostFactor > 0,
            "Error: Boost factor must be greater than zero."
        );

        // The submission's chance of winning is based on the bonus (boost factor) 100 = 1% per key.
        uint256 probability = _boostFactor;

        // We create a unique, random number for this specific submission
        // This ensures that each challenge is unpredictable and fair.
        bytes32 seedHash = keccak256(
            abi.encodePacked(
                _bulkAddress,
                _challengeId,
                _confirmData,
                _challengerSignedHash
            )
        );
        uint256 seed = uint256(seedHash);

        // First, we calculate the expected number of winning keys based on the (key count) and boost factor (probability).
        uint256 expectedWinningKeys = (_keyCount * probability) / 10_000;

        if (expectedWinningKeys == 0) {
            // We use a large number (1,000,000) to help us calculate very small probabilities accurately.
            uint256 scaleFactor = 1_000_000;

            // We scale the probability by multiplying it with scaleFactor and then dividing by 10,000.
            // This helps in handling small decimal values accurately without losing precision.
            uint256 scaledProbability = (probability * scaleFactor) / 10_000;

            // We calculate the expected number of winning keys, but we scale it up by multiplying with scaledProbability.
            // This scaling helps in better accuracy while dealing with very small probabilities.
            uint256 scaledExpectedWinningKeys = (_keyCount * scaledProbability);

            // We generate a random number between 0 and 999,999.
            // The random number is generated using the keccak256 hash function.
            // We combine the seed with the string "threshold" to create a unique input for the hash function.
            // This ensures that the random number is different each time based on the unique inputs.
            uint256 randomThreshold = uint256(
                keccak256(abi.encodePacked(seed, "threshold"))
            ) % scaleFactor;

            // We compare the random number (randomThreshold) with the scaled expected winning keys (scaledExpectedWinningKeys).
            // If the random number is less than the scaled expected winning keys, it means the submission wins.
            // This method allows for fair distribution even with very low probabilities.
            // It ensures that there is a small but fair chance for the submission to win a reward.
            return randomThreshold < scaledExpectedWinningKeys ? 1 : 0;
        }

        if (expectedWinningKeys > 0 && expectedWinningKeys < 4) {
            // To introduce variance and unpredictability in cases where the expected number of winning keys
            // is low (between 1 and 3), we add a conditional adjustment to the key count.

            // We generate a random number between 0 and 999.
            // The random number is generated using the keccak256 hash function.
            // We combine the seed with the string "threshold" to create a unique input for the hash function.
            // This ensures that the random number is different each time based on the unique inputs.
            uint256 randomThreshold = uint256(
                keccak256(abi.encodePacked(seed, "threshold"))
            ) % 1000;

            // We introduce variability when the expected winning keys are in the range [1, 3].
            // We do this by checking if the generated random number is less than 300 (i.e., 30% of the time).
            // If this condition is met, we proceed to adjust the winning key count by either adding or subtracting 1.
            if (randomThreshold < 300) {
                // We generate another random number between 0 and 1.
                // This number will determine whether we increase or decrease the expected winning keys.
                // As before, we use the keccak256 hash function, but with a different unique input string ("factor").
                // This ensures further randomness and unpredictability in the outcome.
                uint256 randomFactor = uint256(
                    keccak256(abi.encodePacked(seed, "factor"))
                ) % 2;

                // If the generated random number (randomFactor) is 0, we add 1 to the expected number of winning keys.
                // This increases the variability of the outcome, making the results more dynamic.
                // If the randomFactor is 1, we subtract 1 from the expected number of winning keys.
                // This reduction ensures that there is a balanced chance for the outcome to swing in either direction.
                // The goal is to prevent deterministic results and keep the game engaging and fair.
                return randomFactor == 0 ? expectedWinningKeys + 1 : expectedWinningKeys - 1;
            }
        }


        // If we didn't enter the above block or if randomThreshold >= 300,
        // we continue with the rest of the function to determine the winning key count.

        // For larger probabilities, we use a different method.
        // This part of the code handles scenarios where we expect at least a single winning key.
        // We want to add some variability to the winning key count to make each challenge more exciting and less predictable.

        /**
         * Explanation:
         * - `expectedWinningKeys` is calculated by multiplying the number of staked keys by the probability, and then dividing by 10,000.
         * - This gives us the baseline number of winning keys that the bulk submission should receive based on the key count and boost factor.
         */

        // We then add some variability.
        // The variability is based on the boost factor, with lower boost factors having higher variability.
        uint256 baseVariability = 30 + (1000 / _boostFactor);

        /**
         * Explanation:
         * - `baseVariability` is calculated by adding 30 to the result of 1000 divided by the boost factor.
         * - This means that players with a lower boost factor will have higher variability in their rewards.
         * - This helps to balance the game by giving more variability to players with lower bonuses.
         */

        uint256 maxAdjustmentPercentage = baseVariability > 30
            ? 30
            : baseVariability;

        /**
         * Explanation:
         * - `maxAdjustmentPercentage` is set to the lesser of `baseVariability` or 30.
         * - This means that the maximum adjustment to the rewards will be capped at 30%.
         * - Capping the adjustment percentage ensures that the rewards do not fluctuate too wildly, keeping things balanced and fair.
         */

        // We generate two more random numbers to determine how much to adjust the rewards.
        uint256 randomFactor1 = uint256(
            keccak256(abi.encodePacked(seed, "factor1"))
        ) % 1000;
        uint256 randomFactor2 = uint256(
            keccak256(abi.encodePacked(seed, "factor2"))
        ) % 2;

        /**
         * Explanation:
         * - We generate two random numbers using the keccak256 hash function with different unique inputs ("factor1" and "factor2").
         * - `randomFactor1` is a random number between 0 and 999, and it helps determine the adjustment percentage.
         * - `randomFactor2` is a random number between 0 and 1, and it helps decide whether to increase or decrease the rewards.
         * - Using these random factors introduces variability and unpredictability to the rewards.
         */

        // We calculate the exact amount to adjust the rewards.
        uint256 adjustmentPercentage = (randomFactor1 *
            maxAdjustmentPercentage) / 1000;
        uint256 adjustment = (expectedWinningKeys * adjustmentPercentage) / 100;

        /**
         * Explanation:
         * - `adjustmentPercentage` is calculated by multiplying `randomFactor1` with `maxAdjustmentPercentage`, and then dividing by 1000.
         * - This gives us a random percentage (up to the maximum adjustment percentage) by which we will adjust the rewards.
         * - `adjustment` is the actual amount by which we will adjust the number of winning keys.
         * - It is calculated by multiplying the expected number of winning keys by the adjustment percentage, and then dividing by 100.
         */

        // Finally, we randomly decide whether to increase or decrease the rewards.
        if (randomFactor2 % 2 == 0) {
            winningKeyCount = expectedWinningKeys + adjustment;
        } else {
            // We ensure that the player never ends up with negative rewards.
            winningKeyCount = expectedWinningKeys > adjustment
                ? expectedWinningKeys - adjustment
                : 0;
        }

        /**
         * Explanation:
         * - If `randomFactor2` is 0, we add the `adjustment` to the expected number of winning keys, increasing the rewards.
         * - If `randomFactor2` is 1, we subtract the `adjustment` from the expected number of winning keys, decreasing the rewards.
         * - We make sure that the winning key count does not go below zero by checking if `expectedWinningKeys` is greater than `adjustment`.
         * - This ensures that players do not end up with negative rewards, maintaining fairness in the game.
         */

        return winningKeyCount;
    }
}
