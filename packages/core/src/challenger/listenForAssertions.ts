import {ethers} from "ethers";
import { RollupAdminLogicAbi } from "../abis/RollupAdminLogicAbi.js";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";

/**
 * Listens for NodeConfirmed events and triggers a callback function when the event is emitted.
 * Keeps a map of nodeNums that have called the callback to ensure uniqueness.
 * @param callback - The callback function to be triggered when NodeConfirmed event is emitted.
 * @param log - The logging function to be used for logging.
 * @returns A function that can be called to stop listening for the event.
 */
export function listenForAssertions(callback: (nodeNum: any, blockHash: any, sendRoot: any, event: any) => void, log: (log: string) => void): () => void {
    const provider = getProvider("wss://arb-goerli.g.alchemy.com/v2/WNOJEZxrhn3a0PzKUVEZgeRJqxOL7brv"); // arb goerli while we run on testnet

    // create an instance of the rollup contract
    const rollupContract = new ethers.Contract(config.rollupAddress, RollupAdminLogicAbi, {provider});

    // create a map to keep track of nodeNums that have called the callback
    const nodeNumMap: { [nodeNum: string]: boolean } = {};

    // listen for the NodeConfirmed event
    rollupContract.on("NodeConfirmed", (nodeNum, blockHash, sendRoot, event) => {

        // if the nodeNum has not been seen before, call the callback and add it to the map
        if (!nodeNumMap[nodeNum]) {
            log(`[${new Date().toISOString()}] NodeConfirmed event received for new nodeNum: ${nodeNum}`);
            nodeNumMap[nodeNum] = true;
            void callback(nodeNum, blockHash, sendRoot, event);
        }
    });

    // Request the current block number immediately and then every 5 minutes
    const fetchBlockNumber = async () => {
        try {
            const blockNumber = await provider.getBlockNumber();
            log(`[${new Date().toISOString()}] Health Check, Challenger still healthy. Current block number: ${blockNumber}`);
        } catch (error) {
            log(`[${new Date().toISOString()}] Error fetching block number, challenger may no longer be connected to the RPC: ${JSON.stringify(error)}`);
        }
    };
    fetchBlockNumber();
    const interval = setInterval(fetchBlockNumber, 300000);

    // return a function that can be used to stop listening for the event
    return () => {
        log(`[${new Date().toISOString()}] Stopping listening for NodeConfirmed events`);
        rollupContract.removeAllListeners("NodeConfirmed");
        clearInterval(interval);
    };
}
