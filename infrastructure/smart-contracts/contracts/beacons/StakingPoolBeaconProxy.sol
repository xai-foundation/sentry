// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract StakingPoolBeaconProxy is BeaconProxy {

	constructor(address beacon, bytes memory data) BeaconProxy(beacon, data) {}
}
