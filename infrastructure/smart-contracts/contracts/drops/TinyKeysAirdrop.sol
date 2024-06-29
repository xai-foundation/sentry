// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "../upgrades/referee/Referee8.sol";
import "../upgrades/node-license/NodeLicense8.sol";
import "../upgrades/staking-v2/PoolFactory2.sol";

contract TinyKeysAirdrop is Initializable, AccessControlUpgradeable {
    using Math for uint256;

    // Address of the NodeLicense NFT contract
    address public nodeLicenseAddress;

    // Address for referee contract
    address public refereeAddress;

    // Airdrop counter
    uint256 public airdropCounter; // Will be incremented after each airdrop segment

    // Total Supply At Start
    uint256 public totalSupplyAtStart; // Will be set at airdrop start

    // Key Multiplier for airdrop - the number of keys to be airdropped per node license
    uint256 public keyMultiplier; // Review for reducing variable size once determined

    // Airdrop Started
    bool public airdropStarted;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    // Events for various actions within the contract
    event AirdropStarted(uint256 totalSupplyAtStart, uint256 keyMultiplier);
    event AirdropSegmentComplete(uint256 startingKeyId, uint256 endingKeyId);
    event AirdropEnded();

    /**
     * @dev Initializes the contract with the provided addresses.
     * @dev Grants the DEFAULT_ADMIN_ROLE to the deployer.
     * @param _nodeLicenseAddress Address of the NodeLicense NFT contract
     * @param _refereeAddress Address for referee contract
     * @param _keyMultiplier Key Multiplier for airdrop - the number of keys to be airdropped per node license
     */
    function initialize(address _nodeLicenseAddress, address _refereeAddress, uint256 _keyMultiplier) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        refereeAddress = _refereeAddress;
        nodeLicenseAddress = _nodeLicenseAddress;
        keyMultiplier = _keyMultiplier;

        airdropCounter = 1;
        airdropStarted = false;
    }

    /**
     * @notice Start the airdrop
     * @dev This function will be called by the admin to start the airdrop
     * @dev It will set the total supply at start and emit the AirdropStarted event
     */
    function startAirdrop() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!Referee8(refereeAddress).stakingEnabled(), "Referee staking must be disabled to start airdrop");       
        require(!airdropStarted, "Airdrop already started");
        NodeLicense8(nodeLicenseAddress).startAirdrop();
        totalSupplyAtStart = NodeLicense8(nodeLicenseAddress).totalSupply();
        airdropStarted = true;
        emit AirdropStarted(totalSupplyAtStart, keyMultiplier);
    }

    /** 
     * @notice Process a segment of the airdrop
     * @dev This function will be called by the admin to process a segment of the airdrop
     * @dev It will airdrop keys to the node licenses in the specified range
     * @dev It will check to see if the node license is staked, if so, it will auto-stake the new keys
     * @dev If not, it will air-drop to the owner's wallet
     * @param _qtyToProcess The quantity of node licenses to process in this segment
    */
    function processAirdropSegment(uint256 _qtyToProcess) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(airdropStarted, "Airdrop not started");
        require(airdropCounter <= totalSupplyAtStart, "Airdrop complete");
        
        uint256 startingKeyId = airdropCounter;
        uint256 endingKeyId = Math.min(airdropCounter + _qtyToProcess, totalSupplyAtStart);
        
        Referee8 referee = Referee8(refereeAddress);
        NodeLicense8 nodeLicense = NodeLicense8(nodeLicenseAddress);
        for (uint256 i = startingKeyId; i <= endingKeyId; i++) {
            address owner = nodeLicense.ownerOf(i);
            uint256[] memory tokenIds = nodeLicense.mintForAirdrop(keyMultiplier, owner);
            address poolAddress = referee.assignedKeyToPool(i);
            if (poolAddress != address(0)) {
                PoolFactory2(poolAddress).stakeKeysAdmin(poolAddress, tokenIds, owner);                                
            }
        }
        
        airdropCounter = endingKeyId;
        emit AirdropSegmentComplete(startingKeyId, endingKeyId);

        if (airdropCounter == totalSupplyAtStart) {
            emit AirdropEnded();
        }

        return endingKeyId;
    }
}