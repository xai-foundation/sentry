// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

interface IStakingPool {
    struct PoolBaseInfo {
        address poolAddress;
        address owner;
        address keyBucketTracker;
        address esXaiBucketTracker;
        uint256 keyCount;
        uint256 totalStakedAmount;
        uint256 updateSharesTimestamp;
        uint16 ownerShare;
        uint16 keyBucketShare;
        uint16 stakedBucketShare;
    }

    function initialize(
        address _refereeAddress,
        address _esXaiAddress,
        address _owner,
		address _delegateOwner,
        address _keyBucket,
        address _esXaiStakeBucket
    ) external;

    function getPoolOwner() external view returns (address);

    function getDelegateOwner() external view returns (address);

    function getStakedAmounts(address user) external view returns (uint256);

	function updateDelegateOwner(address delegate) external;

    function getStakedKeysCountForUser(
        address user
    ) external view returns (uint256);

    function getStakedKeysCount() external view returns (uint256);

    function initShares(
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare
    ) external;

    function updateShares(
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare
    ) external;

    function updateMetadata(
        string memory _name,
        string memory _description,
        string memory _logo,
        string[] memory _socials
    ) external;

    function stakeKeys(address owner, uint256[] memory keyIds) external;

    function unstakeKeys(address owner, uint256[] memory keyIds) external;

    function stakeEsXai(address owner, uint256 amount) external;

    function unstakeEsXai(address owner, uint256 amount) external;

    function claimRewards(address user) external;

    function getUndistributedClaimAmount(
        address user
    ) external view returns (uint256 claimAmount, uint256 ownerAmount);

    function getPoolInfo()
        external
        view
        returns (
            PoolBaseInfo memory baseInfo,
            string memory _name,
            string memory _description,
            string memory _logo,
            string[] memory _socials,
            uint16[] memory _pendingShares
        );

    function getUserPoolData(
        address user
    )
        external
        view
        returns (
            uint256 userStakedEsXaiAmount,
            uint256 userClaimAmount,
            uint256[] memory userStakedKeyIds
        );
}

interface IBucketTracker {
    function initialize(
        address _trackerOwner,
        address _esXaiAddress,
        string memory __name,
        string memory __symbol,
        uint256 __decimals
    ) external;

    function owner() external view returns (address);

    function totalSupply() external view returns (uint256);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function withdrawableDividendOf(
        address _owner
    ) external view returns (uint256);

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
