import {ethers} from "ethers";
import { RollupAdminLogicAbi } from "../abis";
import { getProvider } from "../utils";

/**
 * Listens for NodeConfirmed events and triggers a callback function when the event is emitted.
 */
export function listenForAssertions(callback: (nodeNum: any, blockHash: any, sendRoot: any, event: any) => void) {

    // get a provider for the arb one network
    const provider = getProvider();

    // create an instance of the rollup contract
    const rollupContract = new ethers.Contract("0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1", RollupAdminLogicAbi, {provider});

    // listen for the NodeConfirmed event
    rollupContract.on("NodeConfirmed", callback);
}