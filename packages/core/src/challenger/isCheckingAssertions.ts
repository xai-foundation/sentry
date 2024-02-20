import { ethers } from "ethers";
import { RollupAdminLogicAbi } from "../abis/RollupAdminLogicAbi.js";
import { config } from "../config.js";
import { getProvider } from "../utils/getProvider.js";

/**
 * Fetches the value of isCheckingAssertions.
 * @returns The value of isCheckingAssertions.
 */
export async function getIsCheckingAssertions(): Promise<boolean> {
    const provider = getProvider(config.arbitrumOneJsonRpcUrl);
    const rollupContract = new ethers.Contract(config.rollupAddress, RollupAdminLogicAbi, provider);
    const isCheckingAssertions = await rollupContract.isCheckingAssertions();
    return isCheckingAssertions;
}
