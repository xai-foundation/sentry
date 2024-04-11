// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StakingPoolImplementationV1 is Initializable {

	string public name;
	uint256 public keys;

	uint256[500] private __gap;

	function initialize(string memory _name, uint256 _keys) external initializer {
		name = _name;
		keys = _keys;
	}

	function stakeKeys(uint256 _keys) external {
		keys += _keys;
	}
}
