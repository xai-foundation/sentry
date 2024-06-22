// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StakingPoolImplementationV3 is Initializable, AccessControlUpgradeable {
    string public name;
    uint256 public keys;
    uint256 public some; // TODO ask what this is for

    bool public stakingEnabled;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256[498] private __gap;

    /**
     * @notice Initializes the staking pool with the provided parameters and sets up admin roles.
     * @param _name The name of the staking pool.
     * @param _keys The initial number of keys.
     * @param _some An additional state variable for future use?
     */
    function initialize(
        string memory _name,
        uint256 _keys,
        uint256 _some
    ) external initializer {
        name = _name;
        keys = _keys;
        some = _some;

        // Setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        // Enable staking by default
        stakingEnabled = true;
    }

    /**
     * @notice Modifier to check if staking is currently enabled.
     */
    modifier whenStakingEnabled() {
        require(stakingEnabled, "Staking is currently disabled");
        _;
    }

    /**
     * @notice Allows a user to stake keys if staking is enabled.
     * @param _keys The number of keys to be staked.
     */
    function stakeKeys(uint256 _keys) external whenStakingEnabled {
        keys += _keys;
    }

    /**
     * @notice Allows a user to unstake keys if staking is enabled.
     * @param _keys The number of keys to be unstaked.
     */
    function unstakeKeys(uint256 _keys) external whenStakingEnabled {
        require(keys >= _keys, "Can't un-stake more keys than the balance");
        keys -= _keys;
    }

    /**
     * @notice Allows the admin to re-stake keys for existing stakers.
     * @param _keys The number of keys to be re-staked.
     */
    function adminReStakeKeys( uint256 _keys) external onlyRole(ADMIN_ROLE) {
        keys += _keys;
    }

    /**
     * @notice Enables the staking functionality. Can only be called by an admin.
     */
    function enableStaking() external onlyRole(ADMIN_ROLE) {
        stakingEnabled = true;
    }

    /**
     * @notice Disables the staking functionality. Can only be called by an admin.
     */
    function disableStaking() external onlyRole(ADMIN_ROLE) {
        stakingEnabled = false;
    }

    /**
     * @notice Removes the admin's ability to add keys by renouncing the ADMIN_ROLE.
     * Can only be called by the default admin.
     */
    function removeAdminStakeKeys() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Functionality to disable the adminReStakeKeys function
        renounceRole(ADMIN_ROLE, msg.sender);
    }

    // Additional functionality can be added here
}
