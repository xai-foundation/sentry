// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "../upgrades/referee/Referee5.sol";
import "../Xai.sol";
import "../esXai.sol";
import "./StakingPool.sol";
import "./PoolProxyDeployer.sol";
import "./PoolBeacon.sol";

// Error Codes
// 1: Staking must be enabled before creating pool
// 2: At least 1 key needed to create a pool
// 3: Share configuration is invalid; _ownerShare, _keyBucketShare, and _stakedBucketShare must be less than or equal to the set bucketshareMaxValues[0], [1], and [2] values respectively. All 3 must also add up 10,000
// 4: Delegate cannot be pool creator
// 5: Invalid auth: msg.sender must be pool owner
// 6: Invalid auth: msg.sender must be pool owner
// 7: Share configuration is invalid; _ownerShare, _keyBucketShare, and _stakedBucketShare must be less than or equal to the set bucketshareMaxValues[0], [1], and [2] values respectively. All 3 must also add up 10,000
// 8: Invalid auth: msg.sender must be pool owner
// 9: New delegate cannot be pool owner
// 10: Invalid pool; cannot be 0 address
// 11: Invalid key stake; must at least stake 1 key
// 12: Invalid pool for key stake; pool needs to have been created via the PoolFactory
// 13: Invalid key un-stake; must un-stake at least 1 key
// 14: Invalid pool for key un-stake request; pool needs to have been created via the PoolFactory
// 15: Invalid un-stake; not enough keys for owner to un-stake this many - to un-stake all keys, first un-stake all buy 1, then use createUnstakeOwnerLastKeyRequest
// 16: Invalid un-stake; not enough keys for you to un-stake this many - your staked key amount must be greater than or equal to the combined total of any pending un-stake requests with this pool & the current un-stake request
// 17: This can only be called by the pool owner
// 18: Invalid pool for owner last key un-stake request; pool needs to have been created via the PoolFactory
// 19: Owner must have one more key stakes than any pending un-stake requests from the same pool; if you have no un-stake requests waiting, you must have 1 key staked
// 20: Invalid esXai un-stake request; amount must be greater than 0
// 21: Invalid esXai un-stake request; your requested esXai amount must be greater than equal to the combined total of any pending un-stake requests with this pool & the current un-stake request
// 22: Invalid pool for esXai un-stake request; pool needs to have been created via the PoolFactory
// 23: Invalid pool for key un-stake; pool needs to have been created via the PoolFactory
// 24: Request must be open & a key request
// 25: Wait period for this key un-stake request is not yet over
// 26: You must un-stake at least 1 key, and the amount must match the un-stake request
// 27: Invalid pool for esXai stake; pool needs to have been created via the PoolFactory
// 28: Invalid pool for esXai un-stake; pool needs to have been created via the PoolFactory
// 29: Request must be open & an esXai request
// 30: Wait period for this esXai un-stake request is not yet over
// 31: You must un-stake at least 1 esXai, and the amount must match the un-stake request
// 32: You must have at least the desired un-stake amount staked in order to un-stake
// 33: Invalid pool for claim; pool needs to have been created via the PoolFactory
// 34: Invalid delegate update; pool needs to have been created via the PoolFactory

