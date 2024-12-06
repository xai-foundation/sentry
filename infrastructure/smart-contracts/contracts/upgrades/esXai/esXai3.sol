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
contract esXai3 is ERC20Upgradeable, ERC20BurnableUpgradeable, AccessControlUpgradeable {

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

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[493] private __gap;

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
        uint256[5] __gap;
    }

    event WhitelistUpdated(address account, bool isAdded);
    event RedemptionStarted(address indexed user, uint256 indexed index);
    event RedemptionCancelled(address indexed user, uint256 indexed index);
    event RedemptionCompleted(address indexed user, uint256 indexed index);
    event RedemptionStatusChanged(bool isActive);
    event XaiAddressChanged(address indexed newXaiAddress);
    event FoundationBasepointsUpdated(uint256 newBasepoints);

    function initialize (address _refereeAddress, address _nodeLicenseAddress, address _poolFactoryAddress, uint256 _maxKeys) public reinitializer(3) {
        require(_refereeAddress != address(0), "Invalid referee address");
        require(_nodeLicenseAddress != address(0), "Invalid node license address");
        refereeAddress = _refereeAddress;
        nodeLicenseAddress = _nodeLicenseAddress;
        poolFactoryAddress = _poolFactoryAddress;
        maxKeysNonKyc = _maxKeys;
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
        
        // Check if the sender failed KYC
        bool failedKyc = PoolFactory2(poolFactoryAddress).failedKyc(msg.sender);
        require(!failedKyc, "KYC failed, cannot redeem");

        // Transfer the esXai tokens from the sender's account to this contract
        _transfer(msg.sender, address(this), amount);

        // Store the redemption request
        _extRedemptionRequests[msg.sender].push(RedemptionRequestExt(amount, block.timestamp, duration, 0, false, false, [uint256(0),0,0,0,0]));
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

        // Transfer back the esXai tokens to the sender's account
        _transfer(address(this), msg.sender, request.amount);

        // Mark the redemption request as completed
        request.completed = true;
        request.cancelled = true;
        request.endTime = block.timestamp;
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
    * @notice Retrieves a list of redemption requests for a given user, supporting pagination.
    * @param account The address of the user whose redemption requests are being queried.
    * @param maxQty The maximum number of redemption requests to return.
    * @param offset The offset for pagination, representing the number of requests to skip.
    * @return redemptions An array of redemption requests matching the query.
    * @return totalRedemptions The total number of redemption requests matching the criteria.
    */
    function getRedemptionsByUser(
        address account,
        uint256 maxQty,
        uint256 offset
    ) external view returns (RedemptionRequestExt[] memory redemptions, uint256 totalRedemptions) {
        
        totalRedemptions = _extRedemptionRequests[account].length; // Get the total number of redemption requests for the user.

        // Early return if maxQty is zero or offset is out of bounds.
        if (maxQty == 0 || offset >= totalRedemptions) {
            return (redemptions, 0);
        }

        // Determine the number of redemption requests to return.
        uint256 remainingItems = totalRedemptions - offset; // Number of items left after applying the offset.

        // Calculate the quantity of items to return, considering the remaining items and maxQty.
        uint256 qtyToReturn = maxQty > remainingItems ? remainingItems : maxQty;

        // Initialize arrays with the maximum possible size based on qtyToReturn.
        redemptions = new RedemptionRequestExt[](qtyToReturn);

        uint256 count = 0; // Counter for the number of items added to the return arrays.

        // Iterate through the array in ascending order to get requests starting from the oldest.
        for (uint256 i = offset; i < offset + qtyToReturn; i++) {
            RedemptionRequestExt memory request = _extRedemptionRequests[account][i];

            // Add the request to the return arrays.
            redemptions[count] = request;
            count++;
        }

        return (redemptions, totalRedemptions);
    }

    /**
    * @notice Returns a list of redemption requests for a given user at specified indices.
    * @param account The address of the user whose redemption requests are to be fetched.
    * @param indices An array of indices representing the specific redemption requests to retrieve.
    * @return redemptions An array of `RedemptionRequestExt` structs corresponding to the specified indices.
    * @return totalRedemptions The current total number of redemption requests for the user.
    */
    function refreshUserRedemptionsByIndex(
        address account, 
        uint256[] memory indices
    ) 
        external 
        view 
        returns (RedemptionRequestExt[] memory redemptions, uint256 totalRedemptions) 
    {
        // Get the total number of redemption requests for the given account
        totalRedemptions = _extRedemptionRequests[account].length;

        uint256 totalIndicies = indices.length;

        // If no indices provided, return empty
        if (totalIndicies == 0) {
            return (redemptions, totalRedemptions);
        }

        // Initialize an array for the redemption requests with the final required size
        redemptions = new RedemptionRequestExt[](totalIndicies);

        for (uint256 i = 0; i < totalIndicies; i++) {
            uint256 index;
            index = indices[i];

            // Ensure index is within bounds before fetching redemption
            require(index < totalRedemptions, "Index out of bounds");
            redemptions[i] = _extRedemptionRequests[account][index];
        }

        return (redemptions, totalRedemptions);
    }

}