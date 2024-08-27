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

    mapping(address => uint256) public _totalPendingRedemptions;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[492] private __gap;

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
    event VoucherIssued(address indexed user, uint256[] indices);

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
        
        // No longer transferring esXai from the sender's account to this contract
        // Stoing redemption claim as voucherIssued instead

        // Confirm the user has the appropriate amount of esXai available
        uint256 currentBalance = balanceOf(msg.sender);        
        uint256 totalEsXaiStaked = PoolFactory2(poolFactoryAddress).getTotalesXaiStakedByUser(msg.sender);
        uint256 availableEsXai = currentBalance + totalEsXaiStaked - _totalPendingRedemptions[msg.sender];

        require(availableEsXai >= amount, "Insufficient esXai balance");
        
        // Increment the total pending redemptions
        _totalPendingRedemptions[msg.sender] += amount;

        // Store the redemption request
        _extRedemptionRequests[msg.sender].push(RedemptionRequestExt(amount, block.timestamp, duration, 0, false, false, true,[uint256(0),0,0,0,0]));
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

        if(request.voucherIssued) {

            // If the voucher was issued, decrement the totalPendingRedemptions
            _totalPendingRedemptions[msg.sender] -= request.amount;
        }else{
            // If the voucher was not issued
            // Transfer the esXai tokens back to the sender's account
            _transfer(address(this), msg.sender, request.amount);
        }

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

        // Adding this just in case a conversion was some how missed.
        // This would allow the user to still redeem the esXai while keeping the state correct.
        if(request.voucherIssued) {     

            // Update the user's totalPendingRedemptions
            _totalPendingRedemptions[msg.sender] -= request.amount;

            // Transfer the esXai tokens from the sender's account to this contract
            _transfer(msg.sender, address(this), request.amount);
        }

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
    * Converts redemptions in process to vouchers for a given list of accounts and indices.
    * 
    * This function processes redemptions that are currently in process and converts them into vouchers. 
    * It requires that redemptions be paused, and validates that the length of `accounts` matches the length of `indices`.
    * For each redemption request, it checks if the request is not completed and if the voucher has not been issued.
    * If both conditions are met, it marks the voucher as issued, updates the total pending redemptions, 
    * and transfers the corresponding amount to the account.
    * 
    * @param accounts - The list of account addresses for which redemptions are to be converted.
    * @param indices - The list of indices corresponding to redemption requests for each account.
    * Will throw an error if redemptions are active or if the lengths of `accounts` and `indices` do not match.
    * @dev Only callable by an account with the `DEFAULT_ADMIN_ROLE`.
    */
    function convertRedemptionsInProcess(address[] calldata accounts, uint256[][] calldata indices) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_redemptionActive, "Redemptions must be paused to convert");
        require(accounts.length == indices.length, "Invalid input");
        for(uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            uint256[] memory accountIndices = indices[i];
            for(uint256 j = 0; j < accountIndices.length; j++) {
                RedemptionRequestExt storage request = _extRedemptionRequests[account][accountIndices[j]];
                // If the request is not completed and the voucher has not been issued
                // Send the esXai back and issue the voucher
                if(request.amount > 0 && !request.completed && !request.voucherIssued) {
                    request.voucherIssued = true;
                    _totalPendingRedemptions[account] += request.amount;
                    transfer(accounts[i], request.amount);
                }
            }
            emit VoucherIssued(account, accountIndices);
        }
    }
}
