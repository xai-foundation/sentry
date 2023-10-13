pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NodeLicense is ERC721Enumerable, AccessControl {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address payable public fundsReceiver;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public maxSupply; // Maximum number of licenses that can be minted

    // Define the pricing tiers
    struct Tier {
        uint256 price;
        uint256 quantity;
    }

    // Define the pricing table
    Tier[] private pricingTiers;

    event FundsReceiverChanged(address newFundsReceiver);

    constructor(
        address payable _fundsReceiver
    ) ERC721("Vanguard Node License", "VNL") {
        fundsReceiver = _fundsReceiver;
        _setupRole(ADMIN_ROLE, msg.sender);
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
     */
    function mint(uint256 _amount) public payable {
        require(
            _tokenIds.current() + _amount <= maxSupply,
            "Exceeds maxSupply"
        );
        require(msg.value >= price(_amount), "Ether value sent is not correct");

        for (uint256 i = 0; i < _amount; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(msg.sender, newItemId);
        }

        // Transfer the funds to the fundsReceiver
        fundsReceiver.transfer(msg.value);
    }

    /**
     * @notice Calculates the price for minting NodeLicense tokens.
     * @param _amount The amount of tokens to mint.
     * @return The price in wei.
     */
    function price(uint256 _amount) public view returns (uint256) {
        uint256 totalSupply = _tokenIds.current();
        uint256 totalCost = 0;
        uint256 remaining = _amount;

        for (uint256 i = 0; i < pricingTiers.length; i++) {
            uint256 availableInThisTier = pricingTiers[i].quantity > totalSupply
                ? pricingTiers[i].quantity - totalSupply
                : 0;

            if (remaining <= availableInThisTier) {
                totalCost += remaining * pricingTiers[i].price;
                break;
            } else {
                totalCost += availableInThisTier * pricingTiers[i].price;
                remaining -= availableInThisTier;
                totalSupply += availableInThisTier;
            }
        }

        require(remaining == 0, "Not enough tokens available for sale");

        return totalCost;
    }

    /**
     * @notice Sets the fundsReceiver address.
     * @param _newFundsReceiver The new fundsReceiver address.
     */
    function setFundsReceiver(
        address payable _newFundsReceiver
    ) external onlyRole(ADMIN_ROLE) {
        fundsReceiver = _newFundsReceiver;
        emit FundsReceiverChanged(_newFundsReceiver);
    }

    /**
     * @notice Sets or adds a pricing tier.
     * @param _index The index of the tier to set or add.
     * @param _price The price of the tier.
     * @param _quantity The quantity of the tier.
     */
    function setOrAddPricingTier(uint256 _index, uint256 _price, uint256 _quantity) external onlyRole(ADMIN_ROLE) {
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
                "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text x='10' y='50' font-size='20'>",
                _tokenId.toString(),
                "</text><text x='10' y='90' font-size='15' textLength='100' lengthAdjust='spacingAndGlyphs'>",
                Strings.toHexString(uint160(ownerAddress)),
                "</text></svg>"
            )
        );
        string memory image = Base64.encode(bytes(svg));
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Token #',
                        _tokenId.toString(),
                        '", "description": "A NodeLicense token", "image": "data:image/svg+xml;base64,',
                        image,
                        '", "owner": "',
                        Strings.toHexString(uint160(ownerAddress)),
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
    ) public view override(ERC721Enumerable, AccessControl) returns (bool) {
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
