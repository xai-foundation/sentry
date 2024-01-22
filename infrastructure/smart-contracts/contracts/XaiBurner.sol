// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./Xai.sol";

/**
 * @title XaiBurner
 * @dev Implementation of the XaiBurner
 */
contract XaiBurner is AccessControlUpgradeable {
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    address public xaiAddress;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    event XaiAddressSet(address indexed newXaiAddress);
    event XaiBurned(address indexed user, uint256 amount);

    function initialize(address _xaiAddress) public initializer {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(BURNER_ROLE, DEFAULT_ADMIN_ROLE);

        setXaiAddress(_xaiAddress);
    }

    /**
     * @dev Function to set Xai address
     * @param newXaiAddress The new Xai address.
     */
    function setXaiAddress(address newXaiAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        xaiAddress = newXaiAddress;
        emit XaiAddressSet(newXaiAddress);
    }

    /**
     * @dev Function to bridge the xai in this contract over to Arbitrum One for burning
     * @param amount The amount of Xai to burn.
     */
    function burnXai(uint256 amount) public onlyRole(BURNER_ROLE) {
        require(xaiAddress != address(0), "Xai contract address not set");
        Xai(xaiAddress).burn(amount);
        emit XaiBurned(msg.sender, amount);
    }
}
