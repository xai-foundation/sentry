// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";

//TODO: make sure to call _update() so Supply extension works

/**
 * @title Achievements Contract
 * @dev An ERC1155 contract that represents game achievements.
 */
contract Achievements is ERC1155Supply {

    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");
    
    IAccessControl public achievementFactory;
    mapping(uint256 => bool) public definedTokens;
    uint256[] private _tokenIdList;

    constructor(address factoryAddress, string memory _uri) ERC1155(_uri) {
        achievementFactory = IAccessControl(factoryAddress);
    }

    modifier onlyMintRole() {
        require(achievementFactory.hasRole(MINT_ROLE, address(msg.sender)), "caller does not have MINT_ROLE");
        _;
    }

    function mint(address to, uint256 id, bytes memory data) public onlyMintRole {
        require(to != address(0x0), "invalid to param");
        require(balanceOf(to, id) == 0, "address has non-zero token balance");

        if (!definedTokens[id]) {
            _tokenIdList.push(id);
        }

        _mint(to, id, 1, data);
    }

    function mintBatch(address to, uint256[] calldata ids, bytes memory data) public onlyMintRole {
        require(to != address(0x0), "invalid to param");
        uint256[] memory amounts = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            require(balanceOf(to, ids[i]) == 0, "address has non-zero token balance");

            if (!definedTokens[ids[i]]) {
                _tokenIdList.push(ids[i]);
            }

            amounts[i] = 1;
        }

        _mintBatch(to, ids, amounts, data);
    }

    function getDefinedTokens() external view returns (uint256[] memory) {
        return _tokenIdList;
    }

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
    ) internal override {
        require(false, "not transferrable");
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        require(false, "not batch transferrable");
    }

    function _afterTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        if (ids.length > 1) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(balanceOf(to, ids[i]) == 1, "address has non-zero token balance");
            }
        }
    }

}
