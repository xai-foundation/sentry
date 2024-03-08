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

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

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
        uint256 totalStaked
    );
    event UnstakeEsXai(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 totalStaked
    );
    event StakedKeys(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 totalKeysStaked
    );
    event UnstakeKeys(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 totalKeysStaked
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
        bucketshareMaxValues[1] = 9000; // => 55%
        bucketshareMaxValues[2] = 3000; // => 55%

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

        TransparentUpgradeableProxyImplementation poolProxy = new TransparentUpgradeableProxyImplementation(
                stakingPoolImplementation,
                stakingPoolProxyAdmin,
                ""
            );
        TransparentUpgradeableProxyImplementation keyBucketProxy = new TransparentUpgradeableProxyImplementation(
                bucketImplementation,
                stakingPoolProxyAdmin,
                ""
            );

        TransparentUpgradeableProxyImplementation stakedBucketProxy = new TransparentUpgradeableProxyImplementation(
                bucketImplementation,
                stakingPoolProxyAdmin,
                ""
            );

        IStakingPool(address(poolProxy)).initialize(
            address(this),
            esXaiAddress,
            msg.sender,
            address(keyBucketProxy),
            address(stakedBucketProxy)
        );

        IStakingPool(address(poolProxy)).initShares(
            _ownerShare,
            _keyBucketShare,
            _stakedBucketShare
        );

        IStakingPool(address(poolProxy)).updateMetadata(
            _name,
            _description,
            _logo,
            _socials
        );

        IBucketTracker(address(keyBucketProxy)).initialize(
            address(poolProxy),
            esXaiAddress,
            trackerNames[0],
            trackerSymbols[0],
            0
        );
        IBucketTracker(address(stakedBucketProxy)).initialize(
            address(poolProxy),
            esXaiAddress,
            trackerNames[1],
            trackerSymbols[1],
            18
        );

        stakingPools.push(address(poolProxy));

        esXai(esXaiAddress).addToWhitelist(address(poolProxy));
        esXai(esXaiAddress).addToWhitelist(address(keyBucketProxy));
        esXai(esXaiAddress).addToWhitelist(address(stakedBucketProxy));

        _stakeKeys(address(poolProxy), keyIds);
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
        Referee5(refereeAddress).stakeKeys(pool, IStakingPool(pool).getPoolOwner(), msg.sender, keyIds);
        IStakingPool(pool).stakeKeys(msg.sender, keyIds);

        //TODO emit V2 event
    }

    function stakeKeys(address pool, uint256[] memory keyIds) external {
        require(pool != address(0), "Invalid pool");
        require(keyIds.length > 0, "Must at least stake 1 key");

        _stakeKeys(pool, keyIds);
    }

    function unstakeKeys(address pool, uint256[] memory keyIds) external {
        require(pool != address(0), "Invalid pool");
        uint256 keysLength = keyIds.length;
        require(keysLength > 0, "Must at least unstake 1 key");

        Referee5(refereeAddress).unstakeKeys(pool, msg.sender, IStakingPool(pool).getPoolOwner(), keyIds);
        IStakingPool(pool).unstakeKeys(msg.sender, keyIds);

        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );
        if (stakeAmount == 0 && keyAmount == 0) {
            uint256 indexOfPool = userToInteractedPoolIds[msg.sender][pool];
            uint256 userLength = interactedPoolsOfUser[msg.sender].length;
            interactedPoolsOfUser[msg.sender][
                indexOfPool
            ] = interactedPoolsOfUser[msg.sender][userLength - 1];
            interactedPoolsOfUser[msg.sender].pop();
        }

        //TODO emit V2 event
    }

    function stakeEsXai(address pool, uint256 amount) external {
        IStakingPool stakingPool = IStakingPool(pool);

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

        Referee5(refereeAddress).stakeEsXai(address(stakingPool), amount);

        esXai(esXaiAddress).transferFrom(msg.sender, address(this), amount);

        stakingPool.stakeEsXai(msg.sender, amount);

        //TODO emit V2 event
    }

    function unstakeEsXai(address pool, uint256 amount) external {
        IStakingPool stakingPool = IStakingPool(pool);

        require(
            stakingPool.getStakedAmounts(msg.sender) >= amount,
            "Insufficient amount staked"
        );

        esXai(esXaiAddress).transfer(msg.sender, amount);

        Referee5(refereeAddress).unstakeEsXai(pool, amount);

        stakingPool.unstakeEsXai(msg.sender, amount);

        (uint256 stakeAmount, uint256 keyAmount) = userPoolInfo(
            pool,
            msg.sender
        );
        if (stakeAmount == 0 && keyAmount == 0) {
            uint256 indexOfPool = userToInteractedPoolIds[msg.sender][pool];
            uint256 userLength = interactedPoolsOfUser[msg.sender].length;
            interactedPoolsOfUser[msg.sender][
                indexOfPool
            ] = interactedPoolsOfUser[msg.sender][userLength - 1];
            interactedPoolsOfUser[msg.sender].pop();
        }
        //TODO emit V2 event
    }

    function claimFromPools(address[] memory pools) external {
        uint256 poolsLength = pools.length;

        for (uint i = 0; i < poolsLength; i++) {
            IStakingPool stakingPool = IStakingPool(pools[i]);
            stakingPool.claimRewards(msg.sender);

            //TODO claim event ?
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
}
