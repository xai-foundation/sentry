// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ForwarderTestToken.sol";

interface IERC165 {
	function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IERC721 is IERC165 {
	function balanceOf(address owner) external view returns (uint256 balance);

	function ownerOf(uint256 tokenId) external view returns (address owner);

	function safeTransferFrom(address from, address to, uint256 tokenId) external;

	function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

	function transferFrom(address from, address to, uint256 tokenId) external;

	function approve(address to, uint256 tokenId) external;

	function getApproved(uint256 tokenId) external view returns (address operator);

	function setApprovalForAll(address operator, bool _approved) external;

	function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Receiver {
	function onERC721Received(
		address operator,
		address from,
		uint256 tokenId,
		bytes calldata data
	) external returns (bytes4);
}

contract ForwarderTestNFT is Context {
	address private immutable _trustedForwarder;

	uint256 public totalSupply;
	uint256 public tokenIds;
	string public name = "ForwarderTestNFT";
	string public symbol = "FWT-N";
	uint8 public decimals = 0;
	uint256 public mintPrice = 10 * 10 ** 18;
	address public paymentToken;
	address public beneficiary;

	// Mapping from token ID to owner address
	mapping(uint256 => address) internal _ownerOf;

	// Mapping owner address to token count
	mapping(address => uint256) internal _balanceOf;

	// Mapping from token ID to approved address
	mapping(uint256 => address) internal _approvals;

	// Mapping from owner to operator approvals
	mapping(address => mapping(address => bool)) public isApprovedForAll;

	event Transfer(address indexed from, address indexed to, uint256 indexed id);
	event Approval(address indexed owner, address indexed spender, uint256 indexed id);
	event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

	constructor(address _forwarder, address _paymentToken) {
		_trustedForwarder = _forwarder;
		paymentToken = _paymentToken;
		beneficiary = msg.sender;
	}

	function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
		return interfaceId == type(IERC721).interfaceId || interfaceId == type(IERC165).interfaceId;
	}

	function ownerOf(uint256 id) external view returns (address owner) {
		owner = _ownerOf[id];
		require(owner != address(0), "token doesn't exist");
	}

	function balanceOf(address owner) external view returns (uint256) {
		require(owner != address(0), "owner = zero address");
		return _balanceOf[owner];
	}

	function setApprovalForAll(address operator, bool approved) external {
		isApprovedForAll[msg.sender][operator] = approved;
		emit ApprovalForAll(msg.sender, operator, approved);
	}

	function approve(address spender, uint256 id) external {
		address owner = _ownerOf[id];
		require(msg.sender == owner || isApprovedForAll[owner][msg.sender], "not authorized");

		_approvals[id] = spender;

		emit Approval(owner, spender, id);
	}

	function getApproved(uint256 id) external view returns (address) {
		require(_ownerOf[id] != address(0), "token doesn't exist");
		return _approvals[id];
	}

	function _isApprovedOrOwner(address owner, address spender, uint256 id) internal view returns (bool) {
		return (spender == owner || isApprovedForAll[owner][spender] || spender == _approvals[id]);
	}

	function transferFrom(address from, address to, uint256 id) public {
		require(from == _ownerOf[id], "from != owner");
		require(to != address(0), "transfer to zero address");

		require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");

		_balanceOf[from]--;
		_balanceOf[to]++;
		_ownerOf[id] = to;

		delete _approvals[id];

		emit Transfer(from, to, id);
	}

	function safeTransferFrom(address from, address to, uint256 id) external {
		transferFrom(from, to, id);

		require(
			to.code.length == 0 ||
				IERC721Receiver(to).onERC721Received(msg.sender, from, id, "") ==
				IERC721Receiver.onERC721Received.selector,
			"unsafe recipient"
		);
	}

	function safeTransferFrom(address from, address to, uint256 id, bytes calldata data) external {
		transferFrom(from, to, id);

		require(
			to.code.length == 0 ||
				IERC721Receiver(to).onERC721Received(msg.sender, from, id, data) ==
				IERC721Receiver.onERC721Received.selector,
			"unsafe recipient"
		);
	}

	function _mint(address to) internal {
		tokenIds++;
		totalSupply++;

		_balanceOf[to]++;
		_ownerOf[tokenIds] = to;

		emit Transfer(address(0), to, tokenIds);
	}

	function _burn(uint256 id) internal {
		address owner = _ownerOf[id];
		require(owner == _msgSender(), "invalid owner");

		_balanceOf[owner] -= 1;

		delete _ownerOf[id];
		delete _approvals[id];

		totalSupply--;

		emit Transfer(owner, address(0), id);
	}

	function mint(address to, uint256 amount) external {
		require(to != address(0), "mint to zero address");

		IERC20(paymentToken).transferFrom(_msgSender(), beneficiary, mintPrice * amount);

		for (uint256 i = 0; i < amount; i++) {
			_mint(to);
		}
	}

	function burn(uint256 id) external {
		_burn(id);
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
		return forwarder == _trustedForwarder;
	}

	/**
	 * @dev Override for `msg.sender`. Defaults to the original `msg.sender` whenever
	 * a call is not performed by the trusted forwarder or the calldata length is less than
	 * 20 bytes (an address length).
	 */
	function _msgSender() internal view virtual override returns (address) {
		uint256 calldataLength = msg.data.length;
		uint256 contextSuffixLength = _contextSuffixLength();
		if (isTrustedForwarder(msg.sender) && calldataLength >= contextSuffixLength) {
			return address(bytes20(msg.data[calldataLength - contextSuffixLength:]));
		} else {
			return super._msgSender();
		}
	}

	/**
	 * @dev Override for `msg.data`. Defaults to the original `msg.data` whenever
	 * a call is not performed by the trusted forwarder or the calldata length is less than
	 * 20 bytes (an address length).
	 */
	function _msgData() internal view virtual override returns (bytes calldata) {
		uint256 calldataLength = msg.data.length;
		uint256 contextSuffixLength = _contextSuffixLength();
		if (isTrustedForwarder(msg.sender) && calldataLength >= contextSuffixLength) {
			return msg.data[:calldataLength - contextSuffixLength];
		} else {
			return super._msgData();
		}
	}
}
