// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract NodeLicense2 is ERC721EnumerableUpgradeable, AccessControlUpgradeable {
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    address payable public fundsReceiver;

    uint256 public maxSupply; // Maximum number of licenses that can be minted

    // Define the pricing table
    Tier[] private pricingTiers;

    uint256 public referralDiscountPercentage;
    uint256 public referralRewardPercentage;

    // Boolean to control whether referral rewards can be claimed
    bool public claimable;

    // Mapping from token ID to minting timestamp
    mapping (uint256 => uint256) private _mintTimestamps;

    // Mapping from promo code to PromoCode struct
    mapping (string => PromoCode) private _promoCodes;

    // Mapping from referral address to referral reward
    mapping (address => uint256) private _referralRewards;

    // Mapping from token ID to average cost, this is used for refunds over multiple tiers
    mapping (uint256 => uint256) private _averageCost;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    // Define the pricing tiers
    struct Tier {
        uint256 price;
        uint256 quantity;
    }

    // Define the PromoCode struct
    struct PromoCode {
        address recipient;
        bool active;
        uint256 receivedLifetime;
    }

    event PromoCodeCreated(string promoCode, address recipient);
    event PromoCodeRemoved(string promoCode);
    event RewardClaimed(address indexed claimer, uint256 amount);
    event PricingTierSetOrAdded(uint256 index, uint256 price, uint256 quantity);
    event ReferralRewardPercentagesChanged(uint256 referralDiscountPercentage, uint256 referralRewardPercentage);
    event RefundOccurred(address indexed refundee, uint256 amount);
    event ReferralReward(address indexed buyer, address indexed referralAddress, uint256 amount);
    event FundsWithdrawn(address indexed admin, uint256 amount);
    event FundsReceiverChanged(address indexed admin, address newFundsReceiver);
    event ClaimableChanged(address indexed admin, bool newClaimableState);

    /**
     * @notice Creates a new promo code.
     * @param _promoCode The promo code.
     * @param _recipient The recipient address.
     */
    function createPromoCode(string calldata _promoCode, address _recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_recipient != address(0), "Recipient address cannot be zero");
        _promoCodes[_promoCode] = PromoCode(_recipient, true, 0);
        emit PromoCodeCreated(_promoCode, _recipient);
    }

    /**
     * @notice Disables a promo code.
     * @param _promoCode The promo code to disable.
     */
    function removePromoCode(string calldata _promoCode) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_promoCodes[_promoCode].recipient != address(0), "Promo code does not exist");
        _promoCodes[_promoCode].active = false; // 'active' is set to false
        emit PromoCodeRemoved(_promoCode);
    }

    /**
     * @notice Returns the promo code details.
     * @param _promoCode The promo code to get.
     * @return The promo code details.
     */
    function getPromoCode(string calldata _promoCode) external view returns (PromoCode memory) {
        return _promoCodes[_promoCode];
    }

    /**
     * @notice Returns the length of the pricing tiers array.
     * @return The length of the pricing tiers array.
     */
    function getPricingTiersLength() external view returns (uint256) {
        return pricingTiers.length;
    }

    /**
     * @notice Mints new NodeLicense tokens.
     * @param _amount The amount of tokens to mint.
     * @param _promoCode The promo code.
     */
    function mint(uint256 _amount, string calldata _promoCode) public payable {
        require(
            _tokenIds.current() + _amount <= maxSupply,
            "Exceeds maxSupply"
        );
        PromoCode memory promoCode = _promoCodes[_promoCode];
        require(
            (promoCode.recipient != address(0) && promoCode.active) || bytes(_promoCode).length == 0,
            "Invalid or inactive promo code"
        );
        require(
            promoCode.recipient != msg.sender,
            "Referral address cannot be the sender's address"
        );

        uint256 finalPrice = price(_amount, _promoCode);
        uint256 averageCost = msg.value / _amount;

        require(msg.value >= finalPrice, "Ether value sent is not correct");

        for (uint256 i = 0; i < _amount; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(msg.sender, newItemId);

            // Record the minting timestamp
            _mintTimestamps[newItemId] = block.timestamp;

            // Record the average cost
            _averageCost[newItemId] = averageCost;
        }

        // Calculate the referral reward
        uint256 referralReward = 0;
        if (promoCode.recipient != address(0)) {
            referralReward = finalPrice * referralRewardPercentage / 100;
            _referralRewards[promoCode.recipient] += referralReward;
            _promoCodes[_promoCode].receivedLifetime += referralReward;
            emit ReferralReward(msg.sender, promoCode.recipient, referralReward);
        }

        uint256 remainder = msg.value - finalPrice;
        (bool sent, bytes memory data) = fundsReceiver.call{value: finalPrice - referralReward}("");
        require(sent, "Failed to send Ether");

        // Send back the remainder amount
        if (remainder > 0) {
            (bool sentRemainder, bytes memory dataRemainder) = msg.sender.call{value: remainder}("");
            require(sentRemainder, "Failed to send back the remainder Ether");
        }
    }

    /**
     * @notice Calculates the price for minting NodeLicense tokens.
     * @param _amount The amount of tokens to mint.
     * @param _promoCode The promo code to use address.
     * @return The price in wei.
     */
    function price(uint256 _amount, string calldata _promoCode) public view returns (uint256) {
        uint256 totalSupply = totalSupply();
        uint256 totalCost = 0;
        uint256 remaining = _amount;
        uint256 tierSum = 0;

        for (uint256 i = 0; i < pricingTiers.length; i++) {
            tierSum += pricingTiers[i].quantity;
            uint256 availableInThisTier = tierSum > totalSupply
                ? tierSum - totalSupply
                : 0;

            if (remaining <= availableInThisTier) {
                totalCost += remaining * pricingTiers[i].price;
                remaining = 0;
                break;
            } else {
                totalCost += availableInThisTier * pricingTiers[i].price;
                remaining -= availableInThisTier;
                totalSupply += availableInThisTier;
            }
        }

        require(remaining == 0, "Not enough licenses available for sale");

        // Apply discount if promo code is active
        if (_promoCodes[_promoCode].active) {
            totalCost = totalCost * (100 - referralDiscountPercentage) / 100;
        }

        return totalCost;
    }

    /**
     * @notice Allows a user to claim their referral reward.
     * @dev The function checks if claiming is enabled and if the caller has a reward to claim.
     * If both conditions are met, the reward is transferred to the caller and their reward balance is reset.
     */
    function claimReferralReward() external {
        require(claimable, "Claiming of referral rewards is currently disabled");
        uint256 reward = _referralRewards[msg.sender];
        require(reward > 0, "No referral reward to claim");
        _referralRewards[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed.");
        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @notice Allows the admin to withdraw all funds from the contract.
     * @dev Only callable by the admin.
     */
    function withdrawFunds() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 amount = address(this).balance;
        fundsReceiver.transfer(amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Allows the admin to toggle the claimable state of referral rewards.
     * @param _claimable The new state of the claimable variable.
     * @dev Only callable by the admin.
     */
    function setClaimable(bool _claimable) external onlyRole(DEFAULT_ADMIN_ROLE) {
        claimable = _claimable;
        emit ClaimableChanged(msg.sender, _claimable);
    }

    /**
     * @notice Sets the fundsReceiver address.
     * @param _newFundsReceiver The new fundsReceiver address.
     * @dev The new fundsReceiver address cannot be the zero address.
     */
    function setFundsReceiver(
        address payable _newFundsReceiver
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newFundsReceiver != address(0), "New fundsReceiver cannot be the zero address");
        fundsReceiver = _newFundsReceiver;
        emit FundsReceiverChanged(msg.sender, _newFundsReceiver);
    }

    /**
     * @notice Sets the referral discount and reward percentages.
     * @param _referralDiscountPercentage The referral discount percentage.
     * @param _referralRewardPercentage The referral reward percentage.
     * @dev The referral discount and reward percentages cannot be greater than 99.
     */
    function setReferralPercentages(
        uint256 _referralDiscountPercentage,
        uint256 _referralRewardPercentage
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_referralDiscountPercentage <= 99, "Referral discount percentage cannot be greater than 99");
        require(_referralRewardPercentage <= 99, "Referral reward percentage cannot be greater than 99");
        referralDiscountPercentage = _referralDiscountPercentage;
        referralRewardPercentage = _referralRewardPercentage;
        emit ReferralRewardPercentagesChanged(_referralDiscountPercentage, _referralRewardPercentage);
    }

    /**
     * @notice Sets or adds a pricing tier.
     * @param _index The index of the tier to set or add.
     * @param _price The price of the tier.
     * @param _quantity The quantity of the tier.
     */
    function setOrAddPricingTier(uint256 _index, uint256 _price, uint256 _quantity) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_index < pricingTiers.length) {
            // Subtract the quantity of the old tier from maxSupply
            maxSupply -= pricingTiers[_index].quantity;
            pricingTiers[_index] = Tier(_price, _quantity);
        } else if (_index == pricingTiers.length) {
            pricingTiers.push(Tier(_price, _quantity));
        } else {
            revert("Index out of bounds");
        }

        // Add the quantity of the new or updated tier to maxSupply
        maxSupply += _quantity;
        emit PricingTierSetOrAdded(_index, _price, _quantity);
    }

    /**
     * @notice Returns the pricing tier at the given index.
     * @param _index The index of the tier.
     * @return The Tier at the given index.
     */
    function getPricingTier(uint256 _index) public view returns (Tier memory) {
        require(_index < pricingTiers.length, "Index out of bounds");
        return pricingTiers[_index];
    }

    /**
     * @notice Returns the metadata of a NodeLicense token.
     * @param _tokenId The ID of the token.
     * @return The token metadata.
     */
    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        address ownerAddress = ownerOf(_tokenId);
        string memory svg = string(
            abi.encodePacked(
                "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' style='background-color:black;'><polygon points='50,0 0,86.6 100,86.6' fill='none' stroke='red' stroke-width='20' transform='scale(0.1) translate(60, 60)'/><text x='5' y='25' font-size='2.8' fill='white' font-family='monospace'>License Id: ",
                _tokenId.toString(),
                "</text><text x='5' y='30' font-size='2.8' fill='white' font-family='monospace'>Owner: ",
                StringsUpgradeable.toHexString(uint160(ownerAddress)),
                "</text><text x='5' y='35' font-size='2.8' fill='white' font-family='monospace'>Mint Timestamp: ",
                _mintTimestamps[_tokenId].toString(),
                "</text><text x='5' y='40' font-size='2.8' fill='white' font-family='monospace'>Total Number of Licenses Owned by Owner: ",
                balanceOf(ownerAddress).toString(),
                "</text></svg>"
            )
        );
        string memory image = Base64Upgradeable.encode(bytes(svg));
        string memory json = Base64Upgradeable.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Token #',
                        _tokenId.toString(),
                        '", "description": "A NodeLicense token", "image": "data:image/svg+xml;base64,',
                        image,
                        '", "owner": "',
                        StringsUpgradeable.toHexString(uint160(ownerAddress)),
                        '"}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @notice Allows the admin to refund a NodeLicense.
     * @param _tokenId The ID of the token to refund.
     * @dev Only callable by the admin.
     */
    function refundNodeLicense(uint256 _tokenId) external payable onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(_tokenId), "ERC721Metadata: Refund for nonexistent token");
        uint256 refundAmount = _averageCost[_tokenId];
        require(refundAmount > 0, "No funds to refund");
        _averageCost[_tokenId] = 0;
        (bool success, ) = payable(ownerOf(_tokenId)).call{value: refundAmount}("");
        require(success, "Transfer failed.");
        emit RefundOccurred(ownerOf(_tokenId), refundAmount);
        _burn(_tokenId);
    }

    /**
     * @notice Returns the average cost of a NodeLicense token. This is primarily used for refunds.
     * @param _tokenId The ID of the token.
     * @return The average cost.
     */
    function getAverageCost(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "ERC721Metadata: Query for nonexistent token");
        return _averageCost[_tokenId];
    }

    /**
     * @notice Returns the minting timestamp of a NodeLicense token.
     * @param _tokenId The ID of the token.
     * @return The minting timestamp.
     */
    function getMintTimestamp(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "ERC721Metadata: Query for nonexistent token");
        return _mintTimestamps[_tokenId];
    }

    /**
     * @notice Overrides the supportsInterface function of the AccessControl contract.
     * @param interfaceId The interface id.
     * @return A boolean value indicating whether the contract supports the given interface.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721EnumerableUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId) || ERC721EnumerableUpgradeable.supportsInterface(interfaceId) || AccessControlUpgradeable.supportsInterface(interfaceId);
    }

    /**
     * @notice Overrides the transfer function of the ERC721 contract to make the token non-transferable.
     * @param from The current owner of the token.
     * @param to The address to receive the token.
     * @param tokenId The token id.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        revert("NodeLicense: transfer is not allowed");
    }
}

