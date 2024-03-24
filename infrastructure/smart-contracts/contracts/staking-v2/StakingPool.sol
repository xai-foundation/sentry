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
	address public delegateOwner;

    //Pool Metadata
    string public name;
    string public description;
    string public logo;
    string[] public socials;

	uint32 public ownerShare;
	uint32 public keyBucketShare;
	uint32 public stakedBucketShare;

    uint256 public poolOwnerClaimableRewards;
    IBucketTracker public keyBucket;
    IBucketTracker public esXaiStakeBucket;

    mapping(address => uint256[]) public stakedKeysOfOwner;
    mapping(uint256 => uint256) public keyIdIndex;
    mapping(address => uint256) public stakedAmounts;

	uint256[] public stakedKeys;
	mapping(uint256 => uint256) public stakedKeysIndices;

	uint32[3] pendingShares;
    uint256 updateSharesTimestamp;

    uint256[500] __gap;

    function initialize(
        address _refereeAddress,
        address _esXaiAddress,
        address _owner,
        address _delegateOwner,
        address _keyBucket,
        address _esXaiStakeBucket
    ) public initializer {
        require(poolOwner == address(0), "Invalid init");
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        esXaiAddress = _esXaiAddress;
        refereeAddress = _refereeAddress;

        keyBucket = IBucketTracker(_keyBucket);
        esXaiStakeBucket = IBucketTracker(_esXaiStakeBucket);

        poolOwner = _owner;
		delegateOwner = _delegateOwner;
    }

    function getPoolOwner() external view returns (address) {
        return poolOwner;
    }

	function getDelegateOwner() external view returns (address) {
		return delegateOwner;
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

	function getStakedKeys() external view returns (uint256[] memory) {
		return stakedKeys;
	}

	function updateDelegateOwner(address delegate) external onlyRole(DEFAULT_ADMIN_ROLE) {
		delegateOwner = delegate;
	}

    function distributeRewards() internal {
        if (
            updateSharesTimestamp > 0 && block.timestamp > updateSharesTimestamp
        ) {
            ownerShare = pendingShares[0];
            keyBucketShare = pendingShares[1];
            stakedBucketShare = pendingShares[2];
            updateSharesTimestamp = 0;
            pendingShares[0] = 0;
            pendingShares[1] = 0;
            pendingShares[2] = 0;
        }

        uint256 amountToDistribute = esXai(esXaiAddress).balanceOf(
            address(this)
        ) - poolOwnerClaimableRewards;

        if (amountToDistribute == 0) {
            return;
        }

        uint256 amountForKeys = (amountToDistribute * keyBucketShare) / 1_000_000;
        uint256 amountForStaked = (amountToDistribute * stakedBucketShare) /
		1_000_000;

        if (amountForStaked > 0) {
            //If there are no esXai stakers we will distribute to keys and owner proportional to their shares
            if (esXaiStakeBucket.totalSupply() == 0) {
                amountForKeys +=
                    (amountForStaked * keyBucketShare) /
                    (keyBucketShare + ownerShare);

                amountForStaked = 0;
            } else {
                esXai(esXaiAddress).transfer(
                    address(esXaiStakeBucket),
                    amountForStaked
                );
                esXaiStakeBucket.distributeDividends(amountForStaked);
            }
        }

        esXai(esXaiAddress).transfer(address(keyBucket), amountForKeys);
        keyBucket.distributeDividends(amountForKeys);

        poolOwnerClaimableRewards +=
            amountToDistribute -
            amountForKeys -
            amountForStaked;
    }

    function initShares(
        uint32 _ownerShare,
		uint32 _keyBucketShare,
		uint32 _stakedBucketShare
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ownerShare = _ownerShare;
        keyBucketShare = _keyBucketShare;
        stakedBucketShare = _stakedBucketShare;
    }

    function updateShares(
		uint32 _ownerShare,
		uint32 _keyBucketShare,
		uint32 _stakedBucketShare
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        pendingShares[0] = _ownerShare;
        pendingShares[1] = _keyBucketShare;
        pendingShares[2] = _stakedBucketShare;
        updateSharesTimestamp = block.timestamp + 45 days;
    }

    function updateMetadata(
		string[3] memory _metaData,
        string[] memory _socials
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        name = _metaData[0];
        description = _metaData[1];
        logo = _metaData[2];
        socials = _socials;
    }

    function stakeKeys(
        address owner,
        uint256[] memory keyIds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 keyLength = keyIds.length;
        for (uint i = 0; i < keyLength; i++) {
			// Update indexes of this user's staked keys
            keyIdIndex[keyIds[i]] = stakedKeysOfOwner[owner].length;
            stakedKeysOfOwner[owner].push(keyIds[i]);

			// Update indexes of the pool's staked keys
			stakedKeysIndices[keyIds[i]] = stakedKeys.length;
			stakedKeys.push(keyIds[i]);
        }

        distributeRewards();
        keyBucket.processAccount(owner);
        keyBucket.setBalance(owner, stakedKeysOfOwner[owner].length);
    }

    function unstakeKeys(
        address owner,
        uint256[] memory keyIds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 keyLength = keyIds.length;
        for (uint i = 0; i < keyLength; i++) {
			// Update indexes of this user's staked keys
            uint256 indexOfOwnerKeyToRemove = keyIdIndex[keyIds[i]];
            uint256 lastOwnerKeyId = stakedKeysOfOwner[owner][
                stakedKeysOfOwner[owner].length - 1
            ];

            keyIdIndex[lastOwnerKeyId] = indexOfOwnerKeyToRemove;
            stakedKeysOfOwner[owner][indexOfOwnerKeyToRemove] = lastOwnerKeyId;
            stakedKeysOfOwner[owner].pop();

			// Update indexes of the pool's staked keys
			uint256 indexOfStakedKeyToRemove = stakedKeysIndices[keyIds[i]];
			uint256 lastStakedKeyId = stakedKeys[stakedKeys.length - 1];

			stakedKeysIndices[lastStakedKeyId] = indexOfStakedKeyToRemove;
			stakedKeys[indexOfStakedKeyToRemove] = lastStakedKeyId;
			stakedKeys.pop();
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

        if (user == poolOwner && poolOwnerClaimableRewards > 0) {
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

        uint256 amountForKeyBucket = (poolAmount * keyBucketShare) / 1_000_000;
        uint256 amountForEsXaiBucket = (poolAmount * stakedBucketShare) /
		1_000_000;

        ownerAmount = poolAmount - amountForKeyBucket - amountForEsXaiBucket;

        uint256 userBalanceInKeyBucket = keyBucket.balanceOf(user);
        uint256 userBalanceInEsXaiBucket = esXaiStakeBucket.balanceOf(user);

        if (userBalanceInKeyBucket != 0) {
            uint256 amountPerKey = amountForKeyBucket / keyBucket.totalSupply();
            claimAmount += amountPerKey * userBalanceInKeyBucket;
        }

        if (userBalanceInEsXaiBucket != 0) {
            uint256 amountPerStakedEsXai = amountForEsXaiBucket /
                esXaiStakeBucket.totalSupply();
            claimAmount += amountPerStakedEsXai * userBalanceInEsXaiBucket;
        }
    }

    function getUndistributedClaimAmount(
        address user
    ) external view returns (uint256 claimAmount, uint256 ownerAmount) {
        return _getUndistributedClaimAmount(user);
    }

    function getPoolInfo()
        external
        view
        returns (
            PoolBaseInfo memory baseInfo,
            string memory _name,
            string memory _description,
            string memory _logo,
            string[] memory _socials,
			uint32[] memory _pendingShares
        )
    {
        baseInfo.poolAddress = address(this);
        baseInfo.owner = poolOwner;
        baseInfo.keyBucketTracker = address(keyBucket);
        baseInfo.esXaiBucketTracker = address(esXaiStakeBucket);
        baseInfo.keyCount = keyBucket.totalSupply();
        baseInfo.totalStakedAmount = esXaiStakeBucket.totalSupply();
        baseInfo.ownerShare = ownerShare;
        baseInfo.keyBucketShare = keyBucketShare;
        baseInfo.stakedBucketShare = stakedBucketShare;
        baseInfo.updateSharesTimestamp = updateSharesTimestamp;

        _name = name;
        _description = description;
        _logo = logo;
        _socials = socials;

        _pendingShares = new uint32[](3);
        _pendingShares[0] = pendingShares[0];
        _pendingShares[1] = pendingShares[1];
        _pendingShares[2] = pendingShares[2];
    }

    function getUserPoolData(
        address user
    )
        external
        view
        returns (
            uint256 userStakedEsXaiAmount,
            uint256 userClaimAmount,
            uint256[] memory userStakedKeyIds
        )
    {
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
    }
}
