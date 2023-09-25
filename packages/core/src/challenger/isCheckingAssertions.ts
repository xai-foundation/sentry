import { ethers } from "ethers";
import { RollupAdminLogicAbi } from "../abis";
import { config } from "../config";
import { getProvider } from "../utils";

/**
 * Fetches the value of isCheckingAssertions.
 * @returns The value of isCheckingAssertions.
 */
export async function getIsCheckingAssertions(): Promise<boolean> {
    const provider = getProvider();
    const rollupContract = new ethers.Contract(config.rollupAddress, RollupAdminLogicAbi, provider);
    const isCheckingAssertions = await rollupContract.isCheckingAssertions();
    return isCheckingAssertions;
}
