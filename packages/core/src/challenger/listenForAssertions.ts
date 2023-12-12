import {ethers} from "ethers";
import { RollupAdminLogicAbi } from "../abis/RollupAdminLogicAbi.js";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";

// create a map to keep track of nodeNums that have called the callback
const nodeNumMap: { [nodeNum: string]: boolean } = {};

/**
 * Listens for NodeConfirmed events and triggers a callback function when the event is emitted.
 * Keeps a map of nodeNums that have called the callback to ensure uniqueness.
 * @param callback - The callback function to be triggered when NodeConfirmed event is emitted.
 * @returns A function that can be called to stop listening for the event.
 */
export function listenForAssertions(callback: (nodeNum: any, blockHash: any, sendRoot: any, event: any) => void, log: (log: string) => void = () => {}): () => void {
    // Initialize a variable to hold the interval ID
    let intervalId: NodeJS.Timeout;
    let rollupContract: ethers.Contract;
    let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.AlchemyProvider;

    // Function to start listening for the NodeConfirmed event
    // https://docs.chainstack.com/docs/understanding-ethereums-filter-not-found-error-and-how-to-fix-it
    const startListening = () => {
        log(`[${new Date().toISOString()}] Starting to listen for NodeConfirmed events`);
        // If there's an existing interval, clear it
        if (intervalId) {
            log(`[${new Date().toISOString()}] Clearing existing interval and listeners`);
            clearInterval(intervalId);
            if (rollupContract) {
                rollupContract.removeAllListeners("NodeConfirmed");
            }
        }

        log(`[${new Date().toISOString()}] Creating provider and contract instance`);
        provider = getProvider(`https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/`, true); // arb goerli while we run on testnet

        // create an instance of the rollup contract
        rollupContract = new ethers.Contract(config.rollupAddress, RollupAdminLogicAbi, {provider});

        // Listen for the NodeConfirmed event
        log(`[${new Date().toISOString()}] Setting up listener for NodeConfirmed events`);
        rollupContract.on("NodeConfirmed", (nodeNum, blockHash, sendRoot, event) => {
            // If the nodeNum has not been seen before, call the callback and add it to the map
            if (!nodeNumMap[nodeNum]) {
                log(`[${new Date().toISOString()}] NodeConfirmed event received for new nodeNum: ${nodeNum}`);
                nodeNumMap[nodeNum] = true;
                void callback(nodeNum, blockHash, sendRoot, event);
            }
        });

        // Set an interval to recreate the listener every 4 minutes
        log(`[${new Date().toISOString()}] Setting up interval to recreate listener every 4 minutes`);
        intervalId = setInterval(startListening, 4 * 60 * 1000);
    };

    // Start the initial listening
    log(`[${new Date().toISOString()}] Starting initial listening`);
    
    startListening();

    // Return a function that can be used to stop listening for the event
    return () => {
        log(`[${new Date().toISOString()}] Stopping listening for NodeConfirmed events`);
        clearInterval(intervalId);
        rollupContract.removeAllListeners("NodeConfirmed");
        provider.removeAllListeners("error");
    };
}