pragma solidity ^0.8.0;

import "../Xai.sol";
import "../Referee.sol";
import "../NodeLicense.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract XaiRedEnvelope is AccessControlUpgradeable {
	bytes32 public DOMAIN_SEPARATOR;
	bytes32 public PERMIT_TYPEHASH;

	// This is the public key of the admin wallet that presigned the permits locally
	address public permitAdmin;

	// The chain id only for testing purpose, this does not need to be stored inside the production contract's state
	uint256 public chainId;

	// The ERC20 token that will get deposited to the contract and get claimed buy the permitted users
	address public xai;

	address public allowanceAddress;

	// Mapping for a nonce so a permit cannot be used twice
	mapping(address => uint256) public userPermitNonce;

	uint256 public submissionStartTime;
	uint256 public submissionEndTime;

	uint256 public claimStartTime;
	uint256 public claimEndTime;

	address public nodeLicense;
	address public referee;

	// Mapping users to how much xai they can claim
	mapping(address => uint256) public claimAllowances;

	// Mapping of users to X (Formerly Twitter) posts for us to verify
	mapping(address => string) public userXPostVerifications;
	// List of users who have submitted claim requests
	address[] public usersSubmitted;

	event Claim(address indexed user, uint256 amount);
	event ClaimPeriodChanged(uint256 newStartTime, uint256 newEndTime);
	event SubmissionPeriodChanged(uint256 newStartTime, uint256 newEndTime);
	event AllowanceAddressChanged(address newAllowanceAddress);

	function initialize(
		address _permitAdmin,
		address _xai,
		address _allowanceAddress,
		uint256 _submissionStartTime,
		uint256 _submissionEndTime,
		uint256 _claimStartTime,
		uint256 _claimEndTime,
		address _nodeLicense,
		address _referee
	) public initializer {
		require(permitAdmin == address(0), "Already init");

		__AccessControl_init();
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

		submissionStartTime = _submissionStartTime;
		submissionEndTime = _submissionEndTime;

		claimStartTime = _claimStartTime;
		claimEndTime = _claimEndTime;

		uint256 _chainId;
		assembly {
			_chainId := chainid()
		}
		chainId = _chainId;
		DOMAIN_SEPARATOR = keccak256(
			abi.encode(
				keccak256(
					"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
				),
				keccak256(bytes("XaiRedEnvelope")),
				keccak256(bytes("1")),
				chainId,
				address(this)
			)
		);

		PERMIT_TYPEHASH = 0x0044081b6da9e287e5c8a3f201f2e6a321611ede3cd743a660e2114cf277812c; //keccak256("Permit(address user,uint256 amount,uint256 nonce)")
		permitAdmin = _permitAdmin;
		xai = _xai;
		allowanceAddress = _allowanceAddress;
		nodeLicense = _nodeLicense;
		referee = _referee;
	}

	function setSubmissionPeriod(uint256 _startTime, uint256 _endTime) external onlyRole(DEFAULT_ADMIN_ROLE) {
		require(_startTime < _endTime, "Start time must be before end time");
		submissionStartTime = _startTime;
		submissionEndTime = _endTime;
		emit SubmissionPeriodChanged(_startTime, _endTime);
	}

	function setClaimPeriod(uint256 _startTime, uint256 _endTime) external onlyRole(DEFAULT_ADMIN_ROLE) {
		require(_startTime < _endTime, "Start time must be before end time");
		claimStartTime = _startTime;
		claimEndTime = _endTime;
		emit ClaimPeriodChanged(_startTime, _endTime);
	}

	/**
	 * @notice This function allows changing the allowanceAddress.
     * @param _allowanceAddress The new allowance address.
     * @dev Only an admin can call this function.
     */
	function setAllowanceAddress(address _allowanceAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
		allowanceAddress = _allowanceAddress;
		emit AllowanceAddressChanged(_allowanceAddress);
	}

	/**
     * @notice This function validates the claim amount for a user.
     * @param claimAmount The amount of the claim.
     * @param user The address of the user.
     * @param v Part of the signature.
     * @param r Part of the signature.
     * @param s Part of the signature.
     * @return The address recovered from the signature.
     */
	function validateClaimAmount(
		uint256 claimAmount,
		address user,
		uint8 v,
		bytes32 r,
		bytes32 s
	) public view returns (address) {
		bytes32 digest = keccak256(
			abi.encodePacked(
				"\x19\x01",
				DOMAIN_SEPARATOR,
				keccak256(
					abi.encode(
						PERMIT_TYPEHASH,
						user,
						claimAmount,
						userPermitNonce[user]
					)
				)
			)
		);

		address recoveredAddress = ecrecover(digest, v, r, s);
		return recoveredAddress;
	}

	/**
	 * @notice This function allows a user to claim their rewards.
     * @param claimAmount The amount of the claim.
     * @param v Part of the signature.
     * @param r Part of the signature.
     * @param s Part of the signature.
     * @dev The function first validates the signature and checks the allowance for the user.
     * If the allowance is sufficient, it transfers the claim amount from the allowance address to the user.
     * It then increments the user's permit nonce and emits a Claim event.
     */
	function claimRewards(
		uint256 claimAmount,
		uint8 v,
		bytes32 r,
		bytes32 s
	) external {
		require(block.timestamp >= claimStartTime && block.timestamp <= claimEndTime, "Claim period is not active");

		// Check if the user owns a NodeLicense
		NodeLicense _nodeLicense = NodeLicense(nodeLicense);
		uint256 balance = _nodeLicense.balanceOf(msg.sender);
		require(balance > 0, "User does not have a NodeLicense");
		Referee _referee = Referee(referee);
		require(_referee.isKycApproved(msg.sender), "User is not KYC'd");

		bytes32 digest = keccak256(
			abi.encodePacked(
				"\x19\x01",
				DOMAIN_SEPARATOR,
				keccak256(
					abi.encode(
						PERMIT_TYPEHASH,
						msg.sender,
						claimAmount,
						userPermitNonce[msg.sender]
					)
				)
			)
		);

		userPermitNonce[msg.sender]++;

		address recoveredAddress = ecrecover(digest, v, r, s);
		require(recoveredAddress == permitAdmin, "Invalid auth");

		uint256 allowance = Xai(xai).allowance(allowanceAddress, address(this));
		require(allowance >= claimAmount, "Insufficient allowance");

		bool success = Xai(xai).transferFrom(allowanceAddress, msg.sender, claimAmount);
		require(success, "Transfer failed");

		emit Claim(msg.sender, claimAmount);
	}

	function submitClaimRequest(string memory xPost) public {
		require(block.timestamp >= submissionStartTime && block.timestamp <= submissionEndTime, "Submission period is not active");

		// Prevent user submitting again
		require(keccak256(abi.encodePacked(xPost)) != keccak256(abi.encodePacked("")), "You have already submitted a tweet.");
		require(keccak256(abi.encodePacked(userXPostVerifications[msg.sender])) == keccak256(abi.encodePacked("")), "You have already submitted a tweet.");

		userXPostVerifications[msg.sender] = xPost;
		usersSubmitted.push(msg.sender);
	}
}
