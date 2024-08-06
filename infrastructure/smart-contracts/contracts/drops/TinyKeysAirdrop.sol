// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../upgrades/referee/Referee9.sol";
import "../upgrades/node-license/NodeLicense8.sol";
import "../upgrades/pool-factory/PoolFactory2.sol";

contract TinyKeysAirdrop is Initializable, AccessControlUpgradeable {
    using Math for uint256;

    // Address of the NodeLicense NFT contract
    address public nodeLicenseAddress;

    // Address for referee contract
    address public refereeAddress;
    
    // Pool Factory Address
    address public poolFactoryAddress;

    // Airdrop counter
    uint256 public airdropCounter; // Will be incremented after each airdrop segment

    // Stake counter
    uint256 public stakeCounter; // Will be incremented after each airdrop segment

    // Total Supply At Start
    uint256 public totalSupplyAtStart; // Will be set at airdrop start

    // Key Multiplier for airdrop - the number of keys to be airdropped per node license
    uint256 public keyMultiplier; // Review for reducing variable size once determined

    // Airdrop Started
    bool public airdropStarted;

    // Airdrop Ended
    bool public airdropEnded;

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
    function initialize(address _nodeLicenseAddress, address _refereeAddress, address _poolFactoryAddress, uint256 _keyMultiplier) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        require(keyMultiplier > 0, "Key multiplier must be greater than 0");

        refereeAddress = _refereeAddress;
        nodeLicenseAddress = _nodeLicenseAddress;
        poolFactoryAddress = _poolFactoryAddress;

        keyMultiplier = _keyMultiplier;

        airdropCounter = 1;
        stakeCounter = 1;
        airdropStarted = false;
        airdropEnded = false;
    }

    /**
     * @notice Start the airdrop
     * @dev This function will be called by the admin to start the airdrop
     * @dev It will set the total supply at start and emit the AirdropStarted event
     */
    function startAirdrop() external onlyRole(DEFAULT_ADMIN_ROLE) { 
        require(!airdropStarted, "Airdrop already started");
        require(!airdropEnded, "Airdrop already complete");
        // Start the airdrop
        // This will notify the node license contract to start the airdrop
        // The node license contract will then notify the referee contract
        // This will disable minting in the node license contract
        // This will also disable staking in the referee contract
        NodeLicense8(nodeLicenseAddress).startAirdrop(refereeAddress);

        // Set the total supply of node licenses at the start of the airdrop
        totalSupplyAtStart = NodeLicense8(nodeLicenseAddress).totalSupply();
        
        airdropStarted = true;
        emit AirdropStarted(totalSupplyAtStart, keyMultiplier);
    }

    
    function processAirdropSegmentOnlyMint(uint256 _qtyToProcess) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        require(airdropStarted, "Airdrop not started");
        require(airdropCounter <= totalSupplyAtStart, "Airdrop complete");
        // Start where we left off
        uint256 startingKeyId = airdropCounter;
        // Ensure we don't go over the total supply
        uint256 endingKeyId = Math.min(airdropCounter + _qtyToProcess, totalSupplyAtStart);     
        // Connect to the referee and node license contracts
        NodeLicense8 nodeLicense = NodeLicense8(nodeLicenseAddress);

        // Loop through the range of node licenses
        // Needs to be <= to include the last key
        for (uint256 i = startingKeyId; i <= endingKeyId; i++) {
            // Mint the airdropped keys for the owner
            nodeLicense.mintForAirdrop(keyMultiplier, i);
        }

        // Update the airdrop counter
        // Increment the counter by the ending key id + 1
        airdropCounter = endingKeyId + 1;
        emit AirdropSegmentComplete(startingKeyId, endingKeyId);
    }

    function processAirdropSegmentOnlyStake(uint256 _qtyToProcess) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        require(airdropStarted, "Airdrop not started");
        require(!airdropEnded, "Airdrop already complete");
        require(stakeCounter <= totalSupplyAtStart, "Airdrop complete");

        // Start where we left off
        uint256 startingKeyId = stakeCounter;

        // Ensure we don't go over the total supply
        uint256 endingKeyId = Math.min(stakeCounter + _qtyToProcess, totalSupplyAtStart);

        // Connect to the referee and node license contracts
        NodeLicense8 nodeLicense = NodeLicense8(nodeLicenseAddress);
        Referee9 referee = Referee9(refereeAddress);

        // Loop through the range of node licenses
        // Needs to be <= to include the last key
        for (uint256 i = startingKeyId; i <= endingKeyId; i++) {
            // Get the owner of the node license
            address owner = nodeLicense.ownerOf(i);

            // Get the pool address for the owner
            address poolAddress = referee.assignedKeyToPool(i);

            // If the pool address is not 0, stake the newly minted keys
            if(poolAddress != address(0)){                
                uint256[] memory stakeKeyIds = new uint256[](keyMultiplier);
                // Determine the initial token id for the newly minted keys
                // Calculate the starting ID for the new batch of tokens
                uint256 tokensAlreadyProcessed = (i - 1) * keyMultiplier;
                uint256 newTokenStartId = totalSupplyAtStart + tokensAlreadyProcessed + 1;

                // Create an array of key ids to stake
                for (uint256 j = 0; j < keyMultiplier; j++) {
                    stakeKeyIds[j] = newTokenStartId + j;
                }
                
                // Stake the keys
                PoolFactory2(poolFactoryAddress).stakeKeysAdmin(poolAddress, stakeKeyIds, owner);
            }
        }

        // Update the stake counter
        // Increment the counter by the ending key id + 1
        stakeCounter = endingKeyId + 1;
    }

    function completeAirDrop() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(airdropStarted, "Airdrop not started");
        require(!airdropEnded, "Airdrop already complete");
        require(airdropCounter == totalSupplyAtStart + 1, "Airdrop not complete");
        require(stakeCounter == totalSupplyAtStart + 1, "Staking not complete");

        // Notify the node license contract that the airdrop is complete
        NodeLicense8(nodeLicenseAddress).finishAirdrop(refereeAddress, keyMultiplier + 1);

        airdropStarted = false;
        airdropEnded = true;
        emit AirdropEnded();
    }

}