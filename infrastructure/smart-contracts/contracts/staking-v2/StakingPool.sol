// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract StakingPool is AccessControlUpgradeable {
    bytes32 public constant POOL_ADMIN = keccak256("POOL_ADMIN");

    address public owner;
    string public name;
    string public logo;
    string public description;
    string public fb;
    string public linkedIn;
    string public twitter;

    uint16 public ownerShare;
    uint16 public keyBucketShare;
    uint16 public stakedBucketShare;

    uint256 public poolOwnerClaimableRewards;
    address public keyBucket;
    address public esXaiStakeBucket;

    uint256 public stakedKeysCount;
    mapping(address => uint256[]) public stakedKeysOfOwner;
    mapping(uint256 => uint256) public keyIdIndex;
    mapping(address => uint256) public stakedAmounts; //TODO do we needs this ? Can it not be BucketBalance ?

    uint256[500] __gap;

    function initialize(
        address _owner,
        uint16 _ownerShare,
        uint16 _keyBucketShare,
        uint16 _stakedBucketShare,
        string memory _name,
        string memory _logo,
        string memory _description,
        string memory _fb,
        string memory _linkedIn,
        string memory _twitter
    ) external initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        owner = _owner;

        ownerShare = _ownerShare;
        keyBucketShare = _keyBucketShare;
        stakedBucketShare = _stakedBucketShare;

        name = _name;
        logo = _logo;
        description = _description;
        fb = _fb;
        linkedIn = _linkedIn;
        twitter = _twitter;

        //TODO shares

        //Create buckets
        //new TrackerBucket() // TODO this needs to be an Upgradable too!
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
        string memory _logo,
        string memory _description,
        string memory _fb,
        string memory _linkedIn,
        string memory _twitter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        name = _name;
        logo = _logo;
        description = _description;
        fb = _fb;
        linkedIn = _linkedIn;
        twitter = _twitter;
    }

    function stakeKeys(
        address owner,
        uint256[] memory keyIds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        //TODO save key to owner array
        //Distribute rewards to buckets
        //TODO process account first
        //trakcer.setBalance()
    }

    function unstakeKey(
        address owner,
        uint256[] memory keyIds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        //TODO save key to owner array
        //Distribute rewards to buckets
        //TODO process account first
        //trakcer.setBalance()
    }

    function stakeEsXai(
        address owner,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        //Distribute rewards to buckets
        //TODO process account first//Mint from tracker
        //trakcer.setBalance()
    }

    function unstakeEsXai(
        address owner,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        //Distribute rewards to buckets
        //TODO process account first//Burn from tracker
        //trakcer.setBalance()
    }

    //TODO returns !
    function getPoolInfo() external view {
        //return all pool infor, metadata and stakedAmount
    }

    //TODO returns !
    function getPoolInfoForUser(address user) external view {
        //retrun pooldata including user specific claim amounts
        //uint256 claimableKeyRewards = keyTracker.withdrawableDividendOf(user)
    }

    function distributeRewards() internal {
        //TODO distribute rewawrs collected on the Pool to the buckets
    }

    function claimRewards(address user) external {
        distributeRewards();
        //TODO claim for user from all buckets (processAccount)
        //If user is poolOwner claim ownerRewards
    }
}
