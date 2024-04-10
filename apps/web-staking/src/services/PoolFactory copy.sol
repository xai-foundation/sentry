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
import "../staking-v2/Utils.sol";
//import "../staking-v2/TransparentUpgradable.sol";
import "./PoolBeacon.sol";

// Error Codes
// 1: Invalid Proxy Admin
// 2: Invalid Pool Implementation
// 3: Invalid Bucket Implementation
// 4: Staking must be enabled before creating pool
// 5: At least 1 key needed to create a pool
// 6: Share configuration is invalid; _ownerShare, _keyBucketShare, and _stakedBucketShare must be less than or equal to the set bucketshareMaxValues[0], [1], and [2] values respectively. All 3 must also add up 10,000
// 7: Delegate cannot be pool creator
// 8: Invalid auth: msg.sender must be pool owner
// 9: Invalid auth: msg.sender must be pool owner
// 10: Share configuration is invalid; _ownerShare, _keyBucketShare, and _stakedBucketShare must be less than or equal to the set bucketshareMaxValues[0], [1], and [2] values respectively. All 3 must also add up 10,000
// 11: Invalid auth: msg.sender must be pool owner
// 12: New delegate cannot be pool owner
// 13: Invalid pool; cannot be 0 address
// 14: Invalid key stake; must at least stake 1 key
// 15: Invalid pool for key stake; pool needs to have been created via the PoolFactory
// 16: Invalid key un-stake; must un-stake at least 1 key
// 17: Invalid pool for key un-stake request; pool needs to have been created via the PoolFactory
// 18: Invalid un-stake; not enough keys for owner to un-stake this many - to un-stake all keys, first un-stake all buy 1, then use createUnstakeOwnerLastKeyRequest
// 19: Invalid un-stake; not enough keys for you to un-stake this many - your staked key amount must be greater than or equal to the combined total of any pending un-stake requests with this pool & the current un-stake request
// 20: This can only be called by the pool owner
// 21: Invalid pool for owner last key un-stake request; pool needs to have been created via the PoolFactory
// 22: Owner must have one more key stakes than any pending un-stake requests from the same pool; if you have no un-stake requests waiting, you must have 1 key staked
// 23: Invalid esXai un-stake request; amount must be greater than 0
// 24: Invalid esXai un-stake request; your requested esXai amount must be greater than equal to the combined total of any pending un-stake requests with this pool & the current un-stake request
// 25: Invalid pool for esXai un-stake request; pool needs to have been created via the PoolFactory
// 26: Invalid pool for key un-stake; pool needs to have been created via the PoolFactory
// 27: Request must be open & a key request
// 28: Wait period for this key un-stake request is not yet over
// 29: You must un-stake at least 1 key, and the amount must match the un-stake request
// 30: Invalid pool for esXai stake; pool needs to have been created via the PoolFactory
// 31: Invalid pool for esXai un-stake; pool needs to have been created via the PoolFactory
// 32: Request must be open & an esXai request
// 33: Wait period for this esXai un-stake request is not yet over
// 34: You must un-stake at least 1 esXai, and the amount must match the un-stake request
// 35: You must have at least the desired un-stake amount staked in order to un-stake
// 36: Invalid pool for claim; pool needs to have been created via the PoolFactory

contract Deployer {
    address public poolBeacon;
    address public keyBucketBeacon;
    address public esXaiBeacon;

    function createPool()
        external
        returns (
            address poolProxy,
            address keyBucketProxy,
            address esXaiBucketProxy
        )
    {
        poolProxy = address(new BeaconProxy(address(poolBeacon), ""));

        keyBucketProxy = address(new BeaconProxy(address(keyBucketBeacon), ""));

        esXaiBucketProxy = address(new BeaconProxy(address(esXaiBeacon), ""));
    }
}

