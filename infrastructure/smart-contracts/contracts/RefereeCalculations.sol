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
     * @dev Calculates the number of winning keys for a staking pool
     * @notice This function determines the winning key count based on the staked amount and pool tier,
     * with a random adjustment of up to 10% to the boost factor.
     * @param _stakedKeyCount Amount of keys staked in pool
     * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator
     * @param _poolAddress The Address of the pool. Is only used for randomzie
     * @param _challengeId The ID of the challenge. Is only used for randomzie
     * @return winningKeyCount Number of winning keys
     */

    function getWinningKeyCount(
        uint256 _stakedKeyCount,
        uint256 _boostFactor,
        address _poolAddress,
        uint256 _challengeId
    ) external view returns (uint256 winningKeyCount) {
        require(_stakedKeyCount > 0, "41");

        //creates a seed to determine the random number between 0-99 to use for dice roll.
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, _boostFactor, _stakedKeyCount, _poolAddress, _challengeId, msg.sender)));
        
        // Dice for rolling possible winning Amount
        uint256 dice = seed % 100;

        if (dice <= 40) {
            // WinningKeyCount is stakedAmount * 0.5 of boostFactor
            winningKeyCount = (_stakedKeyCount * (_boostFactor / 2)) / 10000;
        } else if (dice <= 60) {
            // WinningKeyCount is stakedAmount * 0.75 of boostFactor
            winningKeyCount = (_stakedKeyCount * ((_boostFactor * 75) / 100)) / 10000;
        } else if (dice <= 90) {
            // WinningKeyCount is stakedAmount * boostFactor
            winningKeyCount = (_stakedKeyCount * _boostFactor) / 10000;
        } else if (dice > 90) {
            // WinningKeyCount is stakedAmount * 1.5 of boostFactor
            winningKeyCount =
                (_stakedKeyCount * ((_boostFactor * 15) / 10)) /
                10000;
        }

        return winningKeyCount;
    }
}
