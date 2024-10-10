// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title Achievements Contract
 * @dev An ERC1155 contract that represents game achievements.
 */
contract Achievements is ERC1155 {

    uint256 public tokenIdCount;

    constructor(uint256 _tokenIdCount, string memory _uri) ERC1155(_uri) {
        setTokenIdCount(_tokenIdCount);
    }

    function setTokenIdCount(uint256 newCount) public {
        require(newCount != 0, "invalid count param");
        require(newCount > tokenIdCount, "can only increase count");

        tokenIdCount = newCount;
    }

    function mint(address to, uint256 id, bytes memory data) public {
        require(to != address(0x0), "invalid to param");
        require(id <= tokenIdCount, "invalid id param");
        require(balanceOf(to, id) == 0, "address has non-zero token balance");

        _mint(to, id, 1, data);
    }

    function mintBatch(address to, uint256[] calldata ids, bytes memory data) public {
        require(to != address(0x0), "invalid to param");
        uint256[] memory amounts = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] <= tokenIdCount, "invalid ids param");
            require(balanceOf(to, ids[i]) == 0, "address has non-zero token balance");
            amounts[i] = 1;
        }

        _mintBatch(to, ids, amounts, data);
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

}
