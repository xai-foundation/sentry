// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../upgrades/referee/Referee5.sol";
import "../Xai.sol";
import "../esXai.sol";
import "../staking-v2/Utils.sol";
import "../staking-v2/TransparentUpgradable.sol";

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

    // Staking Pool share max values owner, keys, stakedEsXai in basepoints (5% => 500)
    uint16[3] public bucketshareMaxValues;

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
        address _stakingPoolProxyAdmin,
        address _stakingPoolImplementation,
        address _bucketImplementation
    ) public initializer {
        __AccessControlEnumerable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        bucketshareMaxValues[0] = 1000; // => 10%
        bucketshareMaxValues[1] = 9000; // => 90%
        bucketshareMaxValues[2] = 3000; // => 30%

        refereeAddress = _refereeAddress;
        esXaiAddress = _esXaiAddress;
        stakingPoolProxyAdmin = _stakingPoolProxyAdmin;
        stakingPoolImplementation = _stakingPoolImplementation;
        bucketImplementation = _bucketImplementation;
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
        require(newAdmin != address(0), "Invalid Admin");
        address previousAdmin = stakingPoolProxyAdmin;
        stakingPoolProxyAdmin = newAdmin;
        emit UpdatePoolProxyAdmin(previousAdmin, newAdmin);
    }

    function updatePoolImplementation(
        address newImplementation
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newImplementation != address(0), "Invalid Implementation");
        address prevImplementation = stakingPoolImplementation;
        stakingPoolImplementation = newImplementation;
        emit UpdatePoolImplementation(prevImplementation, newImplementation);
    }

    function updateBucketImplementation(
        address newImplementation
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newImplementation != address(0), "Invalid Implementation");
        address prevImplementation = bucketImplementation;
        bucketImplementation = newImplementation;
        emit UpdateBucketImplementation(prevImplementation, newImplementation);
    }

    function createPool(
        uint256[] memory keyIds,
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare,
        string memory _name,
        string memory _description,
        string memory _logo,
        string[] memory _socials,
        string[] memory trackerNames,
        string[] memory trackerSymbols
    ) external {
        require(stakingEnabled, "Staking must be enabled");
        require(keyIds.length > 0, "Pool requires at least 1 key");
        require(
            _ownerShare <= bucketshareMaxValues[0] &&
                _keyBucketShare <= bucketshareMaxValues[1] &&
                _stakedBucketShare <= bucketshareMaxValues[2] &&
                _ownerShare + _keyBucketShare + _stakedBucketShare == 10_000,
            "Invalid shares"
        );

        address poolProxy = address(
            new TransparentUpgradeableProxyImplementation(
                stakingPoolImplementation,
                stakingPoolProxyAdmin,
                ""
            )
        );
        address keyBucketProxy = address(
            new TransparentUpgradeableProxyImplementation(
                bucketImplementation,
                stakingPoolProxyAdmin,
                ""
            )
        );

        address esXaiBucketProxy = address(
            new TransparentUpgradeableProxyImplementation(
                bucketImplementation,
                stakingPoolProxyAdmin,
                ""
            )
        );

        IStakingPool(poolProxy).initialize(
            refereeAddress,
            esXaiAddress,
            msg.sender,
            keyBucketProxy,
            esXaiBucketProxy
        );

        IStakingPool(poolProxy).initShares(
            _ownerShare,
            _keyBucketShare,
            _stakedBucketShare
        );

        IStakingPool(poolProxy).updateMetadata(
            _name,
            _description,
            _logo,
            _socials
        );

        IBucketTracker(keyBucketProxy).initialize(
            poolProxy,
            esXaiAddress,
            trackerNames[0],
            trackerSymbols[0],
            0
        );
        IBucketTracker(esXaiBucketProxy).initialize(
            poolProxy,
            esXaiAddress,
            trackerNames[1],
            trackerSymbols[1],
            18
        );

        stakingPools.push(poolProxy);

        esXai(esXaiAddress).addToWhitelist(poolProxy);
        esXai(esXaiAddress).addToWhitelist(keyBucketProxy);
        esXai(esXaiAddress).addToWhitelist(esXaiBucketProxy);

        _stakeKeys(poolProxy, keyIds);
    }

    function updatePoolMetadata(
        address pool,
        string memory _name,
        string memory _description,
        string memory _logo,
        string[] memory _socials
    ) external {
        IStakingPool stakingPool = IStakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "Invalid auth");
        stakingPool.updateMetadata(_name, _description, _logo, _socials);
    }

    function updateShares(
        address pool,
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare
    ) external {
        IStakingPool stakingPool = IStakingPool(pool);
        require(stakingPool.getPoolOwner() == msg.sender, "Invalid auth");
        require(
            _ownerShare <= bucketshareMaxValues[0] &&
                _keyBucketShare <= bucketshareMaxValues[1] &&
                _stakedBucketShare <= bucketshareMaxValues[2] &&
                _ownerShare + _keyBucketShare + _stakedBucketShare == 10_000,
            "Invalid shares"
        );
        stakingPool.updateShares(
            _ownerShare,
            _keyBucketShare,
            _stakedBucketShare
        );
    }

    function userPoolInfo(
        address pool,
        address user
    ) internal view returns (uint256 stakeAmount, uint256 keyAmount) {
        stakeAmount = IStakingPool(pool).getStakedAmounts(user);
        keyAmount = IStakingPool(pool).getStakedKeysCountForUser(user);
    }

    function _stakeKeys(address pool, uint256[] memory keyIds) internal {
        //Check if we already know that the user has interacted with this pool
        //If not add pool index to
        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );
        if (stakeAmount == 0 && keyAmount == 0) {
            userToInteractedPoolIds[msg.sender][pool] = interactedPoolsOfUser[
                msg.sender
            ].length;
            interactedPoolsOfUser[msg.sender].push(pool);
        }

        //get the pool owner poolOwner
        Referee5(refereeAddress).stakeKeys(
            pool,
            IStakingPool(pool).getPoolOwner(),
            msg.sender,
            keyIds
        );
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
        require(pool != address(0), "Invalid pool");
        require(keyIds.length > 0, "Must at least stake 1 key");

        _stakeKeys(pool, keyIds);
    }

    function createUnstakeKeyRequest(address pool, uint256 keyAmount) external {
        require(keyAmount > 0, "Invalid Amount");

        uint256 stakedKeysCount = IStakingPool(pool).getStakedKeysCountForUser(
            msg.sender
        );

        if (IStakingPool(pool).getPoolOwner() == msg.sender) {
            require(
                stakedKeysCount >
                    keyAmount + userRequestedUnstakeKeyAmount[msg.sender][pool],
                "Insufficient keys staked"
            );
        } else {
            require(
                stakedKeysCount >=
                    keyAmount + userRequestedUnstakeKeyAmount[msg.sender][pool],
                "Insufficient keys staked"
            );
        }

        unstakeRequests[msg.sender].push(
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
            unstakeRequests[msg.sender].length - 1,
            keyAmount,
            true
        );
    }

    function createUnstakeOwnerLastKeyRequest(address pool) external {
        require(IStakingPool(pool).getPoolOwner() == msg.sender, "Invalid owner");

        uint256 stakedKeysCount = IStakingPool(pool).getStakedKeysCountForUser(
            msg.sender
        );

        require(
            stakedKeysCount == userRequestedUnstakeKeyAmount[msg.sender][pool] + 1,
            "Invalid stake count"
        );
        
        unstakeRequests[msg.sender].push(
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
            unstakeRequests[msg.sender].length - 1,
            1,
            true
        );
    }

    function createUnstakeEsXaiRequest(address pool, uint256 amount) external {
        require(amount > 0, "Invalid Amount");
        require(
            IStakingPool(pool).getStakedAmounts(msg.sender) >=
                amount + userRequestedUnstakeEsXaiAmount[msg.sender][pool],
            "Insufficient esXai staked"
        );

        unstakeRequests[msg.sender].push(
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
            unstakeRequests[msg.sender].length - 1,
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
        uint256 keysLength = keyIds.length;
        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );

        require(request.open && request.isKeyRequest, "Invalid request");
        require(
            block.timestamp >= request.lockTime,
            "Wait period not yet over"
        );
        require(
            keysLength > 0 && request.amount == keysLength,
            "Invalid key amount"
        );

        Referee5(refereeAddress).unstakeKeys(
            pool,
            IStakingPool(pool).getPoolOwner(),
            msg.sender,
            keyIds
        );
        IStakingPool(pool).unstakeKeys(msg.sender, keyIds);

        if (stakeAmount == 0 && keyAmount - keysLength == 0) {
            uint256 indexOfPool = userToInteractedPoolIds[msg.sender][pool];
            uint256 userLength = interactedPoolsOfUser[msg.sender].length;
            interactedPoolsOfUser[msg.sender][
                indexOfPool
            ] = interactedPoolsOfUser[msg.sender][userLength - 1];
            interactedPoolsOfUser[msg.sender].pop();
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
        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );
        if (stakeAmount == 0 && keyAmount == 0) {
            userToInteractedPoolIds[msg.sender][pool] = interactedPoolsOfUser[
                msg.sender
            ].length;
            interactedPoolsOfUser[msg.sender].push(pool);
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

    function unstakeEsXai(uint256 unstakeRequestIndex, uint256 amount) external {
		UnstakeRequest storage request = unstakeRequests[msg.sender][unstakeRequestIndex];
		address pool = request.poolAddress;
		require(request.open && !request.isKeyRequest, "Invalid request");
		require(
			block.timestamp >= request.lockTime,
			"Wait period not yet over"
		);
		require(amount > 0 && request.amount == amount, "Invalid esXai amount");

        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );

        require(stakeAmount >= amount, "Insufficient amount staked");

        esXai(esXaiAddress).transfer(msg.sender, amount);

        Referee5(refereeAddress).unstakeEsXai(pool, amount);

        IStakingPool(pool).unstakeEsXai(msg.sender, amount);

        if (stakeAmount - amount == 0 && keyAmount == 0) {
            uint256 indexOfPool = userToInteractedPoolIds[msg.sender][pool];
            uint256 userLength = interactedPoolsOfUser[msg.sender].length;
            interactedPoolsOfUser[msg.sender][
                indexOfPool
            ] = interactedPoolsOfUser[msg.sender][userLength - 1];
            interactedPoolsOfUser[msg.sender].pop();
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

    function claimFromPools(address[] memory pools) external {
        uint256 poolsLength = pools.length;

        for (uint i = 0; i < poolsLength; i++) {
            address stakingPool = pools[i];
            IStakingPool(stakingPool).claimRewards(msg.sender);
            emit ClaimFromPool(msg.sender, stakingPool);
        }
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
