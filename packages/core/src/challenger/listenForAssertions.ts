import { LogDescription } from "ethers";
import { RollupAdminLogicAbi } from "../abis/RollupAdminLogicAbi.js";
import { config } from "../config.js";
import { resilientEventListener, EventListenerError } from "../utils/resilientEventListener.js";

/**
 * Listens for NodeConfirmed events and triggers a callback function when the event is emitted.
 * Keeps a map of nodeNums that have called the callback to ensure uniqueness.
 * @param callback - The callback function to be triggered when NodeConfirmed event is emitted.
 * @param log - The logging function to be used for logging.
 * @returns A function that can be called to stop listening for the event.
 */

export function listenForAssertions(callback: (nodeNum: any, blockHash: any, sendRoot: any, event: any, error?: EventListenerError) => void, _log: (log: string) => void) {
    // create a map to keep track of nodeNums that have called the callback
    const nodeNumMap: { [nodeNum: string]: boolean } = {};

    // listen for the NodeConfirmed event
    const listener = resilientEventListener({
        rpcUrl: config.arbitrumOneWebSocketUrl,
        contractAddress: config.rollupAddress,
        abi: RollupAdminLogicAbi,
        eventName: "NodeConfirmed",
        log: _log,
        callback: (log: LogDescription | null, error?: EventListenerError) => {

            if (error) {
                void callback(undefined, undefined, undefined, undefined, error);
            } else {

                try {
                    const nodeNum = BigInt(log?.args[0]);
                    const blockHash = log?.args[1];
                    const sendRoot = log?.args[2];

                    // if the nodeNum has not been seen before, call the callback and add it to the map
                    if (!nodeNumMap[nodeNum.toString()]) {
                        nodeNumMap[nodeNum.toString()] = true;
                        void callback(nodeNum, blockHash, sendRoot, log);
                    }
                } catch (ex: any) {
                    void callback(undefined, undefined, undefined, undefined, ex);
                }
            }
        }
    });

    // return a function that can be used to stop listening for the event
    return {
        stop: () => listener.stop()
    };
}
