// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../../upgrades/referee/Referee9.sol";

interface IAggregatorV3Interface {
    function latestAnswer() external view returns (int256);
}

contract NodeLicense8 is ERC721EnumerableUpgradeable, AccessControlUpgradeable  {
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
    
    // Mapping for whitelist to claim NFTs without a price
    mapping (address => uint16) public whitelistAmounts;

    /**
     *  @dev New promo code mappings are ONLY used for 
     *  reward tracking of XAI and esXAI rewards
     *  The original promo code mapping is used for promo
     *  code creation, removal, activation and recipient tracking
     * 
     *  @notice The new mappings should not be checked for 
     *  promo code existence or activation, they simply track 
     *  the referral rewards for XAI and esXAI 
     */

    // Mapping from promo code to PromoCode struct for Xai
    mapping (string => PromoCode) private _promoCodesXai;

    // Mapping from promo code to PromoCode struct for esXai
    mapping (string => PromoCode) private _promoCodesEsXai;

    // Mapping from referral address to referral reward
    mapping (address => uint256) private _referralRewardsXai;

    // Mapping from referral address to referral reward
    mapping (address => uint256) private _referralRewardsEsXai;

    // Chainlink Eth/USD price feed
    IAggregatorV3Interface internal ethPriceFeed;

    //Chainlink XAI/USD price feed
    IAggregatorV3Interface internal xaiPriceFeed;

    // Token Addresses
    address public xaiAddress;
    address public esXaiAddress;

    // Pause Minting
    bool public mintingPaused;

    // Reentrancy guard boolean
    bool private _reentrancyGuardClaimReferralReward;

    bytes32 public constant AIRDROP_ADMIN_ROLE = keccak256("AIRDROP_ADMIN_ROLE");


    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[491] private __gap;

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
    event RewardClaimed(address indexed claimer, uint256 ethAmount, uint256 xaiAmount, uint256 esXaiAmount);
    event PricingTierSetOrAdded(uint256 index, uint256 price, uint256 quantity);
    event ReferralRewardPercentagesChanged(uint256 referralDiscountPercentage, uint256 referralRewardPercentage);
    event ReferralReward(address indexed buyer, address indexed referralAddress, uint256 amount);
    event FundsReceiverChanged(address indexed admin, address newFundsReceiver);
    event ClaimableChanged(address indexed admin, bool newClaimableState);
    event WhitelistAmountUpdatedByAdmin(address indexed redeemer, uint16 newAmount);
    event WhitelistAmountRedeemed(address indexed redeemer, uint16 newAmount);

    /**
     * @notice Initializes the NodeLicense contract.
     * 
     */

    function initialize(address _xaiAddress,  address _esXaiAddress, address ethPriceFeedAddress, address xaiPriceFeedAddress, address airdropAdmin) public reinitializer(3) {
        require(_xaiAddress != address(0), "Invalid xai address");
        require(_esXaiAddress != address(0), "Invalid esXai address");
        require(ethPriceFeedAddress != address(0), "Invalid ethPriceFeed address");
        require(xaiPriceFeedAddress != address(0), "Invalid xaiPriceFeed address");
        ethPriceFeed = IAggregatorV3Interface(ethPriceFeedAddress);
        xaiPriceFeed = IAggregatorV3Interface(xaiPriceFeedAddress);
        xaiAddress = _xaiAddress;
        esXaiAddress = _esXaiAddress;
        
        // Grant the airdrop admin role to the airdrop admin address
        _grantRole(AIRDROP_ADMIN_ROLE, airdropAdmin);
    }

    /** 
    * @notice Reentrancy guard modifier for the claimReferralReward function
    * @dev This modifier prevents reentrancy attacks by setting a boolean to true when the function is called
    */
    
    modifier reentrancyGuardClaimReferralReward() {
        require(!_reentrancyGuardClaimReferralReward, "Reentrancy guard: reentrant call");
        _reentrancyGuardClaimReferralReward = true;
        _;
        _reentrancyGuardClaimReferralReward = false;
    }

    /**
     * @notice Creates a new promo code.
     * @param _promoCode The promo code.
     * @param _recipient The recipient address.
     */
    function createPromoCode(string calldata _promoCode, address _recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_recipient != address(0), "Recipient address cannot be zero");
        require(_promoCodes[_promoCode].recipient == address(0), "Promo code already exists");
        require(bytes(_promoCode).length > 0, "Promo code cannot be empty");
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
        _mintInternal(msg.sender, _amount, _promoCode);
    }
    /**
     * @notice Mints new NodeLicense tokens.
     * @param _mintToAddress The address to mint the tokens to.
     * @param _amount The amount of tokens to mint.
     * @param _promoCode The promo code.
     */
    function mintTo(address _mintToAddress, uint256 _amount, string calldata _promoCode) public payable {
        _mintInternal(_mintToAddress, _amount, _promoCode);
    }

    function _mintInternal(address _mintToAddress, uint256 _amount, string calldata _promoCode) internal {
        // Validate the mint data
        _validateMint(_amount);

        // Calculate the final price and average cost
        uint256 finalPrice = price(_amount, _promoCode);
        uint256 averageCost = finalPrice / _amount;

        // Confirm that the ether value sent is correct
        require(msg.value >= finalPrice, "Ether value sent is not correct");

        // Mint the NodeLicense tokens
        _mintNodeLicense(_amount, averageCost, _mintToAddress);

        // Calculate the referral reward and determine if the promo code is an address
        (uint256 referralReward, address recipientAddress)  = _calculateReferralReward(finalPrice, _promoCode);

        // Update the promo code mappings for Eth rewards
        if(referralReward > 0){
            // Use promo original code mapping for codes & new mappings for reward tracking
            _promoCodes[_promoCode].receivedLifetime += referralReward;
            _referralRewards[recipientAddress] += referralReward;            
        }

        // Send the funds to the fundsReceiver
        uint256 remainder = msg.value - finalPrice;
        (bool sent,) = fundsReceiver.call{value: finalPrice - referralReward}("");
        require(sent, "Failed to send Ether");

        // Send back the remainder amount
        if (remainder > 0) {
            (bool sentRemainder,) = msg.sender.call{value: remainder}("");
            require(sentRemainder, "Failed to send back the remainder Ether");
        }
    }

    /**
     * @notice Mints new NodeLicense tokens using XAI/esXai as payment.
     * @param _amount The amount of tokens to mint.
     * @param _promoCode The promo code.
     * @param _useEsXai a boolean to determine if the payment is in XAI or esXai
     */
    function mintWithXai(uint256 _amount, string calldata _promoCode, bool _useEsXai, uint256 _expectedCost) public {

        _validateMint(_amount);

        uint256 finalEthPrice = price(_amount, _promoCode);
        // Convert the final price to XAI
        uint256 finalPrice = ethToXai(finalEthPrice);

        // Confirm the final price does not exceed the expected cost
        require(finalPrice <= _expectedCost, "Price Exceeds Expected Cost");

        uint256 averageCost = finalEthPrice / _amount;

        _mintNodeLicense(_amount, averageCost, msg.sender);

        // Calculate the referral reward and determine if the promo code is an address
        (uint256 referralReward, address recipientAddress)  = _calculateReferralReward(finalPrice, _promoCode);
        
        IERC20 token = IERC20(_useEsXai ? esXaiAddress : xaiAddress);
        token.transferFrom(msg.sender, address(this), finalPrice);
        token.transfer(fundsReceiver, finalPrice - referralReward);

        if(referralReward > 0){
            // Store the referral reward in the appropriate mapping
            if(_useEsXai){
                _promoCodesEsXai[_promoCode].receivedLifetime += referralReward;
                _referralRewardsEsXai[recipientAddress] += referralReward;
            } else {
                _promoCodesXai[_promoCode].receivedLifetime += referralReward;
                _referralRewardsXai[recipientAddress] += referralReward;
            }
        }     
    }

    /**
     * @notice Start the airdrop process
     * @dev Only callable by the airdrop admin
     * pauses mintting until completion of the airdrop
     */

    function startAirdrop(address refereeAddress) external onlyRole(AIRDROP_ADMIN_ROLE) {
        mintingPaused = true;
        Referee9(refereeAddress).setStakingEnabled(false);
    }

    function finishAirdrop(address refereeAddress, uint256 keyMultiplier) external onlyRole(AIRDROP_ADMIN_ROLE) {
        updatePricingAndQuantity(keyMultiplier);
        mintingPaused = false;
        Referee9(refereeAddress).setStakingEnabled(true);
    }

    /**
     *  @notice Mints new NodeLicense tokens for the tiny keys airdrop
     *  @param _qtyToMint The qty of tokens to mint.
     *  @param _keyId The keyId of the node license receiving the airdrop
     *  @dev Only callable by the airdrop admin
     */
    function mintForAirdrop(uint256 _qtyToMint, uint256 _keyId) external onlyRole(AIRDROP_ADMIN_ROLE) {
        _mintNodeLicense(_qtyToMint, 0, ownerOf(_keyId));
    }

    /**
    * @notice Revokes the airdrop admin role for the address passed in
    * @param _address The address to revoke the airdrop admin role from
    * @dev Only callable by the airdrop admin
    */

    function revokeAirdropAdmin(address _address) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(AIRDROP_ADMIN_ROLE, _address);
    }
    


    /**
     * @notice Validate new mint request
     * @dev this is called internally to validate the minting process
     * @param _amount The amount of tokens to mint.
     */
    function _validateMint(uint256 _amount) internal view {
        require(
            _tokenIds.current() + _amount <= maxSupply,
            "Exceeds maxSupply"
        );

        require(!mintingPaused, "Minting is paused");
    }

    /** 
     * @notice internal function to mint new NodeLicense tokens
     * @param _amount The amount of tokens to mint.
     */
    function _mintNodeLicense(uint256 _amount, uint256 averageCost, address _receiver) internal {
        // uint256 [] memory tokenIds = new uint256[](_amount);
        for (uint256 i = 0; i < _amount; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(_receiver, newItemId);
             // Record the minting timestamp
            _mintTimestamps[newItemId] = block.timestamp;
            // Record the average cost
            _averageCost[newItemId] = averageCost;
        }
        // return tokenIds;
    }

    /**
     * @notice Calculates the referral reward based on the promo code
     * @dev the promo code may be a string, or an address, but will be passed
     * as a string to this function
     * @param _finalPrice The final cost of the minting
     * @param _promoCode The promo code used
     * @return A tuple containing the referral reward and an address with 0 address indicating the promo code was not an address
     */
    function _calculateReferralReward(uint256 _finalPrice, string memory _promoCode) internal returns(uint256, address) {
        // If the promo code is empty, return 0
        if(bytes(_promoCode).length == 0){
            return (0, address(0));
        }

        // Retrieve the promo code from storage if it exists
        PromoCode memory promoCode = _promoCodes[_promoCode];
        uint256 referralReward = 0;
        
        // Check if the promo code already exists in the mappings
        if(promoCode.recipient != address(0)){

            // Promo code exists in the mapping
            // If the promo code is not active, return 0
            if (!promoCode.active) {
                return (0,  address(0));
            }

            // Confirm the recipient is not the sender
            require(promoCode.recipient != msg.sender, "Referral address cannot be the sender's address");

            // Calculate the referral reward
            referralReward = _finalPrice * referralRewardPercentage / 100;
            emit ReferralReward(msg.sender, promoCode.recipient, referralReward);

            return (referralReward, promoCode.recipient);
            
        }else{
        // If promo code does not exist in the mapping

        // Check if the promo code is an address
        address promoCodeAsAddress = validateAndConvertAddress(_promoCode);

        // If the promo code is an address, determine if the recipient has been set
        if(promoCodeAsAddress != address(0)){

            // Confirm the promo code is not the sender's address
            require(promoCodeAsAddress != msg.sender, "Referral address cannot be the sender's address");

            // Get the node license balance of the promo code address
            if(this.balanceOf(promoCodeAsAddress) == 0){
                // If the promo code is an address, the address must own at least one node license
                return (0, address(0));
            }


            // Set the promo code recipient to the address
            _promoCodes[_promoCode].recipient = promoCodeAsAddress;
            _promoCodes[_promoCode].active = true;            

            // Calculate the referral reward
            referralReward = _finalPrice * referralRewardPercentage / 100;
            emit ReferralReward(msg.sender, promoCodeAsAddress, referralReward);

            return (referralReward, promoCodeAsAddress);
        }

        // If the promo code is not in the existing mappings and is not an address
        return (0, address(0));
        }
    }


    /**
     * @notice Public function to redeem tokens from on whitelist.
     */
    function redeemFromWhitelist() external {

        uint256 startTime = 1703275200; // Fri Dec 22 2023 12:00:00 GMT-0800 (Pacific Standard Time)
        require(block.timestamp >= startTime, "Redemption is not eligible yet");
        require(block.timestamp <= startTime + 30 days, "Redemption period has ended");

        require(whitelistAmounts[msg.sender] > 0, "Invalid whitelist amount");

        uint16 toMint = whitelistAmounts[msg.sender];

        if(toMint > 50){
            toMint = 50;
        }

        require(
            _tokenIds.current() + toMint <= maxSupply,
            "Exceeds maxSupply"
        );

        for (uint16 i = 0; i < toMint; i++) {
           _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(msg.sender, newItemId);
            _mintTimestamps[newItemId] = block.timestamp;
        }

        uint16 newAmount = whitelistAmounts[msg.sender] - toMint;
        whitelistAmounts[msg.sender] = newAmount;
        emit WhitelistAmountRedeemed(msg.sender, newAmount);
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
        // Apply discount if promo code is active otherwise check if promo code is an address
        // If promocode is an address and owns a license, apply discount
        if (_promoCodes[_promoCode].active) {
            totalCost = totalCost * (100 - referralDiscountPercentage) / 100;
        }else{
            // Check if the promo code is an address
            // Returns 0 address if not an address
            address promoCodeAsAddress = validateAndConvertAddress(_promoCode);

            // If the promo code is a valid address, check if it owns a license
            if(promoCodeAsAddress != address(0)){

                // If the address owns a license, apply discount
                if(this.balanceOf(promoCodeAsAddress) > 0){
                    totalCost = totalCost * (100 - referralDiscountPercentage) / 100;
                }   
            }
        }
        return totalCost;
    }

    /**
     * @notice Allows a user to claim their referral reward.
     * @dev The function checks if claiming is enabled and if the caller has a reward to claim.
     * If both conditions are met, the reward is transferred to the caller and their reward balance is reset.
     */
    function claimReferralReward() external reentrancyGuardClaimReferralReward {
        require(claimable, "Claiming of referral rewards is currently disabled");
        uint256 reward = _referralRewards[msg.sender];
        // Pay Xai & esXAI rewards if they exist
        uint256 rewardXai = _referralRewardsXai[msg.sender];
        uint256 rewardEsXai = _referralRewardsEsXai[msg.sender];

        // Require that the user has a reward to claim
        require(reward > 0 || rewardXai > 0 || rewardEsXai > 0, "No referral reward to claim");
        
        // Reset the referral reward balance
        _referralRewards[msg.sender] = 0;
        _referralRewardsXai[msg.sender] = 0;
        _referralRewardsEsXai[msg.sender] = 0;

        // Transfer the rewards to the caller
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed.");

        if(rewardXai > 0){
            IERC20 token = IERC20(xaiAddress);
            token.transfer(msg.sender, rewardXai);
        }
        if(rewardEsXai > 0){
            IERC20 token = IERC20(esXaiAddress);
            token.transfer(msg.sender, rewardEsXai);
        }
        emit RewardClaimed(msg.sender, reward, rewardXai, rewardEsXai); 
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
     * @notice loops the pricing tiers and increases supply while reducing the price of 
     * of each tier by the multiplier provided.
     * @dev This function is used to reduce the pricing tiers and increase the supply of the NodeLicense tokens.
     * @dev This function is only called once.
     * @param keyMultiplier The multiplier to reduce the price of each tier by.
     */

    function updatePricingAndQuantity(uint256 keyMultiplier) internal {
        require(keyMultiplier >= 1, "Multiplier must be greater than 1");
        require(maxSupply == 50000, "Pricing tiers have already been reduced");
        for (uint256 i = 0; i < pricingTiers.length; i++) {
            pricingTiers[i].price = pricingTiers[i].price / keyMultiplier;
            pricingTiers[i].quantity = pricingTiers[i].quantity * keyMultiplier;
        }
        maxSupply = maxSupply * keyMultiplier;
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

    function _updateWhitelistAmounts(address _toWhitelist, uint16 _amount) internal {
        whitelistAmounts[_toWhitelist] = _amount;
        emit WhitelistAmountUpdatedByAdmin(_toWhitelist, _amount);
    }

    /**
     * @notice Admin function so set wallets and their free mint amounts. Set amount to 0 to remove from whitelist.
     * @param _toWhitelist The addresses that can mint the amount for free.
     * @param _amounts The amounts that can be minted for free, if 0 the user is not whitelisted anymore.
     */
    function updateWhitelistAmounts(address[] memory _toWhitelist, uint16[] memory _amounts) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_toWhitelist.length == _amounts.length, "Invalid input");
        for(uint16 i = 0; i < _toWhitelist.length; i++){
            _updateWhitelistAmounts(_toWhitelist[i], _amounts[i]);
        }
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
                        '", "attributes": [{"trait_type": "Owner", "value": "',
                        StringsUpgradeable.toHexString(uint160(ownerAddress)),
                        '"}, {"trait_type": "Legal", "value": "https://xai.games/sentrynodeagreement"}]}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
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

    /** @notice takes in an amount of Ether in wei and returns the equivalent amount in XAI
     * @param _amount The amount of Ether in wei (18 decimals)
     * @return The equivalent amount in XAI with 18 decimals
     */
    function ethToXai(uint256 _amount) public view returns (uint256) {
        int256 ethPrice = ethPriceFeed.latestAnswer(); // price returned in 8 decimals
        int256 xaiPrice = xaiPriceFeed.latestAnswer(); // price returned in 8 decimals
        
        // Convert ethPrice and xaiPrice to uint256 with 18 decimals
        uint256 ethPriceWith18Decimals = uint256(ethPrice) * 10**10;
        uint256 xaiPriceWith18Decimals = uint256(xaiPrice) * 10**10;
        
        // Perform the calculation
        uint256 amountInXai = (_amount * ethPriceWith18Decimals) / xaiPriceWith18Decimals;
        
        return amountInXai;
    }

    /**
     * @notice Takes in a string and converts it to an address if valid, otherwise returns the zero address
     * @param _address The string that is a potential address to validate and convert
     * @return The address if valid, otherwise the zero address
     */
    function validateAndConvertAddress(string memory _address) public pure returns (address) {
        bytes memory addrBytes = bytes(_address);

        // Check if the length is 42 characters
        if (addrBytes.length != 42) {
            return address(0);
        }

        // Check if it starts with '0x'
        if (addrBytes[0] != '0' || addrBytes[1] != 'x') {
            return address(0);
        }

        uint160 addr = 0;

        // Convert and validate each character
        for (uint i = 2; i < 42; i++) {
            uint8 b = uint8(addrBytes[i]);
            if (b >= 48 && b <= 57) {
                // '0' to '9'
                addr = addr * 16 + (b - 48);
            } else if (b >= 97 && b <= 102) {
                // 'a' to 'f'
                addr = addr * 16 + (b - 87);
            } else if (b >= 65 && b <= 70) {
                // 'A' to 'F'
                addr = addr * 16 + (b - 55);
            } else {
                // Invalid character found
                return address(0);
            }
        }

        return address(addr);
    }
}