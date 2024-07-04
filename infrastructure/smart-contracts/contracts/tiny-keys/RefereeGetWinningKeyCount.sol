// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

/**
 * Needs to be incorporated into new Referee contract.
 */

contract RefereeGetWinningKeyCount {
    /**
     * @dev This function uses various block and transaction properties to generate pseudo-random values
     * @return percentage which will be added or subtracted. percentage A number between 0 and 100 (inclusive)
     * @return isPositive A boolean indicating whether the direction is positive (true) or negative (false)
     */
    function getRandomnessAndDirection()
        public
        view
        returns (uint256 percentage, bool isPositive)
    {
        uint256 randomHash = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    //block.prevrandao,
                    msg.sender,
                    tx.gasprice
                )
            )
        );

        uint256 seed = uint256(randomHash);

        percentage = seed % 101;
        isPositive = seed % 2 == 0;

        return (percentage, isPositive);
    }

    /**
     * @dev Uses getRandomnessAndDirection() to get the winning key count. This handles cases in which less than 1 full key would win by using the direction of the randomness function.
     * @param stakedKeyCount amount of keys staked in pool
     * @param boostFactor boostfactor based on pool tier
     * @return winningKeyCount
     */
    function getWinningKeyCount(
        uint256 stakedKeyCount,
        uint256 boostFactor
    ) public view returns (uint256 winningKeyCount) {
        (uint256 percentage, bool isPositive) = getRandomnessAndDirection();

        uint256 adjustedPercentage;
        if (isPositive) {
            adjustedPercentage =
                boostFactor +
                ((boostFactor * percentage) / 1000);
        } else {
            adjustedPercentage = boostFactor >
                ((boostFactor * percentage) / 1000)
                ? boostFactor - ((boostFactor * percentage) / 1000)
                : 0;
        }
        winningKeyCount = (stakedKeyCount * adjustedPercentage) / 10000;
        if (winningKeyCount == 0 && adjustedPercentage > 0) {
            winningKeyCount = isPositive ? 1 : 0;
        }
        winningKeyCount = winningKeyCount > stakedKeyCount
            ? stakedKeyCount
            : winningKeyCount;

        return winningKeyCount;
    }
}