contract PoolFactory is Initializable, AccessControlEnumerableUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    address public deployerAddress;

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

    // The proxy admin for the staking pools and buckets
    address public stakingPoolProxyAdmin;

    // The current staking pool implementation
    address public stakingPoolImplementation;

    // The current key & esXai bucket tracker implenetation
    address public bucketImplementation;

    mapping(address => address[]) public interactedPoolsOfUser;

    // mapping user address to pool address to index in user array, used for removing from user array without interation
    mapping(address => mapping(address => uint256))
        public userToInteractedPoolIds;

    // mapping userAddress to unstake requests, unstake has a delay of 30 days
    mapping(address => UnstakeRequest[]) private unstakeRequests;

    // mapping userAddress to poolAddress to requested unstake key amount
    mapping(address => mapping(address => uint256))
        private userRequestedUnstakeKeyAmount;

    // mapping userAddress to poolAddress to requested unstake esXai amount
    mapping(address => mapping(address => uint256))
        private userRequestedUnstakeEsXaiAmount;

    // mapping delegates to pools they are delegates of
    mapping(address => address[]) public poolsOfDelegate;

    // mapping of pool address to indices in the poolsOfDelegate[delegate] array
    mapping(address => uint256) public poolsOfDelegateIndices;

    // mapping of pool address => true if create via this factory
    mapping(address => bool) public poolsCreatedViaFactory;

    address public poolBeacon;
    address public keyBucketBeacon;
    address public esXaiBeacon;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    struct UnstakeRequest {
        bool open;
        bool isKeyRequest;
        address poolAddress;
        uint256 amount;
        uint256 lockTime;
        uint256 completeTime;
        uint256[5] __gap;
    }

    event StakingEnabled();
    event UpdatePoolProxyAdmin(address previousAdmin, address newAdmin);
    event UpdatePoolImplementation(
        address prevImplementation,
        address newImplementation
    );
    event UpdateBucketImplementation(
        address prevImplementation,
        address newImplementation
    );
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
        address _nodeLicenseAddress,
        address _stakingPoolProxyAdmin,
        address _stakingPoolImplementation,
        address _bucketImplementation
    ) public initializer {
        __AccessControlEnumerable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        bucketshareMaxValues[0] = 100_000; // => 10%
        bucketshareMaxValues[1] = 900_000; // => 90%
        bucketshareMaxValues[2] = 300_000; // => 30%

        refereeAddress = _refereeAddress;
        nodeLicenseAddress = _nodeLicenseAddress;
        esXaiAddress = _esXaiAddress;
        stakingPoolProxyAdmin = _stakingPoolProxyAdmin;
        stakingPoolImplementation = _stakingPoolImplementation;
        bucketImplementation = _bucketImplementation;

        // poolBeacon = address(new PoolBeacon(_stakingPoolImplementation));
        // keyBucketBeacon = address(new PoolBeacon(_bucketImplementation));
        // poolBeacon = address(new PoolBeacon(_bucketImplementation));
    }

    /**
     * @notice Enables staking on the Factory.
     */
    function enableStaking() external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakingEnabled = true;
        emit StakingEnabled();
    }

    function updateProxyAdmin(
        address newAdmin
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "1");
        address previousAdmin = stakingPoolProxyAdmin;
        stakingPoolProxyAdmin = newAdmin;
        emit UpdatePoolProxyAdmin(previousAdmin, newAdmin);
    }

    //    function updatePoolImplementation(
    //        address newImplementation
    //    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    //        require(newImplementation != address(0), "2");
    //        address prevImplementation = stakingPoolImplementation;
    //        stakingPoolImplementation = newImplementation;
    //        emit UpdatePoolImplementation(prevImplementation, newImplementation);
    //    }
    //
    //    function updateBucketImplementation(
    //        address newImplementation
    //    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    //        require(newImplementation != address(0), "3");
    //        address prevImplementation = bucketImplementation;
    //        bucketImplementation = newImplementation;
    //        emit UpdateBucketImplementation(prevImplementation, newImplementation);
    //    }

    function createPool(
        address _delegateOwner,
        uint256[] memory _keyIds,
        uint32[3] memory _shareConfig,
        string[3] memory _poolMetadata,
        string[] memory _poolSocials,
        string[2][2] memory trackerDetails
    ) external {
        require(stakingEnabled, "4");
        require(_keyIds.length > 0, "5");
        require(validateShareValues(_shareConfig), "6");
        require(msg.sender != _delegateOwner, "7");

        (
            address poolProxy,
            address keyBucketProxy,
            address esXaiBucketProxy
        ) = Deployer(deployerAddress).createPool();

        IStakingPool(poolProxy).initialize(
            refereeAddress,
            esXaiAddress,
            msg.sender,
            _delegateOwner,
            keyBucketProxy,
            esXaiBucketProxy
        );

        IStakingPool(poolProxy).initShares(
            _shareConfig[0],
            _shareConfig[1],
            _shareConfig[2]
        );

        IStakingPool(poolProxy).updateMetadata(_poolMetadata, _poolSocials);

        IBucketTracker(keyBucketProxy).initialize(
            poolProxy,
            esXaiAddress,
            trackerDetails[0][0],
            trackerDetails[0][1],
            0
        );

        IBucketTracker(esXaiBucketProxy).initialize(
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

    //    function createPool(
    //        uint256[] memory keyIds,
    //        uint32 _ownerShare,
    //		uint32 _keyBucketShare,
    //		uint32 _stakedBucketShare,
    //        string memory _name,
    //        string memory _description,
    //        string memory _logo,
    //        string[] memory _socials,
    //        string[] memory trackerNames,
    //        string[] memory trackerSymbols,
    //		address _delegateOwner
    //    ) external {
    //        require(stakingEnabled, "4");
    //        require(keyIds.length > 0, "5");
    //		require(validateShareValues(_ownerShare, _keyBucketShare, _stakedBucketShare), "6");
    //		require(msg.sender != _delegateOwner, "7");

    //        address poolProxy = address(
    //            new TransparentUpgradeableProxyImplementation(
    //                stakingPoolImplementation,
    //                stakingPoolProxyAdmin,
    //                ""
    //            )
    //        );
    //
    //        address keyBucketProxy = address(
    //            new TransparentUpgradeableProxyImplementation(
    //                bucketImplementation,
    //                stakingPoolProxyAdmin,
    //                ""
    //            )
    //        );
    //
    //        address esXaiBucketProxy = address(
    //            new TransparentUpgradeableProxyImplementation(
    //                bucketImplementation,
    //                stakingPoolProxyAdmin,
    //                ""
    //            )
    //        );
    //
    //        IStakingPool(poolProxy).initialize(
    //            refereeAddress,
    //            esXaiAddress,
    //            msg.sender,
    //			_delegateOwner,
    //            keyBucketProxy,
    //            esXaiBucketProxy
    //        );
    //
    //		// Add pool to delegate's list
    //		if (_delegateOwner != address(0)) {
    //			poolsOfDelegateIndices[poolProxy] = poolsOfDelegate[_delegateOwner].length;
    //			poolsOfDelegate[_delegateOwner].push(poolProxy);
    //		}
    //
    //        IStakingPool(poolProxy).initShares(
    //            _ownerShare,
    //            _keyBucketShare,
    //            _stakedBucketShare
    //        );
    //
    //        IStakingPool(poolProxy).updateMetadata(
    //            _name,
    //            _description,
    //            _logo,
    //            _socials
    //        );
    //
    //        IBucketTracker(keyBucketProxy).initialize(
    //            poolProxy,
    //            esXaiAddress,
    //            trackerNames[0],
    //            trackerSymbols[0],
    //            0
    //        );
    //
    //        IBucketTracker(esXaiBucketProxy).initialize(
    //            poolProxy,
    //            esXaiAddress,
    //            trackerNames[1],
    //            trackerSymbols[1],
    //            18
    //        );
    //
    //        stakingPools.push(poolProxy);
    //		poolsCreatedViaFactory[poolProxy] = true;
    //
    //        esXai(esXaiAddress).addToWhitelist(poolProxy);
    //        esXai(esXaiAddress).addToWhitelist(keyBucketProxy);
    //        esXai(esXaiAddress).addToWhitelist(esXaiBucketProxy);
    //
    //        _stakeKeys(poolProxy, keyIds);
    //		uint256 keyQuantity = keyIds.length;
    //		emit PoolCreated(stakingPools.length - 1, poolProxy, msg.sender, keyQuantity);
    //    }

    function updatePoolMetadata(
        address pool,
        string[3] memory _poolMetadata,
        string[] memory _poolSocials
    ) external {
        IStakingPool stakingPool = IStakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "8");
        stakingPool.updateMetadata(_poolMetadata, _poolSocials);
    }

    function updateShares(
        address pool,
        uint32[3] memory _shareConfig
    ) external {
        IStakingPool stakingPool = IStakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "9");
        require(validateShareValues(_shareConfig), "10");
        stakingPool.updateShares(
            _shareConfig[0],
            _shareConfig[1],
            _shareConfig[2]
        );
    }

    //	function validateShareValues(uint32 _ownerShare, uint32 _keyBucketShare, uint32 _stakedBucketShare) internal returns (bool) {
    function validateShareValues(
        uint32[3] memory _shareConfig
    ) internal returns (bool) {
        return
            _shareConfig[0] <= bucketshareMaxValues[0] &&
            _shareConfig[1] <= bucketshareMaxValues[1] &&
            _shareConfig[2] <= bucketshareMaxValues[2] &&
            _shareConfig[0] + _shareConfig[1] + _shareConfig[2] == 1_000_000;
    }

    function updateDelegateOwner(address pool, address delegate) external {
        IStakingPool stakingPool = IStakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "11");
        require(msg.sender != delegate, "12");

        // If staking pool already has delegate, remove pool from delegate's list
        if (stakingPool.getDelegateOwner() != address(0)) {
            uint256 indexOfPoolToRemove = poolsOfDelegateIndices[pool]; // index of pool in question in delegate's list
            address lastDelegatePoolId = poolsOfDelegate[delegate][
                poolsOfDelegate[delegate].length - 1
            ];

            poolsOfDelegateIndices[lastDelegatePoolId] = indexOfPoolToRemove;
            poolsOfDelegate[delegate][indexOfPoolToRemove] = lastDelegatePoolId;
            poolsOfDelegate[delegate].pop();
        }

        // Add pool to delegate's list
        if (delegate != address(0)) {
            poolsOfDelegateIndices[pool] = poolsOfDelegate[delegate].length;
            poolsOfDelegate[delegate].push(pool);
        }

        stakingPool.updateDelegateOwner(delegate);

        emit UpdatePoolDelegate(delegate, pool);
    }

    function userPoolInfo(
        address pool,
        address user
    ) internal view returns (uint256 stakeAmount, uint256 keyAmount) {
        stakeAmount = IStakingPool(pool).getStakedAmounts(user);
        keyAmount = IStakingPool(pool).getStakedKeysCountForUser(user);
    }

    function _stakeKeys(address pool, uint256[] memory keyIds) internal {
        // Check if we already know that the user has interacted with this pool
        // If not add pool index to
        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );

        if (stakeAmount == 0 && keyAmount == 0) {
            associateUserWithPool(pool);
        }

        // Get the pool owner poolOwner
        Referee5(refereeAddress).stakeKeys(pool, msg.sender, keyIds);
        IStakingPool(pool).stakeKeys(msg.sender, keyIds);

        emit StakeKeys(
            msg.sender,
            pool,
            keyIds.length,
            keyAmount + keyIds.length,
            IStakingPool(pool).getStakedKeysCount()
        );
    }

    function stakeKeys(address pool, uint256[] memory keyIds) external {
        require(pool != address(0), "13");
        require(keyIds.length > 0, "14");
        require(poolsCreatedViaFactory[pool], "15");

        _stakeKeys(pool, keyIds);
    }

    function createUnstakeKeyRequest(address pool, uint256 keyAmount) external {
        require(keyAmount > 0, "16");
        require(poolsCreatedViaFactory[pool], "17");

        uint256 stakedKeysCount = IStakingPool(pool).getStakedKeysCountForUser(
            msg.sender
        );

        uint256 requestKeys = userRequestedUnstakeKeyAmount[msg.sender][pool];

        if (IStakingPool(pool).getPoolOwner() == msg.sender) {
            require(stakedKeysCount > keyAmount + requestKeys, "18");
        } else {
            require(stakedKeysCount >= keyAmount + requestKeys, "19");
        }

        UnstakeRequest[] storage userRequests = unstakeRequests[msg.sender];

        userRequests.push(
            UnstakeRequest(
                true,
                true,
                pool,
                keyAmount,
                block.timestamp + 30 days,
                0,
                [uint256(0), 0, 0, 0, 0]
            )
        );

        userRequestedUnstakeKeyAmount[msg.sender][pool] += keyAmount;

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            userRequests.length - 1,
            keyAmount,
            true
        );
    }

    function createUnstakeOwnerLastKeyRequest(address pool) external {
        require(IStakingPool(pool).getPoolOwner() == msg.sender, "20");
        require(poolsCreatedViaFactory[pool], "21");

        uint256 stakedKeysCount = IStakingPool(pool).getStakedKeysCountForUser(
            msg.sender
        );

        require(
            stakedKeysCount ==
                userRequestedUnstakeKeyAmount[msg.sender][pool] + 1,
            "22"
        );

        UnstakeRequest[] storage userRequests = unstakeRequests[msg.sender];

        userRequests.push(
            UnstakeRequest(
                true,
                true,
                pool,
                1,
                block.timestamp + 60 days,
                0,
                [uint256(0), 0, 0, 0, 0]
            )
        );

        userRequestedUnstakeKeyAmount[msg.sender][pool] += 1;

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            userRequests.length - 1,
            1,
            true
        );
    }

    function createUnstakeEsXaiRequest(address pool, uint256 amount) external {
        require(amount > 0, "23");
        require(
            IStakingPool(pool).getStakedAmounts(msg.sender) >=
                amount + userRequestedUnstakeEsXaiAmount[msg.sender][pool],
            "24"
        );
        require(poolsCreatedViaFactory[pool], "25");

        UnstakeRequest[] storage userRequests = unstakeRequests[msg.sender];

        userRequests.push(
            UnstakeRequest(
                true,
                false,
                pool,
                amount,
                block.timestamp + 30 days,
                0,
                [uint256(0), 0, 0, 0, 0]
            )
        );

        userRequestedUnstakeEsXaiAmount[msg.sender][pool] += amount;

        emit UnstakeRequestStarted(
            msg.sender,
            pool,
            userRequests.length - 1,
            amount,
            false
        );
    }

    function unstakeKeys(
        uint256 unstakeRequestIndex,
        uint256[] memory keyIds
    ) external {
        UnstakeRequest storage request = unstakeRequests[msg.sender][
            unstakeRequestIndex
        ];
        address pool = request.poolAddress;
        require(poolsCreatedViaFactory[pool], "26");
        uint256 keysLength = keyIds.length;
        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );

        require(request.open && request.isKeyRequest, "27");
        require(block.timestamp >= request.lockTime, "28");
        require(keysLength > 0 && request.amount == keysLength, "29");

        Referee5(refereeAddress).unstakeKeys(pool, msg.sender, keyIds);
        IStakingPool(pool).unstakeKeys(msg.sender, keyIds);

        if (
            stakeAmount == 0 &&
            keyAmount - keysLength == 0 &&
            IStakingPool(pool).getPoolOwner() != msg.sender
        ) {
            removeUserFromPool(msg.sender, pool);
        }

        userRequestedUnstakeKeyAmount[msg.sender][pool] -= keysLength;
        request.open = false;
        request.completeTime = block.timestamp;

        emit UnstakeKeys(
            msg.sender,
            pool,
            keysLength,
            keyAmount - keysLength,
            IStakingPool(pool).getStakedKeysCount()
        );
    }

    function stakeEsXai(address pool, uint256 amount) external {
        require(poolsCreatedViaFactory[pool], "30");

        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );

        if (stakeAmount == 0 && keyAmount == 0) {
            associateUserWithPool(pool);
        }

        Referee5(refereeAddress).stakeEsXai(pool, amount);

        esXai(esXaiAddress).transferFrom(msg.sender, address(this), amount);

        IStakingPool(pool).stakeEsXai(msg.sender, amount);

        emit StakeEsXai(
            msg.sender,
            pool,
            amount,
            stakeAmount + amount,
            Referee5(refereeAddress).stakedAmounts(pool)
        );
    }

    function associateUserWithPool(address pool) internal {
        address[] storage userPools = interactedPoolsOfUser[msg.sender];
        if (
            userPools.length < 1 ||
            pool != userPools[userToInteractedPoolIds[msg.sender][pool]]
        ) {
            userToInteractedPoolIds[msg.sender][pool] = userPools.length;
            userPools.push(pool);
        }
    }

    function unstakeEsXai(
        uint256 unstakeRequestIndex,
        uint256 amount
    ) external {
        UnstakeRequest storage request = unstakeRequests[msg.sender][
            unstakeRequestIndex
        ];
        address pool = request.poolAddress;
        require(poolsCreatedViaFactory[pool], "31");
        require(request.open && !request.isKeyRequest, "32");
        require(block.timestamp >= request.lockTime, "33");
        require(amount > 0 && request.amount == amount, "34");

        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );

        require(stakeAmount >= amount, "35");

        esXai(esXaiAddress).transfer(msg.sender, amount);

        Referee5(refereeAddress).unstakeEsXai(pool, amount);

        IStakingPool(pool).unstakeEsXai(msg.sender, amount);

        if (
            stakeAmount - amount == 0 &&
            keyAmount == 0 &&
            IStakingPool(pool).getPoolOwner() != msg.sender
        ) {
            removeUserFromPool(msg.sender, pool);
        }

        userRequestedUnstakeEsXaiAmount[msg.sender][pool] -= amount;
        request.open = false;
        request.completeTime = block.timestamp;

        emit UnstakeEsXai(
            msg.sender,
            pool,
            amount,
            stakeAmount - amount,
            Referee5(refereeAddress).stakedAmounts(pool)
        );
    }

    function removeUserFromPool(address user, address pool) internal {
        uint256 indexOfPool = userToInteractedPoolIds[user][pool];
        uint256 userLength = interactedPoolsOfUser[user].length;
        interactedPoolsOfUser[user][indexOfPool] = interactedPoolsOfUser[user][
            userLength - 1
        ];
        interactedPoolsOfUser[user].pop();
    }

    function claimFromPools(address[] memory pools) external {
        uint256 poolsLength = pools.length;

        for (uint i = 0; i < poolsLength; i++) {
            address stakingPool = pools[i];
            require(poolsCreatedViaFactory[stakingPool], "36");
            IStakingPool(stakingPool).claimRewards(msg.sender);
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
        return
            poolsOfDelegate[delegate][poolsOfDelegateIndices[pool]] == pool ||
            IStakingPool(pool).getPoolOwner() == delegate;
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

    function getUnstakeRequest(
        address account,
        uint256 index
    ) public view returns (UnstakeRequest memory) {
        return unstakeRequests[account][index];
    }

    function getUnstakeRequestCount(
        address account
    ) public view returns (uint256) {
        return unstakeRequests[account].length;
    }

    function getUserRequestedUnstakeAmounts(
        address user,
        address pool
    ) external view returns (uint256 keyAmount, uint256 esXaiAmount) {
        keyAmount = userRequestedUnstakeKeyAmount[user][pool];
        esXaiAmount = userRequestedUnstakeEsXaiAmount[user][pool];
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
