// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../upgrades/referee/Referee5.sol";
import "./BucketTracker.sol";
import "../esXai.sol";
import "./Utils.sol";

contract StakingPool is IStakingPool, AccessControlUpgradeable {
    bytes32 public constant POOL_ADMIN = keccak256("POOL_ADMIN");

    address public refereeAddress;
    address public esXaiAddress;

    address public poolOwner;

    //Pool Metadata
    string public name;
    string public description;
    string public logo;
    string[] public socials;

    uint16 public ownerShare;
    uint16 public keyBucketShare;
    uint16 public stakedBucketShare;

    uint256 public poolOwnerClaimableRewards;
    IBucketTracker public keyBucket;
    IBucketTracker public esXaiStakeBucket;

    mapping(address => uint256[]) public stakedKeysOfOwner;
    mapping(uint256 => uint256) public keyIdIndex;
    mapping(address => uint256) public stakedAmounts;

    uint256[500] __gap;

    function initialize(
        address _refereeAddress,
        address _esXaiAddress,
        address _owner,
        address _keyBucket,
        address _esXaiStakeBucket
    ) external {
        require(poolOwner == address(0), "Invalid init");
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        esXaiAddress = _esXaiAddress;
        refereeAddress = _refereeAddress;

        keyBucket = IBucketTracker(_keyBucket);
        esXaiStakeBucket = IBucketTracker(_esXaiStakeBucket);

        poolOwner = _owner;
    }
    
    function getPoolOwner() external view returns (address) {
        return poolOwner;
    }

    function getStakedKeysCount() external view returns (uint256) {
        return keyBucket.totalSupply();
    }

    function getStakedKeysCountForUser(
        address user
    ) external view returns (uint256) {
        return stakedKeysOfOwner[user].length;
    }

    function getStakedAmounts(address user) external view returns (uint256) {
        return stakedAmounts[user];
    }

    function distributeRewards() internal {
        uint256 amountToDistribute = esXai(esXaiAddress).balanceOf(
            address(this)
        ) - poolOwnerClaimableRewards;

        if (amountToDistribute == 0) {
            return;
        }

        uint256 amountForKeys = (amountToDistribute * keyBucketShare) / 10_000;
        uint256 amountForStaked = (amountToDistribute * stakedBucketShare) /
            10_000;

        esXai(esXaiAddress).transfer(address(keyBucket), amountForKeys);
        keyBucket.distributeDividends(amountForKeys);

        esXai(esXaiAddress).transfer(
            address(esXaiStakeBucket),
            amountForStaked
        );
        esXaiStakeBucket.distributeDividends(amountForStaked);

        poolOwnerClaimableRewards +=
            amountToDistribute -
            amountForKeys -
            amountForStaked;
    }

    function updateShares(
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ownerShare = _ownerShare;
        keyBucketShare = _keyBucketShare;
        stakedBucketShare = _stakedBucketShare;
    }

    function updateMetadata(
        string memory _name,
        string memory _description,
        string memory _logo,
        string[] memory _socials
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        name = _name;
        description = _description;
        logo = _logo;
        socials = _socials;
    }

    function stakeKeys(
        address owner,
        uint256[] memory keyIds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 keyLength = keyIds.length;
        for (uint i = 0; i < keyLength; i++) {
            keyIdIndex[keyIds[i]] = stakedKeysOfOwner[owner].length;
            stakedKeysOfOwner[owner].push(keyIds[i]);
        }

        distributeRewards();
        keyBucket.processAccount(owner);
        keyBucket.setBalance(owner, stakedKeysOfOwner[owner].length);
    }

    function unstakeKey(
        address owner,
        uint256[] memory keyIds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 keyLength = keyIds.length;
        for (uint i = 0; i < keyLength; i++) {
            uint256 indexOfKeyToRemove = keyIdIndex[keyIds[i]];
            uint256 lastKeyId = stakedKeysOfOwner[owner][
                stakedKeysOfOwner[owner].length - 1
            ];

            keyIdIndex[lastKeyId] = indexOfKeyToRemove;
            stakedKeysOfOwner[owner][indexOfKeyToRemove] = lastKeyId;
            stakedKeysOfOwner[owner].pop();
        }

        distributeRewards();
        keyBucket.processAccount(owner);
        keyBucket.setBalance(owner, stakedKeysOfOwner[owner].length);
    }

    function stakeEsXai(
        address owner,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakedAmounts[owner] += amount;
        distributeRewards();
        esXaiStakeBucket.processAccount(owner);
        esXaiStakeBucket.setBalance(owner, stakedAmounts[owner]);
    }

    function unstakeEsXai(
        address owner,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakedAmounts[owner] -= amount;
        distributeRewards();
        esXaiStakeBucket.processAccount(owner);
        esXaiStakeBucket.setBalance(owner, stakedAmounts[owner]);
    }

    function claimRewards(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        distributeRewards();

        if (user == poolOwner) {
            esXai(esXaiAddress).transfer(user, poolOwnerClaimableRewards);
            poolOwnerClaimableRewards = 0;
        }

        keyBucket.processAccount(user);
        esXaiStakeBucket.processAccount(user);
    }

    function _getUndistributedClaimAmount(
        address user
    ) internal view returns (uint256 claimAmount, uint256 ownerAmount) {
        uint256 poolAmount = esXai(esXaiAddress).balanceOf(address(this));

        uint256 amountForKeys = (poolAmount * keyBucketShare) / 100;
        uint256 amountForStaked = (poolAmount * stakedBucketShare) / 100;
        ownerAmount = poolAmount - amountForKeys - amountForStaked;

        uint256 balanceInKeyBucket = keyBucket.balanceOf(user);
        uint256 balanceInStakedBucket = esXaiStakeBucket.balanceOf(user);

        if (balanceInKeyBucket != 0) {
            claimAmount +=
                amountForKeys /
                keyBucket.totalSupply() /
                balanceInKeyBucket;
        }

        if (balanceInStakedBucket != 0) {
            claimAmount +=
                amountForStaked /
                esXaiStakeBucket.totalSupply() /
                balanceInStakedBucket;
        }
    }

    function getUndistributedClaimAmount(
        address user
    ) external view returns (uint256 claimAmount, uint256 ownerAmount) {
        return _getUndistributedClaimAmount(user);
    }

    function getPoolInfo(
        address user
    )
        external
        view
        returns (
            PoolBaseInfo memory baseInfo,
            uint256[] memory userStakedKeyIds,
            string memory _name,
            string memory _description,
            string memory _logo,
            string[] memory _socials
        )
    {
        baseInfo.owner = poolOwner;
        baseInfo.keyBucketTracker = address(keyBucket);
        baseInfo.esXaiBucketTracker = address(esXaiStakeBucket);
        baseInfo.keyCount = keyBucket.totalSupply();
        baseInfo.userStakedEsXaiAmount = stakedAmounts[user];

        uint256 claimAmountKeyBucket = keyBucket.withdrawableDividendOf(user);
        uint256 claimAmountStakedBucket = esXaiStakeBucket
            .withdrawableDividendOf(user);

        (
            uint256 claimAmount,
            uint256 ownerAmount
        ) = _getUndistributedClaimAmount(user);

        baseInfo.userClaimAmount =
            claimAmountKeyBucket +
            claimAmountStakedBucket +
            claimAmount;
        if (user == poolOwner) {
            baseInfo.userClaimAmount += poolOwnerClaimableRewards + ownerAmount;
        }

        userStakedKeyIds = stakedKeysOfOwner[user];
        baseInfo.totalStakedAmount = esXaiStakeBucket.totalSupply();
        baseInfo.maxStakedAmount =
            Referee5(refereeAddress).maxStakeAmountPerLicense() *
            baseInfo.keyCount;

        baseInfo.ownerShare = ownerShare;
        baseInfo.keyBucketShare = keyBucketShare;
        baseInfo.stakedBucketShare = stakedBucketShare;

        _name = name;
        _description = description;
        _logo = logo;
        _socials = socials;
    }
}
