import { ethers } from "ethers";
import { RollupAdminLogicAbi } from "../abis/index.js";
import { config } from "../config.js";
import { getProvider } from "./index.js";

/**
 * Node structure returned by the getNodeStorage function.
 * https://github.com/OffchainLabs/nitro-contracts/blob/a1cdec7bce168759a1f21c75831e5b0e4c981833/src/rollup/Node.sol#L21-L46
 */
export interface AssertionNode {
    // Hash of the state of the chain as of this node
    stateHash: string;
    // Hash of the data that can be challenged
    challengeHash: string;
    // Hash of the data that will be committed if this node is confirmed
    confirmData: string;
    // Index of the node previous to this one
    prevNum: BigInt;
    // Deadline at which this node can be confirmed
    deadlineBlock: BigInt;
    // Deadline at which a child of this node can be confirmed
    noChildConfirmedBeforeBlock: BigInt;
    // Number of stakers staked on this node. This includes real stakers and zombies
    stakerCount: BigInt;
    // Number of stakers staked on a child node. This includes real stakers and zombies
    childStakerCount: BigInt;
    // This value starts at zero and is set to a value when the first child is created. After that it is constant until the node is destroyed or the owner destroys pending nodes
    firstChildBlock: BigInt;
    // The number of the latest child of this node to be created
    latestChildNumber: BigInt;
    // The block number when this node was created
    createdAtBlock: BigInt;
    // A hash of all the data needed to determine this node's validity, to protect against reorgs
    nodeHash: string;
}

/**
 * Fetches the node of a given assertion Id.
 * @param assertionId - The ID of the assertion.
 * @returns The node.
 */
export async function getAssertion(assertionId: number): Promise<AssertionNode> {
    const provider = getProvider("https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/"); // goerli for now
    const rollupContract = new ethers.Contract(config.rollupAddress, RollupAdminLogicAbi, provider);
    const [
        stateHash,
        challengeHash,
        confirmData,
        prevNum,
        deadlineBlock,
        noChildConfirmedBeforeBlock,
        stakerCount,
        childStakerCount,
        firstChildBlock,
        latestChildNumber,
        createdAtBlock,
        nodeHash
    ] = await rollupContract.getNode(assertionId);
    const node: AssertionNode = {
        stateHash,
        challengeHash,
        confirmData,
        prevNum,
        deadlineBlock,
        noChildConfirmedBeforeBlock,
        stakerCount,
        childStakerCount,
        firstChildBlock,
        latestChildNumber,
        createdAtBlock,
        nodeHash
    }
    return node;
}