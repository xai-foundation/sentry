// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

contract ForwarderTestReceiver is Context {
    mapping(address => uint256) public counters;
    address public lastCaller;
    address private trustedForwarder;

    constructor(address _trustedForwarder) {
        trustedForwarder = _trustedForwarder;
    }

    /**
     * @dev Override for `msg.sender`. Defaults to the original `msg.sender` whenever
     * a call is not performed by the trusted forwarder or the calldata length is less than
     * 20 bytes (an address length).
     */
    function _msgSender() internal view virtual override returns (address) {
        uint256 calldataLength = msg.data.length;
        if (isTrustedForwarder(msg.sender) && calldataLength >= 20) {
            return address(bytes20(msg.data[calldataLength - 20:]));
        } else {
            return super._msgSender();
        }
    }

    /**
     * @dev Override for `msg.data`. Defaults to the original `msg.data` whenever
     * a call is not performed by the trusted forwarder or the calldata length is less than
     * 20 bytes (an address length).
     */
    function _msgData()
        internal
        view
        virtual
        override
        returns (bytes calldata)
    {
        uint256 calldataLength = msg.data.length;
        if (isTrustedForwarder(msg.sender) && calldataLength >= 20) {
            return msg.data[:calldataLength - 20];
        } else {
            return super._msgData();
        }
    }

    /**
     * @dev Indicates whether any particular address is the trusted forwarder.
     */
    function isTrustedForwarder(
        address forwarder
    ) public view virtual returns (bool) {
        return forwarder == trustedForwarder;
    }

    function increaseCounter() external {
        counters[_msgSender()]++;
    }
}
