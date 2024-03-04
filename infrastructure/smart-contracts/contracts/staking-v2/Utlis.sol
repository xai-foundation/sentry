// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

interface IStakingPool {

    function getStakedAmounts(address user) external view returns (uint256);
    
    function getStakedKeysCount() external view returns (uint256);

    function updateShares(
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare
    ) external;

    function updateMetadata(
        string memory _name,
        string memory _description,
        string memory _logo,
        string memory _website,
        string memory _twitter,
        string memory _discord,
        string memory _telegram,
        string memory _instagram,
        string memory _tiktok,
        string memory _youtube
    ) external;

    function stakeKeys(
        address owner,
        uint256[] memory keyIds
    ) external;

    function unstakeKey(
        address owner,
        uint256[] memory keyIds
    ) external;

    function stakeEsXai(
        address owner,
        uint256 amount
    ) external;

    function unstakeEsXai(
        address owner,
        uint256 amount
    ) external;

    function claimRewards(address user) external;

    function getUndistributedClaimAmount(
        address user
    ) external view returns (uint256 claimAmount, uint256 ownerAmount);

    function getPoolInfo(
        address user
    )
        external
        view
        returns (
            address owner,
            uint256 keyCount,
            uint256 userStakedEsXaiAmount,
            uint256 userClaimAmount,
            uint256[] memory userStakedKeyIds,
            uint256 totalStakedAmount,
            uint256 maxStakedAmount,
            string memory _name,
            string memory _description,
            string memory _logo,
            string memory _website,
            string memory _twitter,
            string memory _discord,
            string memory _telegram,
            string memory _instagram,
            string memory _tiktok,
            string memory _youtube
        );
}


interface IBucketTracker {
    function owner() external view returns (address);

    function withdrawableDividendOf(
        address _owner
    ) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function getAccount(
        address _account
    )
        external
        view
        returns (
            address account,
            uint256 withdrawableDividends,
            uint256 totalDividends,
            uint256 lastClaimTime
        );

    function setBalance(address account, uint256 newBalance) external;

    function distributeDividends(uint256 amount) external;

    function totalDividendsDistributed() external view returns (uint256);

    function processAccount(address account) external returns (bool);
}