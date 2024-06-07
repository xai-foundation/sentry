// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

abstract contract Context {
	function _msgSender() internal view virtual returns (address) {
		return _msgSender();
	}

	function _msgData() internal view virtual returns (bytes calldata) {
		return msg.data;
	}
}

interface IERC20 {
	function totalSupply() external view returns (uint256);

	function balanceOf(address account) external view returns (uint256);

	function transfer(address recipient, uint256 amount) external returns (bool);

	function allowance(address owner, address spender) external view returns (uint256);

	function approve(address spender, uint256 amount) external returns (bool);

	function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ForwarderTestToken is IERC20, Context {
	address private immutable _trustedForwarder;

	uint256 public totalSupply;
	string public name = "ForwarderTestToken";
	string public symbol = "FWT";
	uint8 public decimals = 18;

	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);

	constructor(address forwarder) {
		_trustedForwarder = forwarder;
	}

	function transfer(address recipient, uint256 amount) external returns (bool) {
		balanceOf[_msgSender()] -= amount;
		balanceOf[recipient] += amount;
		emit Transfer(_msgSender(), recipient, amount);
		return true;
	}

	function approve(address spender, uint256 amount) external returns (bool) {
		allowance[_msgSender()][spender] = amount;
		emit Approval(_msgSender(), spender, amount);
		return true;
	}

	function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
		allowance[sender][_msgSender()] -= amount;
		balanceOf[sender] -= amount;
		balanceOf[recipient] += amount;
		emit Transfer(sender, recipient, amount);
		return true;
	}

	function _mint(address to, uint256 amount) internal {
		balanceOf[to] += amount;
		totalSupply += amount;
		emit Transfer(address(0), to, amount);
	}

	function _burn(address from, uint256 amount) internal {
		balanceOf[from] -= amount;
		totalSupply -= amount;
		emit Transfer(from, address(0), amount);
	}

	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}

	function burn(address from, uint256 amount) external {
		_burn(from, amount);
	}

	/**
	 * @dev Returns the address of the trusted forwarder.
	 */
	function trustedForwarder() public view virtual returns (address) {
		return _trustedForwarder;
	}

	/**
	 * @dev Indicates whether any particular address is the trusted forwarder.
	 */
	function isTrustedForwarder(address forwarder) public view virtual returns (bool) {
		return forwarder == trustedForwarder();
	}

	/**
	 * @dev Override for `_msgSender()`. Defaults to the original `_msgSender()` whenever
	 * a call is not performed by the trusted forwarder or the calldata length is less than
	 * 20 bytes (an address length).
	 */
	function _msgSender() internal view override returns (address signer) {
		signer = msg.sender;
		if (msg.data.length >= 20 && isTrustedForwarder(signer)) {
			assembly {
				signer := shr(96, calldataload(sub(calldatasize(), 20)))
			}
		}
	}

	/**
	 * @dev Override for `msg.data`. Defaults to the original `msg.data` whenever
	 * a call is not performed by the trusted forwarder or the calldata length is less than
	 * 20 bytes (an address length).
	 */
	function _msgData() internal view virtual override returns (bytes calldata) {
		uint256 calldataLength = msg.data.length;
		if (isTrustedForwarder(msg.sender) && calldataLength >= 20) {
			return msg.data[:calldataLength - 20];
		} else {
			return super._msgData();
		}
	}
}
