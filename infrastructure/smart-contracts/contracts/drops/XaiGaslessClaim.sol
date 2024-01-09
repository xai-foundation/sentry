pragma solidity ^0.8.0;

import "../Xai.sol";
import "../Referee.sol";
import "../NodeLicense.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract XaiGaslessClaim is AccessControlUpgradeable {
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

    uint256 public startTime;
    uint256 public endTime;

    address public nodeLicense;
    address public referee;

    event Claim(address indexed user, uint256 amount);
    event ClaimPeriodChanged(uint256 newStartTime, uint256 newEndTime);
    event AllowanceAddressChanged(address newAllowanceAddress);

    function initialize(
        address _permitAdmin,
        address _xai,
        address _allowanceAddress,
        uint256 _startTime,
        uint256 _endTime,
        address _nodeLicense,
        address _referee
    ) public initializer {
        require(permitAdmin == address(0), "Already init");

        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        startTime = _startTime;
        endTime = _endTime;

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
                keccak256(bytes("XaiGaslessClaim")),
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

    function setClaimPeriod(uint256 _startTime, uint256 _endTime) external onlyRole(DEFAULT_ADMIN_ROLE) {
        startTime = _startTime;
        endTime = _endTime;
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
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Claim period is not active");

        // Check if the user owns a NodeLicense
        NodeLicense _nodeLicense = NodeLicense(nodeLicense);
        if (_nodeLicense.balanceOf(msg.sender) > 0) {
            Referee _referee = Referee(referee);
            // Check if the user is KYC'd
            require(_referee.isKycApproved(msg.sender), "User is not KYC'd");
        }

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
}
