// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../../esXai.sol";
import "../../utils/IXaiVoting.sol";

/**
 * @title Xai
 * @dev Implementation of the Xai
 */
contract Xai2 is ERC20Upgradeable, ERC20BurnableUpgradeable, AccessControlUpgradeable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public constant MAX_SUPPLY = 2500000000 * 10**18; // Max supply of 2,500,000,000 tokens
    address public esXaiAddress;
    address public xaiVotingAddress;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[499] private __gap;

    event EsXaiAddressSet(address indexed newEsXaiAddress);
    event ConvertedToEsXai(address indexed user, uint256 amount);
    event OnTransferUpdateError(address indexed from, address indexed to, uint256 amount, string reason);

    function initialize(address _xaiVotingAddress) public reinitializer(2) {
        xaiVotingAddress = _xaiVotingAddress;
    }

    /**
     * @dev Function to set esXai address
     * @param newEsXaiAddress The new esXai address.
     */
    function setEsXaiAddress(address newEsXaiAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        esXaiAddress = newEsXaiAddress;
        emit EsXaiAddressSet(newEsXaiAddress);
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) returns (bool) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Cannot mint beyond max supply"); // not needed for testnet
        _mint(to, amount);
        return true;
    }

    /**
     * @dev Function to convert Xai to esXai
     * @param amount The amount of Xai to convert.
     */
    function convertToEsXai(uint256 amount) public {
        require(esXaiAddress != address(0), "esXai contract address not set");
        _burn(msg.sender, amount);
        esXai(esXaiAddress).mint(msg.sender, amount);
        emit ConvertedToEsXai(msg.sender, amount);
    }
    
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        try IXaiVoting(xaiVotingAddress).onUpdateBalance(from, to, amount) {
        } catch Error(string memory reason) {
            emit OnTransferUpdateError(from, to, amount, reason);
        } catch {
            emit OnTransferUpdateError(from, to, amount, "Unknown error in onUpdateBalance");
        }

        super._afterTokenTransfer(from, to, amount);
    }
}
