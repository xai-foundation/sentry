// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract StakingPoolBeacon is Ownable {
	UpgradeableBeacon immutable beacon;

	constructor(address _implementation) {
		beacon = new UpgradeableBeacon(_implementation);
		transferOwnership(tx.origin);
	}

	function update(address _implementation) public onlyOwner {
		beacon.upgradeTo(_implementation);
	}

	function implementation() public view returns (address) {
		return beacon.implementation();
	}
}