contract PoolFactory is Initializable, AccessControlEnumerableUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    // the address of the NodeLicense NFT
    address public nodeLicenseAddress;

    // contract addresses for esXai and xai
    address public esXaiAddress;

    address public refereeAddress;

    // Enabling staking on the Referee
    bool public stakingEnabled;

    // Staking pool contract addresses
    address[] public stakingPools;

    // Staking Pool share max values owner, keys, stakedEsXai in basepoints (5% => 50_000)
    uint32[3] public bucketshareMaxValues;

    // Mapping all pool addresses of a specific user
    mapping(address => address[]) public interactedPoolsOfUser;

    // mapping user address to pool address to index in user array, used for removing from user array without iteration
    mapping(address => mapping(address => uint256))
        public userToInteractedPoolIds;

    // mapping delegates to pools they are delegates of
    mapping(address => address[]) public poolsOfDelegate;

    // mapping of pool address to indices in the poolsOfDelegate[delegate] array
    mapping(address => uint256) public poolsOfDelegateIndices;

    // mapping of pool address => true if create via this factory
    mapping(address => bool) public poolsCreatedViaFactory;

	// address of the contract that handles deploying staking pool & bucket proxies
    address public deployerAddress;

	// periods (in seconds) to lock keys/esXai for when user creates an unstake request
	uint256 public unstakeKeysDelayPeriod;
	uint256 public unstakeGenesisKeyDelayPeriod;
	uint256 public unstakeEsXaiDelayPeriod;
    
    // period (in seconds) to update reward breakdown changes
	uint256 public updateRewardBreakdownDelayPeriod;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    event StakingEnabled();
    event PoolProxyDeployerUpdated(address oldDeployer, address newDeployer);
    event UpdateDelayPeriods();

    event PoolCreated(
        uint256 indexed poolIndex,
        address indexed poolAddress,
        address indexed poolOwner,
        uint256 stakedKeyCount
    );
    event StakeEsXai(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 totalUserEsXaiStaked,
        uint256 totalEsXaiStaked
    );
    event UnstakeEsXai(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 totalUserEsXaiStaked,
        uint256 totalEsXaiStaked
    );
    event StakeKeys(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 totalUserKeysStaked,
        uint256 totalKeysStaked
    );
    event UnstakeKeys(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 totalUserKeysStaked,
        uint256 totalKeysStaked
    );

    event ClaimFromPool(address indexed user, address indexed pool);
    event UpdatePoolDelegate(address indexed delegate, address indexed pool);
    event UpdateShares(address indexed pool);
    event UpdateMetadata(address indexed pool);

    event UnstakeRequestStarted(
        address indexed user,
        address indexed pool,
        uint256 indexed index,
        uint256 amount,
        bool isKey
    );

    function initialize(
        address _refereeAddress,
        address _esXaiAddress,
        address _nodeLicenseAddress
    ) public initializer {
        __AccessControlEnumerable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        bucketshareMaxValues[0] = 100_000; // => 10%
        bucketshareMaxValues[1] = 950_000; // => 95%
        bucketshareMaxValues[2] = 850_000; // => 85%

        refereeAddress = _refereeAddress;
        nodeLicenseAddress = _nodeLicenseAddress;
        esXaiAddress = _esXaiAddress;

		unstakeKeysDelayPeriod = 7 days;
		unstakeGenesisKeyDelayPeriod = 60 days;
		unstakeEsXaiDelayPeriod = 7 days;
        updateRewardBreakdownDelayPeriod = 14 days;
    }

    /**
     * @notice Enables staking on the Factory.
     */
    function enableStaking() external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakingEnabled = true;
        emit StakingEnabled();
    }

    function updatePoolProxyDeployer(address newDeployer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address prevDeployer = deployerAddress;
        deployerAddress = newDeployer;
        emit PoolProxyDeployerUpdated(prevDeployer, deployerAddress);
    }

	function updateDelayPeriods(
		uint256 _unstakeKeysDelayPeriod,
		uint256 _unstakeGenesisKeyDelayPeriod,
		uint256 _unstakeEsXaiDelayPeriod,
		uint256 _updateRewardBreakdownDelayPeriod
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		unstakeKeysDelayPeriod = _unstakeKeysDelayPeriod;
		unstakeGenesisKeyDelayPeriod = _unstakeGenesisKeyDelayPeriod;
		unstakeEsXaiDelayPeriod = _unstakeEsXaiDelayPeriod;
        updateRewardBreakdownDelayPeriod = _updateRewardBreakdownDelayPeriod;
        emit UpdateDelayPeriods();
	}

    function createPool(
        address _delegateOwner,
        uint256[] memory _keyIds,
        uint32[3] memory _shareConfig,
        string[3] memory _poolMetadata,
        string[] memory _poolSocials,
        string[2][2] memory trackerDetails
    ) external {
        require(stakingEnabled, "1");
        require(_keyIds.length > 0, "2");
        require(validateShareValues(_shareConfig), "3");
        require(msg.sender != _delegateOwner, "4");

        (
            address poolProxy,
            address keyBucketProxy,
            address esXaiBucketProxy
        ) = PoolProxyDeployer(deployerAddress).createPool();

        StakingPool(poolProxy).initialize(
            refereeAddress,
            esXaiAddress,
            msg.sender,
            _delegateOwner,
            keyBucketProxy,
            esXaiBucketProxy
        );

        StakingPool(poolProxy).initShares(
            _shareConfig[0],
            _shareConfig[1],
            _shareConfig[2]
        );

        StakingPool(poolProxy).updateMetadata(_poolMetadata, _poolSocials);

        BucketTracker(keyBucketProxy).initialize(
            poolProxy,
            esXaiAddress,
            trackerDetails[0][0],
            trackerDetails[0][1],
            0
        );

        BucketTracker(esXaiBucketProxy).initialize(
            poolProxy,
            esXaiAddress,
            trackerDetails[1][0],
            trackerDetails[1][1],
            18
        );

        // Add pool to delegate's list
        if (_delegateOwner != address(0)) {
            poolsOfDelegateIndices[poolProxy] = poolsOfDelegate[_delegateOwner]
                .length;
            poolsOfDelegate[_delegateOwner].push(poolProxy);
        }

        stakingPools.push(poolProxy);
        poolsCreatedViaFactory[poolProxy] = true;

        esXai(esXaiAddress).addToWhitelist(poolProxy);
        esXai(esXaiAddress).addToWhitelist(keyBucketProxy);
        esXai(esXaiAddress).addToWhitelist(esXaiBucketProxy);

        _stakeKeys(poolProxy, _keyIds);
        emit PoolCreated(
            stakingPools.length - 1,
            poolProxy,
            msg.sender,
            _keyIds.length
        );
    }

    function updatePoolMetadata(
        address pool,
        string[3] memory _poolMetadata,
        string[] memory _poolSocials
    ) external {
        StakingPool stakingPool = StakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "5");
        stakingPool.updateMetadata(_poolMetadata, _poolSocials);
        emit UpdateMetadata(pool);
    }

    function updateShares(
        address pool,
        uint32[3] memory _shareConfig
    ) external {
        StakingPool stakingPool = StakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "6");
        require(validateShareValues(_shareConfig), "7");
        stakingPool.updateShares(
            _shareConfig[0],
            _shareConfig[1],
            _shareConfig[2],
            updateRewardBreakdownDelayPeriod
        );
        emit UpdateShares(pool);
    }

    function validateShareValues(
        uint32[3] memory _shareConfig
    ) internal view returns (bool) {
        return
            _shareConfig[0] <= bucketshareMaxValues[0] &&
            _shareConfig[1] <= bucketshareMaxValues[1] &&
            _shareConfig[2] <= bucketshareMaxValues[2] &&
            _shareConfig[0] + _shareConfig[1] + _shareConfig[2] == 1_000_000;
    }

	function updateDelegateOwner(address pool, address delegate) external {
		StakingPool stakingPool = StakingPool(pool);
        require(poolsCreatedViaFactory[pool], "34");
		require(stakingPool.getPoolOwner() == msg.sender, "8");
		require(msg.sender != delegate, "9");

		// If staking pool already has delegate, remove pool from old delegate's list
        address oldDelegate = stakingPool.getDelegateOwner();
		if (oldDelegate != address(0)) {
			uint256 indexOfPoolToRemove = poolsOfDelegateIndices[pool]; // index of pool in question in delegate's list
			address lastDelegatePoolId = poolsOfDelegate[oldDelegate][poolsOfDelegate[oldDelegate].length - 1];

			poolsOfDelegateIndices[lastDelegatePoolId] = indexOfPoolToRemove;
			poolsOfDelegate[oldDelegate][indexOfPoolToRemove] = lastDelegatePoolId;
			poolsOfDelegate[oldDelegate].pop();
		}

		// Add pool to delegate's list
		if (delegate != address(0)) {
			poolsOfDelegateIndices[pool] = poolsOfDelegate[delegate].length;
			poolsOfDelegate[delegate].push(pool);
		}
        
		stakingPool.updateDelegateOwner(delegate);

		emit UpdatePoolDelegate(delegate, pool);
	}

    function _stakeKeys(address pool, uint256[] memory keyIds) internal {
        Referee5(refereeAddress).stakeKeys(pool, msg.sender, keyIds);
        StakingPool stakingPool = StakingPool(pool);
        stakingPool.stakeKeys(msg.sender, keyIds);

        associateUserWithPool(msg.sender, pool);

        emit StakeKeys(
            msg.sender,
            pool,
            keyIds.length,
            stakingPool.getStakedKeysCountForUser(msg.sender),
            stakingPool.getStakedKeysCount()
        );
    }

    function stakeKeys(address pool, uint256[] memory keyIds) external {
        require(pool != address(0), "10");
        require(keyIds.length > 0, "11");
        require(poolsCreatedViaFactory[pool], "12");

        _stakeKeys(pool, keyIds);
    }

    function createUnstakeKeyRequest(address pool, uint256 keyAmount) external {
        require(keyAmount > 0, "13");
        require(poolsCreatedViaFactory[pool], "14");
        StakingPool(pool).createUnstakeKeyRequest(msg.sender, keyAmount, unstakeKeysDelayPeriod);

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            StakingPool(pool).getUnstakeRequestCount(msg.sender) - 1,
            keyAmount,
            true
        );
    }

    function createUnstakeOwnerLastKeyRequest(address pool) external {
        require(poolsCreatedViaFactory[pool], "18");
        StakingPool(pool).createUnstakeOwnerLastKeyRequest(msg.sender, unstakeGenesisKeyDelayPeriod);

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            StakingPool(pool).getUnstakeRequestCount(msg.sender) - 1,
            1,
            true
        );
    }

    function createUnstakeEsXaiRequest(address pool, uint256 amount) external {
        require(amount > 0, "20");
        require(poolsCreatedViaFactory[pool], "22");
        StakingPool(pool).createUnstakeEsXaiRequest(msg.sender, amount, unstakeEsXaiDelayPeriod);

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            StakingPool(pool).getUnstakeRequestCount(msg.sender) - 1,
            amount,
            false
        );
    }

    function unstakeKeys(
        address pool,
        uint256 unstakeRequestIndex,
        uint256[] memory keyIds
    ) external {
        require(poolsCreatedViaFactory[pool], "23");

        Referee5(refereeAddress).unstakeKeys(pool, msg.sender, keyIds);
        StakingPool stakingPool = StakingPool(pool);
        stakingPool.unstakeKeys(msg.sender, unstakeRequestIndex, keyIds);

        if (!stakingPool.isUserEngagedWithPool(msg.sender)) {
            removeUserFromPool(msg.sender, pool);
        }

        emit UnstakeKeys(
            msg.sender,
            pool,
            keyIds.length,
            stakingPool.getStakedKeysCountForUser(msg.sender),
            stakingPool.getStakedKeysCount()
        );
    }

    function stakeEsXai(address pool, uint256 amount) external {
        require(poolsCreatedViaFactory[pool], "27");

        Referee5(refereeAddress).stakeEsXai(pool, amount);
        esXai(esXaiAddress).transferFrom(msg.sender, address(this), amount);
        StakingPool stakingPool = StakingPool(pool);
        stakingPool.stakeEsXai(msg.sender, amount);

        associateUserWithPool(msg.sender, pool);

        emit StakeEsXai(
            msg.sender,
            pool,
            amount,
            stakingPool.getStakedAmounts(msg.sender),
            Referee5(refereeAddress).stakedAmounts(pool)
        );
    }

    function unstakeEsXai(
        address pool,
        uint256 unstakeRequestIndex,
        uint256 amount
    ) external {
        require(poolsCreatedViaFactory[pool], "28");

        esXai(esXaiAddress).transfer(msg.sender, amount);
        Referee5(refereeAddress).unstakeEsXai(pool, amount);
        StakingPool stakingPool = StakingPool(pool);
        stakingPool.unstakeEsXai(msg.sender, unstakeRequestIndex, amount);

        if (!stakingPool.isUserEngagedWithPool(msg.sender)) {
            removeUserFromPool(msg.sender, pool);
        }

        emit UnstakeEsXai(
            msg.sender,
            pool,
            amount,
            stakingPool.getStakedAmounts(msg.sender),
            Referee5(refereeAddress).stakedAmounts(pool)
        );
    }

    function associateUserWithPool(address user, address pool) internal {
        address[] storage userPools = interactedPoolsOfUser[user];
        if (
            userPools.length < 1 ||
            pool != userPools[userToInteractedPoolIds[user][pool]]
        ) {
            userToInteractedPoolIds[user][pool] = userPools.length;
            userPools.push(pool);
        }
    }

    function removeUserFromPool(address user, address pool) internal {
        uint256 indexOfPool = userToInteractedPoolIds[user][pool];
        uint256 userLength = interactedPoolsOfUser[user].length;
        address lastPool = interactedPoolsOfUser[user][
            userLength - 1
        ];
        
        interactedPoolsOfUser[user][indexOfPool] = lastPool;
        userToInteractedPoolIds[user][lastPool] = indexOfPool;

        interactedPoolsOfUser[user].pop();
    }

    function claimFromPools(address[] memory pools) external {
        uint256 poolsLength = pools.length;

        for (uint i = 0; i < poolsLength; i++) {
            address stakingPool = pools[i];
            require(poolsCreatedViaFactory[stakingPool], "33");
            StakingPool(stakingPool).claimRewards(msg.sender);
            emit ClaimFromPool(msg.sender, stakingPool);
        }
    }

    function getDelegatePools(
        address delegate
    ) external view returns (address[] memory) {
        return poolsOfDelegate[delegate];
    }

    function isDelegateOfPoolOrOwner(
        address delegate,
        address pool
    ) external view returns (bool) {
        return (
			poolsOfDelegate[delegate].length > poolsOfDelegateIndices[pool] &&
			poolsOfDelegate[delegate][poolsOfDelegateIndices[pool]] == pool
		) ||
		StakingPool(pool).getPoolOwner() == delegate;
    }

    function getPoolsCount() external view returns (uint256) {
        return stakingPools.length;
    }

    function getPoolIndicesOfUser(
        address user
    ) external view returns (address[] memory) {
        return interactedPoolsOfUser[user];
    }

    function getPoolsOfUserCount(address user) external view returns (uint256) {
        return interactedPoolsOfUser[user].length;
    }

    function getPoolAddress(uint256 poolIndex) external view returns (address) {
        return stakingPools[poolIndex];
    }

    function getPoolAddressOfUser(
        address user,
        uint256 index
    ) external view returns (address) {
        return interactedPoolsOfUser[user][index];
    }

    function getUnstakedKeyIdsFromUser(
        address user,
        uint16 offset,
        uint16 pageLimit
    ) external view returns (uint256[] memory unstakedKeyIds) {
        uint256 userKeyBalance = NodeLicense(nodeLicenseAddress).balanceOf(
            user
        );
        unstakedKeyIds = new uint256[](pageLimit);
        uint256 currentIndexUnstaked = 0;
        uint256 limit = offset + pageLimit;

        for (uint256 i = offset; i < userKeyBalance && i < limit; i++) {
            uint256 keyId = NodeLicense(nodeLicenseAddress).tokenOfOwnerByIndex(
                user,
                i
            );
            if (
                Referee5(refereeAddress).assignedKeyToPool(keyId) == address(0)
            ) {
                unstakedKeyIds[currentIndexUnstaked] = keyId;
                currentIndexUnstaked++;
            }
        }
    }

    function checkKeysAreStaked(
        uint256[] memory keyIds
    ) external view returns (bool[] memory isStaked) {
        isStaked = new bool[](keyIds.length);
        for (uint256 i; i < keyIds.length; i++) {
            isStaked[i] =
                Referee5(refereeAddress).assignedKeyToPool(keyIds[i]) !=
                address(0);
        }
    }
}
