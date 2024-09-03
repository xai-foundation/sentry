import { ethers, concat, keccak256 } from 'ethers';
import { RollupAdminLogicAbi } from "./RollupAdminLogicAbi.js";

const ROLLUP_ADDRESS = "0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336";

/**
 * @typedef {Object} NodeCreatedData
 * @property {number} assertion - The assertion number.
 * @property {string} blockHash - The block hash.
 * @property {string} sendRoot - The send root.
 * @property {string} confirmHash - The confirm hash.
 */


/**
 * Decode NodeCreated event data
 * @param contract The ethers contract object
 * @param event The ETH event object
 * @return {NodeCreatedData} the decoded NodeCreated data
 */
const decodeEventData = (contract, event) => {
    const decodedEvent = contract.interface.decodeEventLog("NodeCreated", event.data, event.topics);

    const blockHash = decodedEvent.assertion.afterState.globalState.bytes32Vals[0];
    const sendRoot = decodedEvent.assertion.afterState.globalState.bytes32Vals[1];

    const concatenatedHashes = concat([blockHash, sendRoot]);
    const confirmHash = keccak256(concatenatedHashes);

    return {
        assertion: Number(decodedEvent.nodeNum),
        blockHash,
        sendRoot,
        confirmHash,
    }
}

/**
 * Will fetch NodeCreated events from the rollup contract, will return a sorted array of formatted event data
 * @param {number} latestAssertionId
 * @return {Promise<NodeCreatedData[]>} A promise with an array of NodeCreated event data
 */
export async function loadNodeCreatedEvents(latestAssertionId) {

    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL || "https://arb1.arbitrum.io/rpc");
    const blockRangePerRequest = 10000;

    const rollupContract = new ethers.Contract(
        ROLLUP_ADDRESS,
        RollupAdminLogicAbi,
        provider
    )

    const latestBlock = await provider.getBlockNumber();

    let toBlock = latestBlock;
    let fromBlock = Math.max(latestBlock - blockRangePerRequest, 0);

    const mappedEvents = [];

    while (true) {

        const foundEvents = await rollupContract.queryFilter(rollupContract.filters.NodeCreated(), fromBlock, toBlock);
        if (foundEvents.length) {

            // map through the found events until we found the one with lastAssertionId
            let hasReachedLatest = false;

            for (let i = 0; i < foundEvents.length; i++) {
                const event = foundEvents[i];

                const decoded = decodeEventData(rollupContract, event);

                if (decoded.assertion >= latestAssertionId) {
                    mappedEvents.push(decoded);
                } else {
                    hasReachedLatest = true;
                }
            }

            if (hasReachedLatest) {
                break;
            }

        }

        if (fromBlock == 0) {
            throw new Error("Did not find any past NodeCreated events on the rollup contract until Block 0");
        }

        toBlock = fromBlock - 1;
        fromBlock = Math.max(fromBlock - blockRangePerRequest, 0); // Decrement by 1000, but don't go below 0
    }

    if (!mappedEvents.length) {
        throw new Error("Did not find any NodeCreated event ");
    }

    return mappedEvents.reverse();
}