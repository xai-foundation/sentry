// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

//TODO: fix upgradeable

/**
 * @title Achievements Contract
 * @dev An ERC1155 contract that represents game achievements.
 */
contract Achievements is Initializable, ERC1155Upgradeable {

    //definitions
    struct Batch {
        address to;
        uint256[] ids;
    }

    //constants
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    //state
    IAccessControl public factoryAddress; //factory proxy to check access control
    mapping(uint256 => bool) public definedTokens; //tokenId => exists
    uint256[] private _tokenIdList; //array of token ids that exist (ordered by mint order)
    uint256 public tokenIdCount; //counter for unique token ids that exist
    uint256 public totalSupply; //counter for total tokens minted on this contract
    mapping(uint256 => uint256) public totalSupplyById; //tokenId => tokenCount

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    /**
     * @dev Achievements initializer.
     * @param _factoryAddress Address of the factory contract that produced this contract.
     * @param _uri URI string pointing to metadata (e.g. https://metadata.xai.games/id.json)
     */
    function initialize(address _factoryAddress, string memory _uri) public initializer {
        __ERC1155_init(_uri);
        factoryAddress = IAccessControl(_factoryAddress);
    }

    /**
     * @dev Restricts caller to MINT_ROLE holder in factory contract.
     */
    modifier onlyMintRole() {
        require(factoryAddress.hasRole(MINT_ROLE, address(msg.sender)), "caller does not have MINT_ROLE");
        _;
    }

    /**
     * @dev Mints a single token to the recipient address. Only callable by MINT_ROLE holder.
     * @param to Address to receive the newly minted token.
     * @param id Token ID of token to mint.
     */
    function mint(address to, uint256 id) public onlyMintRole {
        require(balanceOf(to, id) == 0, "address has non-zero token balance");
        
        if (!definedTokens[id]) {
            definedTokens[id] = true;
            _tokenIdList.push(id);
            tokenIdCount += 1;
        }
        totalSupply += 1;
        totalSupplyById[id] += 1;

        _mint(to, id, 1, "");
    }

    /**
     * @dev Mints a batch of tokens to the recipient address. Only callable by MINT_ROLE holder.
     * @param to Address to receive the newly minted tokens.
     * @param ids Array of token IDs of tokens to mint.
     */
    function mintBatch(address to, uint256[] calldata ids) public onlyMintRole {
        require(ids.length > 0, "invalid ids param length");
        
        uint256[] memory amounts = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            require(balanceOf(to, ids[i]) == 0, "address has non-zero token balance");
            
            if (!definedTokens[ids[i]]) {
                definedTokens[ids[i]] = true;
                _tokenIdList.push(ids[i]);
                tokenIdCount += 1;
            }
            totalSupply += 1;
            totalSupplyById[ids[i]] += 1;
            amounts[i] = 1;
        }

        _mintBatch(to, ids, amounts, "");

        if (ids.length > 1) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(balanceOf(to, ids[i]) == 1, "address has invalid token balance");
            }
        }
    }

    /**
     * @dev Mint multiple batches of tokens.
     * @param batches Array of Batch structs to mint.
     */
    function mintBatches(Batch[] calldata batches) public onlyMintRole {
        require(batches.length > 0, "invalid array length");
        
        for (uint256 i = 0; i < batches.length; i++) {
            mintBatch(batches[i].to, batches[i].ids);
        }
    }

    /**
     * @dev Gets an array of all defined token ids for this contract.
     */
    function getDefinedTokens() external view returns (uint256[] memory) {
        return _tokenIdList;
    }

    /**
     * @dev Gets a paginated array of defined token ids for this contract.
     * @param pageStart Index for page start.
     * @param pageEnd Index for page end.
     */
    function getDefinedTokens(uint256 pageStart, uint256 pageEnd) external view returns (uint256[] memory) {
        require(pageStart < pageEnd, "invalid page bounds");

        uint256 pageSize = pageEnd - pageStart;
        uint256[] memory tokenIdPage = new uint256[](pageSize);
        
        uint256 cursor = pageStart;
        for (uint256 i = 0; i < pageSize; i++) {
            tokenIdPage[i] = _tokenIdList[cursor];
            cursor++;
        }
        
        return tokenIdPage;
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal pure override {
        require(false, "not transferrable");
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal pure override {
        require(false, "not batch transferrable");
    }

}
