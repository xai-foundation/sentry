// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/extensions/ERC20Votes.sol)

pragma solidity ^0.8.20;

import {VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/utils/VotesUpgradeable.sol";
import {Checkpoints} from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPoolFactory {
    function getTotalesXaiStakedByUser(
        address user
    ) external view returns (uint256);
}

contract XaiVoting2 is Initializable, VotesUpgradeable {
    address public xaiAddress;
    address public esXaiAddress;
    address public poolFactoryAddress;
    mapping(address => uint256) public weights;

    /**
     * @dev Total supply cap has been exceeded, introducing a risk of votes overflowing.
     */
    error ERC20ExceededSafeSupply(uint256 increasedSupply, uint256 cap);

    modifier onlyAdmin() {
        require(
            msg.sender == poolFactoryAddress ||
                msg.sender == xaiAddress ||
                msg.sender == esXaiAddress,
            "Invalid Auth"
        );
        _;
    }

    function initialize(
        address _xaiAddress,
        address _esXaiAddress,
        address _poolFactoryAddress
    ) external initializer {
        __EIP712_init("XaiVoting", "1");
        xaiAddress = _xaiAddress;
        esXaiAddress = _esXaiAddress;
        poolFactoryAddress = _poolFactoryAddress;

        weights[xaiAddress] = 100;
        weights[esXaiAddress] = 100;
        weights[poolFactoryAddress] = 100;
    }

    /**
     * @dev Move voting power when tokens are transferred.
     *
     * Emits a {IVotes-DelegateVotesChanged} event.
     */
    function onUpdateBalance(
        address from,
        address to,
        uint256 value
    ) external onlyAdmin {
        _transferVotingUnits(from, to, value);
    }

    /**
     * @dev Returns the voting units of an `account`.
     *
     * WARNING: Overriding this function may compromise the internal vote accounting.
     * `ERC20Votes` assumes tokens map to voting units 1:1 and this is not easy to change.
     */
    function _getVotingUnits(
        address account
    ) internal view virtual override returns (uint256 votingUnits) {
        votingUnits += IERC20(xaiAddress).balanceOf(account);
        votingUnits += IERC20(esXaiAddress).balanceOf(account);
        votingUnits += IPoolFactory(poolFactoryAddress)
            .getTotalesXaiStakedByUser(account);
    }

    /**
     * @dev Get number of checkpoints for `account`.
     */
    function numCheckpoints(
        address account
    ) public view virtual returns (uint32) {
        return _numCheckpoints(account);
    }

    /**
     * @dev Get the `pos`-th checkpoint for `account`.
     */
    function checkpoints(
        address account,
        uint32 pos
    ) public view virtual returns (Checkpoints.Checkpoint208 memory) {
        return _checkpoints(account, pos);
    }

    // ERC-20 compliance
    function name() external pure returns (string memory) {
        return "XaiVoting";
    }

    function symbol() external pure returns (string memory) {
        return "VXAI";
    }

    function totalSupply() external view returns (uint256) {
        return
            IERC20(xaiAddress).totalSupply() +
            IERC20(esXaiAddress).totalSupply();
    }

    function balanceOf(
        address account
    ) external view returns (uint256 votingUnits) {
        return _getVotingUnits(account);
    }

    function allowance(
        address owner,
        address spender
    ) external pure returns (uint256) {
        // Cannot approve allowance on virtual voting balance
        return 0;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        revert("Cannot approve virtual voting balance");
    }
    
    function transfer(address to, uint256 value) external returns (bool) {
        revert("Cannot transfer virtual voting balance");
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool) {
        revert("Cannot transferFrom virtual voting balance");
    }
}
