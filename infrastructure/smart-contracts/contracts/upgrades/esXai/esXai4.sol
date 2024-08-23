// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "../../Xai.sol";
import "../../upgrades/referee/Referee9.sol";
import "../../upgrades/node-license/NodeLicense8.sol";
import "../../upgrades/pool-factory/PoolFactory2.sol";

/**
 * @title esXai
 * @dev Implementation of the esXai
 */
contract esXai4 is ERC20Upgradeable, ERC20BurnableUpgradeable, AccessControlUpgradeable {

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    EnumerableSetUpgradeable.AddressSet private _whitelist;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    address public xai;
    bool private _redemptionActive;
    mapping(address => RedemptionRequest[]) private _redemptionRequests;
    address public esXaiBurnFoundationRecipient;
    uint256 public esXaiBurnFoundationBasePoints;
    mapping(address => RedemptionRequestExt[]) private _extRedemptionRequests;
    address public refereeAddress;
    address public nodeLicenseAddress;
    uint256 public maxKeysNonKyc;
    address public poolFactoryAddress;

    bool private _reentrancyGuardRedemptions;
    mapping(address => uint256[]) public pendingRedemptionIds;
    mapping(address => uint256[]) public completedRedemptionIds;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[491] private __gap;

    struct RedemptionRequest {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        bool completed;
    }

    struct RedemptionRequestExt {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint256 endTime;
        bool completed;
        bool cancelled;
        bool voucherIssued;
        uint256[5] __gap;
    }

    event WhitelistUpdated(address account, bool isAdded);
    event RedemptionStarted(address indexed user, uint256 indexed index);
    event RedemptionCancelled(address indexed user, uint256 indexed index);
    event RedemptionCompleted(address indexed user, uint256 indexed index);
    event RedemptionStatusChanged(bool isActive);
    event XaiAddressChanged(address indexed newXaiAddress);
    event FoundationBasepointsUpdated(uint256 newBasepoints);

    function initialize () public reinitializer(4) {
        // TODO - create story to re-enable redemptions after conversion of the existing redemption requests to vouchers
        _redemptionActive = false;
    }

    /**
     * @dev Function to change the redemption status
     * @param isActive The new redemption status.
     */
    function changeRedemptionStatus(bool isActive) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _redemptionActive = isActive;
        emit RedemptionStatusChanged(isActive);
    }

    /**
     * @dev Function to mint esXai tokens
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Function to change the Xai contract address
     * @param _newXai The new Xai contract address.
     */
    function changeXaiAddress(address _newXai) public onlyRole(DEFAULT_ADMIN_ROLE) {
        xai = _newXai;
        emit XaiAddressChanged(_newXai); // Emit event when xai address is changed
    }

    /**
     * @dev Function to add an address to the whitelist
     * @param account The address to add to the whitelist.
     */
    function addToWhitelist(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _whitelist.add(account);
        emit WhitelistUpdated(account, true);
    }

    /**
     * @dev Function to remove an address from the whitelist
     * @param account The address to remove from the whitelist.
     */
    function removeFromWhitelist(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _whitelist.remove(account);
        emit WhitelistUpdated(account, false);
    }

    /**
     * @dev Function to check if an address is in the whitelist
     * @param account The address to check.
     * @return A boolean indicating if the address is in the whitelist.
     */
    function isWhitelisted(address account) public view returns (bool) {
        return _whitelist.contains(account);
    }

    /**
     * @dev Function to get the whitelisted address at a given index.
     * @param index The index of the address to query.
     * @return The address of the whitelisted account.
     */
    function getWhitelistedAddressAtIndex(uint256 index) public view returns (address) {
        require(index < getWhitelistCount(), "Index out of bounds");
        return _whitelist.at(index);
    }

    /**
     * @dev Function to get the count of whitelisted addresses.
     * @return The count of whitelisted addresses.
     */
    function getWhitelistCount() public view returns (uint256) {
        return _whitelist.length();
    }

    /**
     * @dev Override the transfer function to only allow addresses that are in the white list in the to or from field to go through
     * @param to The address to transfer to.
     * @param amount The amount to transfer.
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(_whitelist.contains(msg.sender) || _whitelist.contains(to), "Transfer not allowed: address not in whitelist");
        return super.transfer(to, amount);
    }

    /**
     * @dev Override the transferFrom function to only allow addresses that are in the white list in the to or from field to go through
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param amount The amount to transfer.
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(_whitelist.contains(from) || _whitelist.contains(to), "Transfer not allowed: address not in whitelist");
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Function to start the redemption process
     * @param amount The amount of esXai to redeem.
     * @param duration The duration of the redemption process in seconds.
     */
    function startRedemption(uint256 amount, uint256 duration) public {
        require(_redemptionActive, "Redemption is currently inactive");
        require(amount > 0, "Invalid Amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient esXai balance");
        require(duration == 15 days || duration == 90 days || duration == 180 days, "Invalid duration");
        // TODO - Discuss with Mark the limit of pending redemptions per user
        require(pendingRedemptionIds[msg.sender].length <= 200, "User has too many pending redemptions");

        // Connect to the pool factory contract
        PoolFactory2 poolFactory = PoolFactory2(poolFactoryAddress);

        // Confirm the tx won't fail due to too many pools
        uint256 poolCount = poolFactory.getPoolsOfUserCount(msg.sender);
        require(poolCount <= 200, "User has too many pools. Unstake from some pools to redeem.");
        
        // Check if the sender failed KYC
        bool failedKyc = PoolFactory2(poolFactoryAddress).failedKyc(msg.sender);
        require(!failedKyc, "KYC failed, cannot redeem");
        
        // No longer transferring esXai from the sender's account to this contract
        // Storing redemption claim as voucherIssued instead

        // Confirm the user has the appropriate amount of esXai available
        uint256 currentBalance = balanceOf(msg.sender);        
        uint256 totalEsXaiStaked = getTotalStakedEsXaiByUser(msg.sender);
        uint256 totalEsXaiPendingRedemption = getTotalEsXaiPendingRedemptions(msg.sender);

        uint256 availableEsXai = currentBalance + totalEsXaiStaked - totalEsXaiPendingRedemption;

        require(availableEsXai >= amount, "Insufficient esXai balance");

        // Update the pending redemptions to include the new redemption request index
        pendingRedemptionIds[msg.sender].push(_extRedemptionRequests[msg.sender].length);

        // Store the redemption request
        _extRedemptionRequests[msg.sender].push(RedemptionRequestExt(amount, block.timestamp, duration, 0, false, false, true, [uint256(0),0,0,0,0]));

        emit RedemptionStarted(msg.sender, _extRedemptionRequests[msg.sender].length - 1);
    }

    /**
     * @dev Function to cancel the redemption process
     * @param index The index of the redemption request to cancel.
     */
    function cancelRedemption(uint256 index) public {
        require(_redemptionActive, "Redemption is currently inactive");
        RedemptionRequestExt storage request = _extRedemptionRequests[msg.sender][index];
        require(request.amount > 0, "Invalid request");
        require(!request.completed, "Redemption already completed");

        // Mark the redemption request as completed
        request.completed = true;
        request.cancelled = true;
        request.endTime = block.timestamp;
        
        // Remove the redemption request from the pending redemptions
        removeIndexFromPendingRedemptionsList(msg.sender, index);

        // Add the redemption request to the completed redemptions
        completedRedemptionIds[msg.sender].push(index);

        emit RedemptionCancelled(msg.sender, index);
    }

    /**
     * @dev Function to complete the redemption process
     * @param index The index of the redemption request to complete.
     */
    function completeRedemption(uint256 index) public {
        require(_redemptionActive, "Redemption is currently inactive");
        RedemptionRequestExt storage request = _extRedemptionRequests[msg.sender][index];
        require(request.amount > 0, "Invalid request");
        require(!request.completed, "Redemption already completed");
        require(block.timestamp >= request.startTime + request.duration, "Redemption period not yet over");

        // Check if the sender failed KYC
        bool failedKyc = PoolFactory2(poolFactoryAddress).failedKyc(msg.sender);
        require(!failedKyc, "KYC failed, cannot redeem");

        // Retrieve the number of licenses owned from the nodeLicense contract
        uint256 licenseCountOwned = NodeLicense8(nodeLicenseAddress).balanceOf(msg.sender);

        // If the wallet owns more licenses than the maxKeysNonKyc, check if the wallet is KYC approved
        if(licenseCountOwned > maxKeysNonKyc){
            Referee9 referee = Referee9(refereeAddress);
            require(referee.isKycApproved(msg.sender), "You own too many keys, must be KYC approved to claim.");
        }

        // Calculate the conversion ratio based on the duration
        uint256 ratio;
        if (request.duration == 15 days) {
            ratio = 250;
        } else if (request.duration == 90 days) {
            ratio = 625;
        } else {
            ratio = 1000;
        }

        // Calculate the amount of Xai to mint
        uint256 xaiAmount = request.amount * ratio / 1000;

        // mark the request as completed
        request.completed = true;
        request.endTime = block.timestamp;

        // Burn the esXai tokens
        _burn(address(this), request.amount);

        // Mint the Xai tokens
        Xai(xai).mint(msg.sender, xaiAmount);

        // If the ratio is less than 1000, mint half of the esXai amount that was not redeemed to the esXaiBurnFoundationRecipient
        if (ratio < 1000) {
            uint256 foundationXaiAmount = (request.amount - xaiAmount) * esXaiBurnFoundationBasePoints / 1000;
            Xai(xai).mint(esXaiBurnFoundationRecipient, foundationXaiAmount);
        }

        // emit event of the redemption
        emit RedemptionCompleted(msg.sender, index);
    }

    /**
     * @dev Function to get the redemption request at a given index.
     * @param account The address to query.
     * @param index The index of the redemption request.
     * @return The redemption request.
     */
    function getRedemptionRequest(address account, uint256 index) public view returns (RedemptionRequestExt memory) {
        return _extRedemptionRequests[account][index];
    }

    /**
     * @dev Function to get the count of redemption requests for a given address.
     * @param account The address to query.
     * @return The count of redemption requests.
     */
    function getRedemptionRequestCount(address account) public view returns (uint256) {
        return _extRedemptionRequests[account].length;
    }

    /**
     * @dev Function to get the count of redemption requests for a given address.
     * @param number The amount to update the basepoints.
     */
    function updateFoundationBasepoints(uint256 number) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(number <= 1000, "Invalid basepoints");
        esXaiBurnFoundationBasePoints = number;
        emit FoundationBasepointsUpdated(number); 
    }

    /**
     * @dev Function to set the max keys allowed for a non kyc
     * @param newMax The new max keys allowed.
     */
    function setMaxKeysNonKyc(uint256 newMax) public onlyRole(DEFAULT_ADMIN_ROLE) {
        maxKeysNonKyc = newMax;
    }

    /**
    * @dev Finds the index of a specific ID in a list of IDs.
    * @param id The ID to find in the list.
    * @param list The list of IDs to search within.
    * @return The index of the ID if found, or the length of the list if not found.
    */
    function findIndexOfId(uint256 id, uint256[] memory list) internal pure returns (uint256) {
        for (uint i = 0; i < list.length; i++) {
            if (list[i] == id) {
                return i;
            }
        }
        return list.length; // Return an invalid index if not found
    }

    /**
    * @dev Removes a specific ID from a list of IDs.
    * @param account The address of the account to remove the ID from.
    * @param id The ID to remove from the list.
    * @notice The function shifts elements to the left and pops the last element to shrink the array.
    */
    function removeIndexFromPendingRedemptionsList(address account, uint256 id) internal {
        uint256 [] storage list = pendingRedemptionIds[account];
        uint256 index = findIndexOfId(id, list);

        require(index < list.length, "Value not found in array");

        // Shift elements to the left
        for (uint256 i = index; i < list.length - 1; i++) {
            list[i] = list[i + 1];
        }

        // Remove the last element
        list.pop();
    }

    /**
    * @dev Calculates the total amount of pending redemptions for a given account.
    * @param account The address of the account to calculate the total for.
    * @return total The total amount of pending redemptions.
    */
    function getTotalEsXaiPendingRedemptions(address account) public view returns (uint256 total) {
        for (uint256 i = 0; i < pendingRedemptionIds[account].length; i++) {
            total += _extRedemptionRequests[account][pendingRedemptionIds[account][i]].amount;
        }
    }

    /**
    * @notice Retrieves all pending redemption requests for a specific user.
    * @dev This function returns an array of `RedemptionRequestExt` structs representing the pending 
    *      redemption requests associated with the given account.
    * @param account The address of the user whose pending redemption requests are to be retrieved.
    * @return requests An array of `RedemptionRequestExt` structs representing the pending redemption requests.
    */
    function getPendingRedemptionsByUser(address account) public view returns (RedemptionRequestExt[] memory requests) {
        uint256[] memory pendingIds = pendingRedemptionIds[account];
        requests = new RedemptionRequestExt[](pendingIds.length);
        for (uint256 i = 0; i < pendingIds.length; i++) {
            requests[i] = _extRedemptionRequests[account][pendingIds[i]];
        }
    }

    /**
    * @dev Retrieves the most recently completed redemption requests for a given user, up to a maximum quantity.
    * @param account The address of the user whose completed redemption requests are to be retrieved.
    * @param maxQty The maximum number of completed redemption requests to return.
    * @return requests An array of `RedemptionRequestExt` structs representing the most recent completed redemptions.
    */
    function getRecentlyCompletedRedemptionsByUser(address account, uint256 maxQty) public view returns (RedemptionRequestExt[] memory requests) {
        uint256[] memory completedIds = completedRedemptionIds[account];
        uint256 count = completedIds.length > maxQty ? maxQty : completedIds.length;
        requests = new RedemptionRequestExt[](count);
        
        uint256 j = 0;
        for (uint256 i = completedIds.length; i > 0 && j < count; i--) {
            requests[j] = _extRedemptionRequests[account][completedIds[i - 1]];
            j++;
        }
    }

    /**
    * @notice Retrieves the total amount of `esXai` tokens staked by a specific account across all pools.
    * @dev This function calculates the total `esXai` staked by an account by interacting with the `PoolFactory2`
    *      contract to get the list of all pools in which the user has staked. It then sums the staked amounts
    *      from each pool.
    * @param account The address of the account for which to calculate the total staked `esXai`.
    * @return totalEsXaiStaked The total amount of `esXai` tokens staked by the account across all pools.
    */
    function getTotalStakedEsXaiByUser(address account) public view returns (uint256) {
        PoolFactory2 poolFactory = PoolFactory2(poolFactoryAddress);
        address[] memory pools = poolFactory.getPoolIndicesOfUser(account);
        uint256 totalEsXaiStaked;
        for (uint256 i = 0; i < pools.length; i++) {
            totalEsXaiStaked += StakingPool(pools[i]).getStakedAmounts(account);
        }

        return totalEsXaiStaked;
    }

    /**
    * @notice This function iterates through the provided accounts and their redemption requests.
    * For each uncompleted request without a voucher:
    * 1. Transfers esXai tokens back to the account.
    * 2. Marks the request as having a voucher issued.
    * 3. Adds the redemption index to pendingRedemptionIds.
    * For completed requests, it adds the redemption index to completedRedemptionIds.
    * @param accounts - The addresses of the accounts whose redemption requests are being processed.
    *
    * @dev This function modifies the state of _extRedemptionRequests, pendingRedemptionIds, 
    * and completedRedemptionIds. It also transfers tokens using the _transfer function.
    *
    * @dev this function will fail if the number of accounts is too large to process in a single transaction.
    * the maximum number of accounts that can be processed in a single transaction will vay based on how many
    * pending redemptions each account has and the number of pools that the account is staked in.
    */
    function convertExistingRedemptionsToVouchers(address[] memory accounts) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_redemptionActive, "Redemptions must be paused to convert existing redemptions to vouchers");
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            for (uint j = 0; j < _extRedemptionRequests[account].length; j++) {
                RedemptionRequestExt storage request = _extRedemptionRequests[account][j];
                if (!request.completed && !request.voucherIssued) {
                    // Transfer back the esXai tokens to the sender's account
                    _transfer(address(this), account, request.amount);
                    
                    // Update the redemption request to indicate that a voucher has been issued
                    request.voucherIssued = true;

                    // Add the redemption index to the pending redemptionIds
                    pendingRedemptionIds[account].push(j);
                }
                if (request.completed) {
                    // Add the redemption index to the completed redemptionIds
                    completedRedemptionIds[account].push(j);
                }
            }
        }
    }
    
    /**
    * @dev Converts specific redemption requests into vouchers for a specified account.
    * 
    * This function allows the conversion of specific redemption requests identified by their indexes,
    * avoiding the potential issue of looping through too many redemptions in a single transaction,
    * which could cause the script to fail.
    * 
    * This is particularly useful in cases where a user has a large number of redemption requests, 
    * as processing them all at once may exceed gas limits or cause other issues. By specifying
    * the exact indexes to process, this function enables finer control over the conversion process.
    * 
    * @param account - The address of the account whose redemption requests are being processed.
    * @param indexes - An array of indexes corresponding to specific redemption requests for the account.
    * 
    * Requirements:
    * - Caller must have the DEFAULT_ADMIN_ROLE.
    */
    function convertSpecificRedemptionsToVouchers(address account, uint256[] memory indexes) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_redemptionActive, "Redemptions must be paused to convert existing redemptions to vouchers");
        for (uint256 i = 0; i < indexes.length; i++) {
            RedemptionRequestExt storage request = _extRedemptionRequests[account][indexes[i]];
            if (!request.completed && !request.voucherIssued) {
                // Transfer back the esXai tokens to the sender's account
                _transfer(address(this), account, request.amount);
                
                // Update the redemption request to indicate that a voucher has been issued
                request.voucherIssued = true;

                // Add the redemption index to the pending redemptionIds
                pendingRedemptionIds[account].push(indexes[i]);
            }
            if (request.completed) {
                // Add the redemption index to the completed redemptionIds
                completedRedemptionIds[account].push(indexes[i]);
            }
        }
    }
}