// SPDX-License-Identifier: UNLICENSED


pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "../upgrades/referee/Referee8.sol";
import "../upgrades/node-license/NodeLicense8.sol";
import "../upgrades/staking-v2/PoolFactoryV2.sol";


contract TinyKeysAirdrop is Initializable, AccessControlUpgradeable{


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
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        refereeAddress = _refereeAddress;
        nodeLicenseAddress = _nodeLicenseAddress;
        keyMultiplier = _keyMultiplier;

        airdropCounter = 0;
        airdropStarted = false;

    }
    
    /**
     * @notice Start the airdrop
     * @dev This function will be called by the admin to start the airdrop
     * @dev It will set the total supply at start and emit the AirdropStarted event
     */

    function startAirdrop() public onlyRole(DEFAULT_ADMIN_ROLE) {
        //Require staking to be disabled on the referee contract
        require(!Referee8(refereeAddress).stakingEnabled(), "Referee staking enabled");       
        require(!airdropStarted, "Airdrop already started");
        totalSupplyAtStart = NodeLicense8(nodeLicenseAddress).totalSupply();
        airdropStarted = true;
        emit AirdropStarted(totalSupplyAtStart, keyMultiplier);
    }

    /** 
     * @notice Process a segment of the airdrop
     * @dev This function will be called by the admin to process a segment of the airdrop
     * @dev It will airdrop keys to the node licenses in the specified range
     * @dev It will check to see if the node license is staked, if so, it will auto-stake the new keys
     * @dev if not, it will air-drop to the owner's wallet
     * @param _qtyToProcess The quantity of node licenses to process in this segment
    */

    function processAirdropSegment(uint256 _qtyToProcess) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(airdropStarted, "Airdrop not started");
        require(airdropCounter < totalSupplyAtStart, "Airdrop complete");
        uint256 startingKeyId = airdropCounter;
        uint256 endingKeyId = Math.min(airdropCounter + _qtyToProcess, totalSupplyAtStart);
        for (uint256 i = startingKeyId; i < endingKeyId; i++) {
            _processAirdropKey(i);
        }
        airdropCounter = endingKeyId;
        emit AirdropSegmentComplete(startingKeyId, endingKeyId);

        if(airdropCounter == totalSupplyAtStart) {
            emit AirdropEnded();
        }
    }

    /**
     * @notice internal function to process 1 key airdrop
     * @dev This function will be called internally by the processAirdropSegment function
     * @dev It will be called once for each node license in the segment
     * @dev It will mint and airdrop keys to the node license owner
     * @dev It will check to see if the node license is staked, if so, it will auto-stake the new keys
     * @dev if not, it will air-drop to the owner's wallet
     * @param _nodeLicenseId The Id of the node license to process
     */

    function _processAirdropKey(uint256 _nodeLicenseId) internal {
        Referee8 referee = Referee8(refereeAddress);
        NodeLicense8 nodeLicense = NodeLicense8(nodeLicenseAddress);
        // Get the owner of the node license
        address owner = NodeLicense8(nodeLicenseAddress).ownerOf(_nodeLicenseId);
        // Mint the keys for the airdrop
        uint256 [] memory tokenIds = nodeLicense.mintForAirdrop(keyMultiplier, owner);
        // Check if the node license is staked
        address poolAddress = referee.assignedKeyToPool(_nodeLicenseId);
        // If the node license is staked, auto-stake the new keys
        if (poolAddress != address(0)) {
            PoolFactoryV2(poolAddress).stakeKeysAdmin(poolAddress, tokenIds, owner);                                
        }
    }



}