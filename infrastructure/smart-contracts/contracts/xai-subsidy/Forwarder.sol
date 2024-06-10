// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Forwarder is Initializable {
	using ECDSA for bytes32;
	bytes32 public DOMAIN_SEPARATOR;
	bytes32 public constant FORWARD_REQUEST_TYPEHASH =
		keccak256("ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)");

	// Mapping to store nonces for each sender
	mapping(address => uint256) public nonces;

	struct ForwardRequest {
		address from; // an externally owned account making the request
		address to; // destination address, in this case the Receiver Contract
		uint256 value; // ETH Amount to transfer to destination
		uint256 gas; // gas limit for execution
		uint256 nonce; // the users nonce for this request
		bytes data; // the data to be sent to the destination
	}

	function initialize() public initializer {
		uint256 chainId;
		assembly {
			chainId := chainid()
		}
		DOMAIN_SEPARATOR = keccak256(
			abi.encode(
				keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
				keccak256(bytes("Forwarder")), // Name of the contract
				keccak256(bytes("1")), // Version
				chainId, // Chain ID
				address(this) // Address of the contract
			)
		);
	}

	function verify(ForwardRequest calldata request, bytes calldata signature) public view returns (bool) {
		bytes32 messageHash = keccak256(
			abi.encodePacked(
				"\x19\x01",
				DOMAIN_SEPARATOR,
				keccak256(
					abi.encode(
						FORWARD_REQUEST_TYPEHASH,
						request.from,
						request.to,
						request.value,
						request.gas,
						nonces[request.from],
						keccak256(request.data)
					)
				)
			)
		);

		(address recovered, ECDSA.RecoverError err) = messageHash.tryRecover(signature);

		if (err == ECDSA.RecoverError.NoError) {
			return recovered == request.from;
		}

		return false;
	}

	function execute(
		ForwardRequest calldata request,
		bytes calldata signature
	) public payable returns (bool, bytes memory) {
		require(msg.value == request.value, "Invalid value");
		require(verify(request, signature), "Invalid signature");

		nonces[request.from]++;

		(bool success, bytes memory returndata) = request.to.call{gas: request.gas, value: request.value}(
			abi.encodePacked(request.data, request.from)
		);

		if (gasleft() <= request.gas / 63) {
			// We explicitly trigger invalid opcode to consume all gas and bubble-up the effects, since
			// neither revert or assert consume all gas since Solidity 0.8.0
			// https://docs.soliditylang.org/en/v0.8.0/control-structures.html#panic-via-assert-and-error-via-require
			assembly {
				invalid()
			}
		}

		require(success, "Functioncall failed");

		return (success, returndata);
	}
}
