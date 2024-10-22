// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract AchievementsBeacon is Ownable {
	UpgradeableBeacon immutable beacon;

	constructor(address _implementation) {
		beacon = new UpgradeableBeacon(_implementation);
	}

	function update(address _implementation) public onlyOwner {
		beacon.upgradeTo(_implementation);
	}

	function implementation() public view returns (address) {
		return beacon.implementation();
	}
}
