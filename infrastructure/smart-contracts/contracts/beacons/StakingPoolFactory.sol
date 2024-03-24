// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./StakingPoolBeacon.sol";
import "./StakingPoolImplementationV1.sol";
import "hardhat/console.sol";

contract StakingPoolFactory {
	address[] public pools;
	StakingPoolBeacon immutable public beacon;

	constructor(address _implementation) {
		beacon = new StakingPoolBeacon(_implementation);
	}

//	function createPool(string memory _name, uint256 _keys) public {
//		BeaconProxy pool = new BeaconProxy(
//			address(beacon),
//			abi.encodeWithSelector(StakingPoolImplementationV1(address(0)).initialize.selector, _name, _keys)
//		);
//		pools.push(address(pool));
//	}

	function createPool(bytes memory data) public {
		console.log("createPool");
		console.logBytes(data);

		BeaconProxy pool = new BeaconProxy(
			address(beacon),
			data
		);
		pools.push(address(pool));
	}

	function getTotalPools() public view returns (uint256) {
		return pools.length;
	}

	function getImplementation() public view returns (address) {
		return beacon.implementation();
	}
}
