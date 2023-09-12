import {ethers} from "ethers";
import { RollupAdminLogicAbi } from "../abis";
import { getProvider } from "../utils";
import { config } from "../config";

/**
 * Listens for NodeConfirmed events and triggers a callback function when the event is emitted.
 * Keeps a map of nodeNums that have called the callback to ensure uniqueness.
 * @param callback - The callback function to be triggered when NodeConfirmed event is emitted.
 * @returns void
 */
export function listenForAssertions(callback: (nodeNum: any, blockHash: any, sendRoot: any, event: any) => void): void {
    // get a provider for the arb one network
    const provider = getProvider();

    // create an instance of the rollup contract
    const rollupContract = new ethers.Contract(config.rollupProtocolContract, RollupAdminLogicAbi, {provider});

    // create a map to keep track of nodeNums that have called the callback
    const nodeNumMap: { [nodeNum: string]: boolean } = {};

    // listen for the NodeConfirmed event
    rollupContract.on("NodeConfirmed", (nodeNum, blockHash, sendRoot, event) => {
        
        // if the nodeNum has not been seen before, call the callback and add it to the map
        if (!nodeNumMap[nodeNum]) {
            nodeNumMap[nodeNum] = true;
            callback(nodeNum, blockHash, sendRoot, event);
        }
    });
}