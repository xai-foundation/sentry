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
     * @dev Calculates the number of winning keys for a staking pool
     * @notice This function determines the winning key count based on the staked amount and pool tier,
     * with a random adjustment of up to 10% to the boost factor.
     * @param _stakedKeyCount Amount of keys staked in pool
     * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator
     * @param _poolAddress The Address of the pool. Is only used for randomzie
     * @param _challengeId The ID of the challenge. Is only used for randomzie
     * @param _confirmData The confirm data of the assertion.
     * @param _challengerSignedHash The signed hash for the challenge
     * @return winningKeyCount Number of winning keys
     */

    function getWinningKeyCount(
    uint256 _stakedKeyCount,
    uint256 _boostFactor,
    address _poolAddress,
    uint256 _challengeId,
    bytes memory _confirmData,
    bytes memory _challengerSignedHash
    ) public pure returns (uint256 winningKeyCount) {
        // Ensure inputs are valid
        require(_stakedKeyCount > 0, "Staked key count must be positive");
        require(_boostFactor > 0, "Boost factor must be positive");

        // Set the winning probability
        // For example, a _boostFactor of 100 means a 1% chance (100/10000)
        uint256 probability = _boostFactor;

        // Create a unique random seed for this specific scenario
        // This ensures different randomness for each unique combination of inputs
        bytes32 seedHash = keccak256(
            abi.encodePacked(
                _poolAddress,
                _challengeId,
                _confirmData,
                _challengerSignedHash
            )
        );
        uint256 seed = uint256(seedHash);

        // Generate a random number between 0 and 9999
        // This will be used for various random decisions later
        uint256 random = seed % 10000;

        // For small pools (100 keys or fewer), we check each key individually
        if (_stakedKeyCount <= 100) {
            for (uint256 i = 0; i < _stakedKeyCount; i++) {
                // Generate a unique random number for each key
                uint256 keyRandom = uint256(keccak256(abi.encodePacked(seed, i))) % 10000;
                
                // If the random number is less than the probability, this key wins
                if (keyRandom < probability) {
                    winningKeyCount++;
                }
            }
        } else {
            // For larger pools, we use a statistical approximation method
            
            // Calculate the expected number of winning keys
            uint256 expectedWinningKeys = (_stakedKeyCount * probability) / 10000;
            
            // Calculate the maximum adjustment percentage
            // This is higher for lower boost factors to introduce more variability
            uint256 baseVariability = 30 + (1000 / _boostFactor);
            uint256 maxAdjustmentPercentage = baseVariability > 50 ? 50 : baseVariability; // Cap at 50%

            // Generate a random factor for adjustment calculation
            uint256 randomFactor1 = uint256(keccak256(abi.encodePacked(seed, "factor1"))) % 1000;
            
            // Calculate the actual adjustment percentage and amount
            uint256 adjustmentPercentage = (randomFactor1 * maxAdjustmentPercentage) / 1000;
            uint256 adjustment = (expectedWinningKeys * adjustmentPercentage) / 100;

            // Randomly decide whether to add or subtract the adjustment
            if (random % 2 == 0) {
                winningKeyCount = expectedWinningKeys + adjustment;
            } else {
                // Subtract the adjustment, but ensure we don't go below zero
                winningKeyCount = expectedWinningKeys > adjustment ? expectedWinningKeys - adjustment : 0;
            }
        }

        // Return the final count of winning keys
        return winningKeyCount;
    }
}
