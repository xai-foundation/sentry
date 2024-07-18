// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "../../upgrades/referee/Referee9.sol";
import "../../Xai.sol";
import "../../upgrades/esXai/esXai2.sol";
import "../../upgrades/node-license/NodeLicense8.sol";
import "../../staking-v2/StakingPool.sol";
import "../../staking-v2/PoolProxyDeployer.sol";
import "../../staking-v2/PoolBeacon.sol";

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
// 35: Invalid submission; pool needs to have been created via the PoolFactory
// 36: Invalid submission; user needs to be owner, delegate or staker to submit
// 37: Invalid auth: msg.sender must be kyc approved to create a pool

contract PoolFactory2 is Initializable, AccessControlEnumerableUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    // address of the NodeLicense NFT contract
    address public nodeLicenseAddress;

    // contract addresses for esXai and xai tokens
    address public esXaiAddress;
    address public refereeAddress;

    // Boolean to enable/disable staking on the referee contract
    bool public stakingEnabled;

    // Array to store addresses of staking pool contracts
    address[] public stakingPools;

    // Maximum share values for staking pool (owner, keys, stakedEsXai) in basepoints (5% => 50,000)
    uint32[3] public bucketshareMaxValues;

    // Mapping of user addresses to their interacted pool addresses
    mapping(address => address[]) public interactedPoolsOfUser;

    // Mapping of user addresses to pool addresses to index in user array for efficient removal
    mapping(address => mapping(address => uint256))
        public userToInteractedPoolIds;

    // Mapping of delegates to the pools they are delegates of
    mapping(address => address[]) public poolsOfDelegate;

    // Mapping of pool addresses to indices in the delegate's pools array
    mapping(address => uint256) public poolsOfDelegateIndices;

    // Mapping of pool addresses created via this factory
    mapping(address => bool) public poolsCreatedViaFactory;

    // Address of the contract responsible for deploying staking pool and bucket proxies
    address public deployerAddress;

    // Periods (in seconds) to lock keys/esXai when user creates an unstake request
    uint256 public unstakeKeysDelayPeriod;
    uint256 public unstakeGenesisKeyDelayPeriod;
    uint256 public unstakeEsXaiDelayPeriod;

    // Period (in seconds) to update reward breakdown changes
    uint256 public updateRewardBreakdownDelayPeriod;

    // Role definition for stake keys admin
    bytes32 public constant STAKE_KEYS_ADMIN_ROLE =
        keccak256("STAKE_KEYS_ADMIN_ROLE");

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    // Events for various actions within the contract
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

    // /**
    //  * @dev Initializes the contract with the provided addresses.
    //  * Grants STAKE_KEYS_ADMIN_ROLE.
    //  * @param _stakeKeysAdmin Address to be granted STAKE_KEYS_ADMIN_ROLE.
    //  */
    function initialize(address _stakeKeysAdmin) public reinitializer(2) {
        _setupRole(STAKE_KEYS_ADMIN_ROLE, _stakeKeysAdmin);
    }

    /**
     * @notice Enables staking on the Factory.
     */
    function enableStaking() external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakingEnabled = true;
        emit StakingEnabled();
    }

    /**
     * @notice Updates the address of the pool proxy deployer contract.
     * @param newDeployer The new deployer contract address.
     */
    function updatePoolProxyDeployer(
        address newDeployer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address prevDeployer = deployerAddress;
        deployerAddress = newDeployer;
        emit PoolProxyDeployerUpdated(prevDeployer, deployerAddress);
    }

    /**
     * @notice Updates the delay periods for unstaking keys and esXai.
     * @param _unstakeKeysDelayPeriod New delay period for unstaking keys.
     * @param _unstakeGenesisKeyDelayPeriod New delay period for unstaking genesis keys.
     * @param _unstakeEsXaiDelayPeriod New delay period for unstaking esXai.
     * @param _updateRewardBreakdownDelayPeriod New delay period for updating reward breakdown.
     */
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

    /**
     * @notice Creates a new staking pool.
     * @param _delegateOwner Address of the delegate owner.
     * @param _keyIds Array of key IDs to be staked.
     * @param _shareConfig Array of share configurations.
     * @param _poolMetadata Array of pool metadata.
     * @param _poolSocials Array of pool social links.
     * @param trackerDetails Array of tracker details.
     */
    function createPool(
        address _delegateOwner,
        uint256[] memory _keyIds,
        uint32[3] memory _shareConfig,
        string[3] memory _poolMetadata,
        string[] memory _poolSocials,
        string[2][2] memory trackerDetails
    ) external {
        require(stakingEnabled, "1"); // Staking must be enabled
        require(_keyIds.length > 0, "2"); // At least 1 key needed to create a pool
        require(validateShareValues(_shareConfig), "3"); // Validate share configuration
        require(msg.sender != _delegateOwner, "4"); // Delegate cannot be pool creator

        Referee9 referee = Referee9(refereeAddress);
        require(referee.isKycApproved(msg.sender), "37"); // Owner must be kyc approved

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

        _stakeKeys(poolProxy, _keyIds, msg.sender, false);
        emit PoolCreated(
            stakingPools.length - 1,
            poolProxy,
            msg.sender,
            _keyIds.length
        );
    }

    /**
     * @notice Updates the metadata of a pool.
     * @param pool The address of the pool.
     * @param _poolMetadata Array of new metadata values.
     * @param _poolSocials Array of new social links.
     */
    function updatePoolMetadata(
        address pool,
        string[3] memory _poolMetadata,
        string[] memory _poolSocials
    ) external {
        StakingPool stakingPool = StakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "5"); // Only pool owner can update metadata
        stakingPool.updateMetadata(_poolMetadata, _poolSocials);
        emit UpdateMetadata(pool);
    }

    /**
     * @notice Updates the share configuration of a pool.
     * @param pool The address of the pool.
     * @param _shareConfig Array of new share configurations.
     */
    function updateShares(
        address pool,
        uint32[3] memory _shareConfig
    ) external {
        StakingPool stakingPool = StakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "6"); // Only pool owner can update shares
        require(validateShareValues(_shareConfig), "7"); // Validate share configuration
        stakingPool.updateShares(
            _shareConfig[0],
            _shareConfig[1],
            _shareConfig[2],
            updateRewardBreakdownDelayPeriod
        );
        emit UpdateShares(pool);
    }

    /**
     * @notice Validates the share configuration values.
     * @param _shareConfig Array of share configurations.
     * @return Boolean indicating if the share configuration is valid.
     */
    function validateShareValues(
        uint32[3] memory _shareConfig
    ) internal view returns (bool) {
        return
            _shareConfig[0] <= bucketshareMaxValues[0] &&
            _shareConfig[1] <= bucketshareMaxValues[1] &&
            _shareConfig[2] <= bucketshareMaxValues[2] &&
            _shareConfig[0] + _shareConfig[1] + _shareConfig[2] == 1_000_000;
    }

    /**
     * @notice Updates the delegate owner of a pool.
     * @param pool The address of the pool.
     * @param delegate The address of the new delegate owner.
     */
    function updateDelegateOwner(address pool, address delegate) external {
        StakingPool stakingPool = StakingPool(pool);
        require(poolsCreatedViaFactory[pool], "34"); // Pool must be created via factory
        require(stakingPool.getPoolOwner() == msg.sender, "8"); // Only pool owner can update delegate
        require(msg.sender != delegate, "9"); // New delegate cannot be pool owner

        // If staking pool already has delegate, remove pool from old delegate's list
        address oldDelegate = stakingPool.getDelegateOwner();
        if (oldDelegate != address(0)) {
            uint256 indexOfPoolToRemove = poolsOfDelegateIndices[pool]; // Index of pool in delegate's list
            address lastDelegatePoolId = poolsOfDelegate[oldDelegate][
                poolsOfDelegate[oldDelegate].length - 1
            ];

            poolsOfDelegateIndices[lastDelegatePoolId] = indexOfPoolToRemove;
            poolsOfDelegate[oldDelegate][
                indexOfPoolToRemove
            ] = lastDelegatePoolId;
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

    /**
     * @notice Internal function to stake keys in a pool.
     * @param pool The address of the pool.
     * @param keyIds Array of key IDs to be staked.
     * @param staker The address of the staker.
     * @param _asAdmin Boolean indicating if admin is staking on behalf of a user for airdropped keys.
     */
    function _stakeKeys(
        address pool,
        uint256[] memory keyIds,
        address staker,
        bool _asAdmin
    ) internal {
        Referee9 referee = Referee9(refereeAddress);
        require(_asAdmin || referee.stakingEnabled(), "52");
        
        referee.stakeKeys(pool, staker, keyIds, _asAdmin);

        StakingPool stakingPool = StakingPool(pool);
        stakingPool.stakeKeys(staker, keyIds);

        associateUserWithPool(staker, pool);

        emit StakeKeys(
            staker,
            pool,
            keyIds.length,
            stakingPool.getStakedKeysCountForUser(staker),
            stakingPool.getStakedKeysCount()
        );
    }

    /**
     * @notice Allows a user to stake keys in a pool.
     * @param pool The address of the pool.
     * @param keyIds Array of key IDs to be staked.
     */
    function stakeKeys(address pool, uint256[] memory keyIds) external {
        require(pool != address(0), "10"); // Invalid pool address
        require(keyIds.length > 0, "11"); // At least 1 key required
        require(poolsCreatedViaFactory[pool], "12"); // Pool must be created via factory

        _stakeKeys(pool, keyIds, msg.sender, false);
    }

    /**
     * @notice Allows an admin to stake keys on behalf of a user.
     * @param pool The address of the pool.
     * @param keyIds Array of key IDs to be staked.
     * @param staker The address of the staker.
     */
    function stakeKeysAdmin(
        address pool,
        uint256[] memory keyIds,
        address staker
    ) external onlyRole(STAKE_KEYS_ADMIN_ROLE) {
        require(pool != address(0), "10"); // Invalid pool address
        require(keyIds.length > 0, "11"); // At least 1 key required
        require(poolsCreatedViaFactory[pool], "12"); // Pool must be created via factory

        _stakeKeys(pool, keyIds, staker, true);
    }

    /**
     * @notice Removes the STAKE_KEYS_ADMIN_ROLE from an address.
     * @param account The address to remove the role from.
     */
    function revokeStakeKeysAdminRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(STAKE_KEYS_ADMIN_ROLE, account);
    }

    /**
     * @notice Creates an unstake key request.
     * @param pool The address of the pool.
     * @param keyAmount The number of keys to unstake.
     */
    function createUnstakeKeyRequest(address pool, uint256 keyAmount) external {
        require(keyAmount > 0, "13"); // At least 1 key required
        require(poolsCreatedViaFactory[pool], "14"); // Pool must be created via factory
        StakingPool(pool).createUnstakeKeyRequest(
            msg.sender,
            keyAmount,
            unstakeKeysDelayPeriod
        );

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            StakingPool(pool).getUnstakeRequestCount(msg.sender) - 1,
            keyAmount,
            true
        );
    }

    /**
     * @notice Creates an unstake request for the owner's last key.
     * @param pool The address of the pool.
     */
    function createUnstakeOwnerLastKeyRequest(address pool) external {
        require(poolsCreatedViaFactory[pool], "18"); // Pool must be created via factory
        StakingPool(pool).createUnstakeOwnerLastKeyRequest(
            msg.sender,
            unstakeGenesisKeyDelayPeriod
        );

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            StakingPool(pool).getUnstakeRequestCount(msg.sender) - 1,
            1,
            true
        );
    }

    /**
     * @notice Creates an unstake esXai request.
     * @param pool The address of the pool.
     * @param amount The amount of esXai to unstake.
     */
    function createUnstakeEsXaiRequest(address pool, uint256 amount) external {
        require(amount > 0, "20"); // Amount must be greater than 0
        require(poolsCreatedViaFactory[pool], "22"); // Pool must be created via factory
        StakingPool(pool).createUnstakeEsXaiRequest(
            msg.sender,
            amount,
            unstakeEsXaiDelayPeriod
        );

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            StakingPool(pool).getUnstakeRequestCount(msg.sender) - 1,
            amount,
            false
        );
    }

    /**
     * @notice Unstakes keys from a pool.
     * @param pool The address of the pool.
     * @param unstakeRequestIndex The index of the unstake request.
     * @param keyIds Array of key IDs to be unstaked.
     */
    function unstakeKeys(
        address pool,
        uint256 unstakeRequestIndex,
        uint256[] memory keyIds
    ) external {
        require(poolsCreatedViaFactory[pool], "23"); // Pool must be created via factory

        Referee9(refereeAddress).unstakeKeys(pool, msg.sender, keyIds);

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

    /**
     * @notice Stakes esXai in a pool.
     * @param pool The address of the pool.
     * @param amount The amount of esXai to stake.
     */
    function stakeEsXai(address pool, uint256 amount) external {
        require(poolsCreatedViaFactory[pool], "27"); // Pool must be created via factory

        Referee9(refereeAddress).stakeEsXai(pool, amount);
        esXai(esXaiAddress).transferFrom(msg.sender, address(this), amount);
        StakingPool stakingPool = StakingPool(pool);
        stakingPool.stakeEsXai(msg.sender, amount);

        associateUserWithPool(msg.sender, pool);

        emit StakeEsXai(
            msg.sender,
            pool,
            amount,
            stakingPool.getStakedAmounts(msg.sender),
            Referee9(refereeAddress).stakedAmounts(pool)
        );
    }

    /**
     * @notice Unstakes esXai from a pool.
     * @param pool The address of the pool.
     * @param unstakeRequestIndex The index of the unstake request.
     * @param amount The amount of esXai to unstake.
     */
    function unstakeEsXai(
        address pool,
        uint256 unstakeRequestIndex,
        uint256 amount
    ) external {
        require(poolsCreatedViaFactory[pool], "28"); // Pool must be created via factory

        esXai(esXaiAddress).transfer(msg.sender, amount);
        Referee9(refereeAddress).unstakeEsXai(pool, amount);
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
            Referee9(refereeAddress).stakedAmounts(pool)
        );
    }

    /**
     * @notice Associates a user with a pool.
     * @param user The address of the user.
     * @param pool The address of the pool.
     */
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

    /**
     * @notice Removes a user from a pool.
     * @param user The address of the user.
     * @param pool The address of the pool.
     */
    function removeUserFromPool(address user, address pool) internal {
        uint256 indexOfPool = userToInteractedPoolIds[user][pool];
        uint256 userLength = interactedPoolsOfUser[user].length;
        address lastPool = interactedPoolsOfUser[user][userLength - 1];

        interactedPoolsOfUser[user][indexOfPool] = lastPool;
        userToInteractedPoolIds[user][lastPool] = indexOfPool;

        interactedPoolsOfUser[user].pop();
    }

    /**
     * @notice Claims rewards from multiple pools.
     * @param pools Array of pool addresses.
     */
    function claimFromPools(address[] memory pools) external {
        uint256 poolsLength = pools.length;

        for (uint i = 0; i < poolsLength; i++) {
            address stakingPool = pools[i];
            require(poolsCreatedViaFactory[stakingPool], "33"); // Pool must be created via factory
            StakingPool(stakingPool).claimRewards(msg.sender);
            emit ClaimFromPool(msg.sender, stakingPool);
        }
    }

    /**
     * @notice Returns the list of pools for a delegate.
     * @param delegate The address of the delegate.
     * @return Array of pool addresses.
     */
    function getDelegatePools(
        address delegate
    ) external view returns (address[] memory) {
        return poolsOfDelegate[delegate];
    }

    /**
     * @notice Checks if a delegate is associated with a pool.
     * @param delegate The address of the delegate.
     * @param pool The address of the pool.
     * @return Boolean indicating if the delegate is associated with the pool.
     */
    function isDelegateOfPoolOrOwner(
        address delegate,
        address pool
    ) public view returns (bool) {
        return
            (poolsOfDelegate[delegate].length > poolsOfDelegateIndices[pool] &&
                poolsOfDelegate[delegate][poolsOfDelegateIndices[pool]] ==
                pool) || StakingPool(pool).getPoolOwner() == delegate;
    }

    /**
     * @notice Returns the total number of pools.
     * @return Total number of pools.
     */
    function getPoolsCount() external view returns (uint256) {
        return stakingPools.length;
    }

    /**
     * @notice Returns the list of pool addresses for a user.
     * @param user The address of the user.
     * @return Array of pool addresses.
     */
    function getPoolIndicesOfUser(
        address user
    ) external view returns (address[] memory) {
        return interactedPoolsOfUser[user];
    }

    /**
     * @notice Returns the total number of pools a user is associated with.
     * @param user The address of the user.
     * @return Total number of pools.
     */
    function getPoolsOfUserCount(address user) external view returns (uint256) {
        return interactedPoolsOfUser[user].length;
    }

    /**
     * @notice Returns the address of a pool by index.
     * @param poolIndex The index of the pool.
     * @return The address of the pool.
     */
    function getPoolAddress(uint256 poolIndex) external view returns (address) {
        return stakingPools[poolIndex];
    }

    /**
     * @notice Returns the address of a pool associated with a user by index.
     * @param user The address of the user.
     * @param index The index of the pool.
     * @return The address of the pool.
     */
    function getPoolAddressOfUser(
        address user,
        uint256 index
    ) external view returns (address) {
        return interactedPoolsOfUser[user][index];
    }

    /**
     * @notice Returns the list of unstaked key IDs for a user.
     * @param user The address of the user.
     * @param offset The offset for pagination.
     * @param pageLimit The limit for pagination.
     * @return unstakedKeyIds Array of unstaked key IDs.
     */
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
                Referee9(refereeAddress).assignedKeyToPool(keyId) == address(0)
            ) {
                unstakedKeyIds[currentIndexUnstaked] = keyId;
                currentIndexUnstaked++;
            }
        }
    }

    /**
     * @notice Checks if the keys are staked.
     * @param keyIds Array of key IDs.
     * @return isStaked Array of booleans indicating if the keys are staked.
     */
    function checkKeysAreStaked(
        uint256[] memory keyIds
    ) external view returns (bool[] memory isStaked) {
        isStaked = new bool[](keyIds.length);
        for (uint256 i; i < keyIds.length; i++) {
            isStaked[i] =
                Referee9(refereeAddress).assignedKeyToPool(keyIds[i]) !=
                address(0);
        }
    }

    function validateSubmitPoolAssertion(
        address pool, address user
    ) external view returns (bool) {
        require(poolsCreatedViaFactory[pool], "35"); // Pool must be created via factory

        if(!isDelegateOfPoolOrOwner(user, pool)){
            (uint256 userStakedEsXaiAmount, ,uint256[] memory userStakedKeyIds, ,) = StakingPool(pool).getUserPoolData(user);
            return userStakedEsXaiAmount > 0 || userStakedKeyIds.length > 0;
        }

        return true;
    }
}
