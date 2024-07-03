// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/Math.sol";

library RefereeCalculations {
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
    function calculateChallengeEmissionAndTier(uint256 totalSupply, uint256 maxSupply) external pure returns (uint256, uint256) {
        require(maxSupply > totalSupply, "5");

        uint256 tier = Math.log2(maxSupply / (maxSupply - totalSupply)); // calculate which tier we are in starting from 0
        require(tier < 23, "6");

        uint256 emissionTier = maxSupply / (2**(tier + 1)); // equal to the amount of tokens that are emitted during this tier

        // determine what the size of the emission is based on each challenge having an estimated static length
        return (emissionTier / 17520, emissionTier);
    }

    /**
     * @notice Creates an assertion hash and determines if the hash payout is below the threshold.
     * @dev This function creates a hash of the _nodeLicenseId, _challengeId, challengerSignedHash from the challenge, and _newStateRoot.
     * It then converts the hash to a number and checks if it is below the threshold.
     * The threshold is calculated as the maximum uint256 value divided by 100 and then multiplied by the total supply of NodeLicenses.
     * @param _nodeLicenseId The ID of the NodeLicense.
     * @param _challengeId The ID of the challenge.
     * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator (base chance is 1/100 - Example: _boostFactor 200 will double the payout chance to 1/50, _boostFactor 16 maps to 1/6.25).
     * @param _confirmData The confirm hash, will change to assertionState after BOLD.
     * @param _challengerSignedHash The signed hash for the challenge
     * @return a boolean indicating if the hash is eligible, and the assertionHash.
     */
    function createAssertionHashAndCheckPayout(
        uint256 _nodeLicenseId,
        uint256 _challengeId,
        uint256 _boostFactor,
        bytes memory _confirmData,
        bytes memory _challengerSignedHash
    ) external pure returns (bool, bytes32) {
        bytes32 assertionHash = keccak256(abi.encodePacked(_nodeLicenseId, _challengeId, _confirmData, _challengerSignedHash));
        uint256 hashNumber = uint256(assertionHash);
        // hashNumber % 10_000 equals {0...9999}
        // hashNumber % 10_000 < 100 means a 100 / 10000 = 1 /100
        return (hashNumber % 10_000 < _boostFactor, assertionHash);
    }

    /**
     * @notice Get winning key count for a pool submission.
     * @param stakedKeyCount The total number of keys staked in the pool.
     * @return winningKeyCount The number of winning keys.
     */
    function getWinningKeyCount(uint256 stakedKeyCount) external returns (uint256) {
        return (stakedKeyCount * 5000) / 10000;
    }
}
