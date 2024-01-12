// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract CounterContract is AccessControlUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant COUNTER_ROLE = keccak256("COUNTER_ROLE");
    CountersUpgradeable.Counter private _count;

    function initialize() public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(COUNTER_ROLE, _msgSender());
    }

    function incrementCount() public {
        require(hasRole(COUNTER_ROLE, _msgSender()), "CounterContract: must have counter role to increment");
        _count.increment();
    }

    function getCount() public view returns (uint256) {
        return _count.current();
    }
}

contract CounterContract2 is AccessControlUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant COUNTER_ROLE = keccak256("COUNTER_ROLE");
    CountersUpgradeable.Counter private _count;

    function decrementCount() public {
        require(hasRole(COUNTER_ROLE, _msgSender()), "CounterContract: must have counter role to decrement");
        _count.decrement();
    }

    function getCount() public view returns (uint256) {
        return _count.current();
    }
}
