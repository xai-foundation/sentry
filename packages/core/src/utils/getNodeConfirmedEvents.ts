import { ethers } from "ethers";

/**
 * Retrieves confirmed node events from a specified rollup contract.
 * 
 * @async
 * @param {string} rpc - The RPC URL for the Ethereum provider.
 * @param {string} rollupAddress - The address of the rollup contract.
 * @param {number} nodeNum - The node number to filter events for.
 * @param {number} fromBlock - The starting block number for the event query.
 * @param {number} toBlock - The ending block number for the event query.
 * @returns {Promise<ethers.Log[] | ethers.EventLog[]>} A promise that resolves to an array of event logs.
 * @throws {Error} If there's an issue connecting to the provider or querying events.
 */
export async function getNodeConfirmedEvents(rpc: string, rollupAddress: string, nodeNum: number, fromBlock: number, toBlock: number): Promise<ethers.Log[] | ethers.EventLog[]> {

    const NODE_CONFIRMED_EVENT_ABI = ["event NodeConfirmed(uint64 indexed nodeNum, bytes32 blockHash, bytes32 sendRoot)"];
    const provider = new ethers.JsonRpcProvider(rpc);
    const rollupCore = new ethers.Contract(rollupAddress, NODE_CONFIRMED_EVENT_ABI, provider);
    const filter = rollupCore.filters.NodeConfirmed(nodeNum);
    const events = await rollupCore.queryFilter(filter, fromBlock, toBlock);

    return events;
}