// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockRollup {
    // Variables to track the latest node created and the latest confirmed node
    uint64 public latestNodeCreated; // Tracks the most recently created node number
    uint64 public latestConfirmed;   // Tracks the most recently confirmed node number

    struct Node {
        bytes32 stateHash;                 // Hash representing the state of the chain at this node
        bytes32 challengeHash;             // Hash of data that can be challenged
        bytes32 confirmData;               // Hash of data that will be confirmed when this node is confirmed
        uint64 prevNum;                    // Index of the node preceding this one
        uint64 deadlineBlock;              // Block number after which this node can be confirmed
        uint64 noChildConfirmedBeforeBlock;// Block number before which a child node cannot be confirmed
        uint64 stakerCount;                // Number of stakers (including zombies) on this node
        uint64 childStakerCount;           // Number of stakers (including zombies) on a child node
        uint64 firstChildBlock;            // Block number of the first child of this node
        uint64 latestChildNumber;          // Number of the most recent child created from this node
        uint64 createdAtBlock;             // Block number when this node was created
        bytes32 nodeHash;                  // Hash summarizing all critical data to ensure node validity, protect against reorgs
    }

    // Mapping from node number to Node struct to store all created nodes
    mapping(uint64 => Node) private _nodes;

    struct GlobalState {
        bytes32 bytes32Vals;               // Example field for global state; adjust as needed for real use cases
        uint64[2] u64Vals;                 // Example array for storing two 64-bit unsigned integer values
    }

    struct Assertion {
        GlobalState beforeState;           // Represents the global state before a transition
        GlobalState afterState;            // Represents the global state after a transition
        uint64 numBlocks;                  // Number of blocks involved in this assertion
    }

    // Events to log node creation and confirmation actions
    event NodeCreated(
        uint64 indexed nodeNum,
        bytes32 indexed parentNodeHash,
        bytes32 indexed nodeHash,
        bytes32 executionHash,
        Assertion assertion,
        bytes32 afterInboxBatchAcc,
        bytes32 wasmModuleRoot,
        uint256 inboxMaxCount
    );

    event NodeConfirmed(uint64 indexed nodeNum, bytes32 blockHash, bytes32 sendRoot);

    /**
     * @notice Creates a new node with provided block hash and send root.
     * @param blockHash The hash of the block to associate with this node.
     * @param sendRoot The root hash of the send data to associate with this node.
     */
    function createNode(
        bytes32 blockHash,
        bytes32 sendRoot
    ) external {
        // Input validation to ensure non-zero values are provided
        require(blockHash != bytes32(0), "Block hash cannot be zero");
        require(sendRoot != bytes32(0), "Send root cannot be zero");

        // Generating various hashes based on the current block information and sender address
        // These are typically derived from real blockchain data for validation, but here it's simulated for example purposes
        bytes32 parentNodeHash = keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, msg.sender));
        bytes32 nodeHash = keccak256(abi.encodePacked(blockhash(block.number - 2), block.timestamp, msg.sender));
        bytes32 executionHash = keccak256(abi.encodePacked(blockhash(block.number - 3), block.timestamp, msg.sender));
        bytes32 afterInboxBatchAcc = keccak256(abi.encodePacked(blockhash(block.number - 4), block.timestamp, msg.sender));
        bytes32 wasmModuleRoot = keccak256(abi.encodePacked(blockhash(block.number - 5), block.timestamp, msg.sender));
        
        // Compute the confirmData hash using the provided blockHash and sendRoot
        // This hash represents the data to be confirmed and is stored for future verification
        bytes32 confirmData = keccak256(abi.encodePacked(blockHash, sendRoot));
        
        // Initialize an assertion structure with dummy data (replace with actual logic as needed)
        Assertion memory assertion = Assertion(
            GlobalState({bytes32Vals: bytes32(0), u64Vals: [uint64(0), uint64(0)]}),
            GlobalState({bytes32Vals: bytes32(0), u64Vals: [uint64(0), uint64(0)]}),
            uint64(0)
        );

        // Increment the latest node counter to track node creation
        latestNodeCreated++;

        // Store the newly created node in the mapping with all its attributes
        _nodes[latestNodeCreated] = Node({
            stateHash: bytes32(0),             // Placeholder: In practice, this should represent the state of the node
            challengeHash: bytes32(0),         // Placeholder: Represents data that can be challenged
            confirmData: confirmData,          // Store the computed confirmData hash for validation during confirmation
            prevNum: latestNodeCreated - 1,    // Set previous node index to the latest node created before this one
            deadlineBlock: 0,                  // Placeholder: Not used here
            noChildConfirmedBeforeBlock: 0,    // Placeholder: Not used here
            stakerCount: 0,                    // Placeholder: Not used here
            childStakerCount: 0,               // Placeholder: Not used here
            firstChildBlock: 0,                // Placeholder: Not used here
            latestChildNumber: 0,              // Placeholder: Not used here
            createdAtBlock: uint64(block.number),      // Record the block number at creation time for reference
            nodeHash: nodeHash                 // Placeholder: Not used here
        });

        // Emit an event to notify that a new node has been created with all relevant details
        emit NodeCreated(
            latestNodeCreated,
            parentNodeHash,
            nodeHash,
            executionHash,
            assertion,
            afterInboxBatchAcc,
            wasmModuleRoot,
            0
        );
    }

    /**
     * @notice Confirms a node by its number, validating against provided block hash and send root.
     * @param nodeNum The number of the node to confirm.
     * @param blockHash The hash of the block to validate against the stored confirm data.
     * @param sendRoot The root hash of the send data to validate against the stored confirm data.
     */
    function confirmNode(uint64 nodeNum, bytes32 blockHash, bytes32 sendRoot) external {
        // Check that the node number is within the valid range of created nodes
        require(nodeNum <= latestNodeCreated, "Invalid node number");
        Node storage node = _nodes[nodeNum]; // Fetch the node data from storage

        // Validate that the provided blockHash and sendRoot match the stored confirmData hash
        // This ensures the node is confirmed only if the hashes match, protecting against tampering
        require(node.confirmData == keccak256(abi.encodePacked(blockHash, sendRoot)), "CONFIRM_DATA");

        // Update the latest confirmed node number after successful validation
        latestConfirmed = nodeNum;

        // Emit an event to log the confirmation action with relevant details
        emit NodeConfirmed(nodeNum, blockHash, sendRoot);
    }

    /**
     * @notice Get the Node struct data for a given node number.
     * @param nodeNum The number of the node to retrieve.
     * @return A Node struct containing all stored information about the node.
     */
    function getNode(uint64 nodeNum) public view returns (Node memory) {
        return _nodes[nodeNum]; // Return the Node struct from storage for the given node number
    }
}
