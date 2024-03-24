// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StakingPoolImplementationV2 is Initializable {

	string public name;
	uint256 public keys;

	function initialize(string memory _name, uint256 _keys) external initializer {
		name = _name;
		keys = _keys;
	}

	function stakeKeys(uint256 _keys) external {
		keys += _keys;
	}

	function unstakeKeys(uint256 _keys) external {
		require(keys >= _keys, "Can't un-stake more keys than the balance");
		keys -= _keys;
	}
}
