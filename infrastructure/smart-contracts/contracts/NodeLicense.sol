pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract NodeLicense is ERC721EnumerableUpgradeable, AccessControlUpgradeable {
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    address payable public fundsReceiver;

    uint256 public maxSupply; // Maximum number of licenses that can be minted

    // Define the pricing tiers
    struct Tier {
        uint256 price;
        uint256 quantity;
    }

    // Define the pricing table
    Tier[] private pricingTiers;

    uint256 public referralDiscountPercentage;
    uint256 public referralRewardPercentage;

    // Mapping from token ID to minting timestamp
    mapping (uint256 => uint256) private _mintTimestamps;

    event ReferralReward(address indexed buyer, address indexed referralAddress, uint256 amount);

    function initialize(
        address payable _fundsReceiver,
        uint256 _referralDiscountPercentage,
        uint256 _referralRewardPercentage
    ) public initializer {
        __ERC721_init("Vanguard Node License", "VNL");
        __AccessControl_init();
        fundsReceiver = _fundsReceiver;
        referralDiscountPercentage = _referralDiscountPercentage;
        referralRewardPercentage = _referralRewardPercentage;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
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
     * @param _referralAddress The referral address.
     */
    function mint(uint256 _amount, address _referralAddress) public payable {
        require(
            _tokenIds.current() + _amount <= maxSupply,
            "Exceeds maxSupply"
        );
        require(
            _referralAddress != msg.sender,
            "Referral address cannot be the sender's address"
        );

        uint256 finalPrice = price(_amount, _referralAddress);

        require(msg.value >= finalPrice, "Ether value sent is not correct");

        for (uint256 i = 0; i < _amount; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(msg.sender, newItemId);

            // Record the minting timestamp
            _mintTimestamps[newItemId] = block.timestamp;
        }

        // Calculate the referral reward
        uint256 referralReward = 0;
        if (_referralAddress != address(0)) {
            referralReward = finalPrice * referralRewardPercentage / 100;
            payable(_referralAddress).transfer(referralReward);
            emit ReferralReward(msg.sender, _referralAddress, referralReward);
        }

        // Transfer the funds to the fundsReceiver
        fundsReceiver.transfer(msg.value - referralReward);
    }

    /**
     * @notice Calculates the price for minting NodeLicense tokens.
     * @param _amount The amount of tokens to mint.
     * @param _referralAddress The referral address.
     * @return The price in wei.
     */
    function price(uint256 _amount, address _referralAddress) public view returns (uint256) {
        uint256 totalSupply = _tokenIds.current();
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

        // Apply discount if referral address is not the sender
        if (_referralAddress != address(0)) {
            totalCost = totalCost * (100 - referralDiscountPercentage) / 100;
        }

        return totalCost;
    }

    /**
     * @notice Sets the fundsReceiver address.
     * @param _newFundsReceiver The new fundsReceiver address.
     */
    function setFundsReceiver(
        address payable _newFundsReceiver
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fundsReceiver = _newFundsReceiver;
    }

    /**
     * @notice Sets the referral discount and reward percentages.
     * @param _referralDiscountPercentage The referral discount percentage.
     * @param _referralRewardPercentage The referral reward percentage.
     */
    function setReferralPercentages(
        uint256 _referralDiscountPercentage,
        uint256 _referralRewardPercentage
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        referralDiscountPercentage = _referralDiscountPercentage;
        referralRewardPercentage = _referralRewardPercentage;
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
     * @notice Returns the timestamp at which the token was minted.
     * @param _tokenId The ID of the token.
     * @return The minting timestamp.
     */
    function getMintTimestamp(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "ERC721Metadata: Query for nonexistent token");
        return _mintTimestamps[_tokenId];
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
                "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' style='background-color:black;'><text x='10' y='50' font-size='20' fill='white'>",
                _tokenId.toString(),
                "</text><text x='10' y='90' font-size='15' textLength='100' lengthAdjust='spacingAndGlyphs' fill='white'>",
                StringsUpgradeable.toHexString(uint160(ownerAddress)),
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
     * @notice Overrides the supportsInterface function of the AccessControl contract.
     * @param interfaceId The interface id.
     * @return A boolean value indicating whether the contract supports the given interface.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721EnumerableUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
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
