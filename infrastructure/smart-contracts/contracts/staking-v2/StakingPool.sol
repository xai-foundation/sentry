// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../upgrades/referee/Referee5.sol";
import "./BucketTracker.sol";
import "../esXai.sol";
import "./Utlis.sol";

contract StakingPool is IStakingPool, AccessControlUpgradeable {
    bytes32 public constant POOL_ADMIN = keccak256("POOL_ADMIN");

    address public refereeAddress;
    address public esXaiAddress;

    address public poolOwner;

    //Pool Metadata
    string public name;
    string public description;
    string public logo;
    string public website;
    string public twitter;
    string public discord;
    string public telegram;
    string public instagram;
    string public tiktok;
    string public youtube;

    uint16 public ownerShare;
    uint16 public keyBucketShare;
    uint16 public stakedBucketShare;

    uint256 public poolOwnerClaimableRewards;
    IBucketTracker public keyBucket;
    IBucketTracker public esXaiStakeBucket;

    mapping(address => uint256[]) public stakedKeysOfOwner;
    mapping(uint256 => uint256) public keyIdIndex;
    mapping(address => uint256) public stakedAmounts; //TODO do we needs this ? Can it not be BucketBalance ?

    uint256[500] __gap;

    function initialize(
        address _refereeAddress,
        address _esXaiAddress,
        address _owner,
        address _keyBucket,
        address _esXaiStakeBucket,
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare,
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
    ) external initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        esXaiAddress = _esXaiAddress;
        refereeAddress = _refereeAddress;

        keyBucket = IBucketTracker(_keyBucket);
        esXaiStakeBucket = IBucketTracker(_esXaiStakeBucket);

        poolOwner = _owner;

        ownerShare = _ownerShare;
        keyBucketShare = _keyBucketShare;
        stakedBucketShare = _stakedBucketShare;

        name = _name;
        description = _description;
        logo = _logo;
        website = _website;
        twitter = _twitter;
        discord = _discord;
        telegram = _telegram;
        instagram = _instagram;
        tiktok = _tiktok;
        youtube = _youtube;

        //Create buckets
        //new TrackerBucket() // TODO this needs to be an Upgradable too!
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

        uint256 amountForKeys = (amountToDistribute * keyBucketShare) / 100;
        uint256 amountForStaked = (amountToDistribute * stakedBucketShare) /
            100;

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
        string memory _website,
        string memory _twitter,
        string memory _discord,
        string memory _telegram,
        string memory _instagram,
        string memory _tiktok,
        string memory _youtube
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        name = _name;
        description = _description;
        logo = _logo;
        website = _website;
        twitter = _twitter;
        discord = _discord;
        telegram = _telegram;
        instagram = _instagram;
        tiktok = _tiktok;
        youtube = _youtube;
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
            address owner,
            uint16 _ownerShare,
            uint16 _keyBucketShare,
            uint16 _stakedBucketShare,
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
        )
    {
        owner = poolOwner;
        keyCount = keyBucket.totalSupply();
        userStakedEsXaiAmount = stakedAmounts[user];

        uint256 claimAmountKeyBucket = keyBucket.withdrawableDividendOf(user);
        uint256 claimAmountStakedBucket = esXaiStakeBucket
            .withdrawableDividendOf(user);

        (
            uint256 claimAmount,
            uint256 ownerAmount
        ) = _getUndistributedClaimAmount(user);

        userClaimAmount =
            claimAmountKeyBucket +
            claimAmountStakedBucket +
            claimAmount;
        if (user == poolOwner) {
            userClaimAmount += poolOwnerClaimableRewards + ownerAmount;
        }

        userStakedKeyIds = stakedKeysOfOwner[user];
        totalStakedAmount = esXaiStakeBucket.totalSupply();
        maxStakedAmount =
            Referee5(refereeAddress).maxStakeAmountPerLicense() *
            keyCount;

        _ownerShare = ownerShare;
        _keyBucketShare = keyBucketShare;
        _stakedBucketShare = stakedBucketShare;

        _name = name;
        _description = description;
        _logo = logo;
        _website = website;
        _twitter = twitter;
        _discord = discord;
        _telegram = telegram;
        _instagram = instagram;
        _tiktok = tiktok;
        _youtube = youtube;
    }
}
