import { ethers } from "ethers";
import { RollupAdminLogicAbi } from "../abis/RollupAdminLogicAbi.js";
import { config } from "../config.js";
import { getProvider } from "../utils/getProvider.js";

/**
 * Fetches the value of isCheckingAssertions.
 * @returns The value of isCheckingAssertions.
 */
export async function getIsCheckingAssertions(): Promise<boolean> {
    const provider = getProvider("https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/"); // goerli for now
    const rollupContract = new ethers.Contract(config.rollupAddress, RollupAdminLogicAbi, provider);
    const isCheckingAssertions = await rollupContract.isCheckingAssertions();
    return isCheckingAssertions;
}
