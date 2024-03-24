// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

// 1 deploy implementation the beacon proxies will use (implementation v1)
// 2 deploy the beacon with the implementation address as the constructor arg
// 3 deploy some number of beacon proxies with the address of the beacon

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
