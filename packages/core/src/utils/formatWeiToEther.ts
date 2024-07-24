import { ethers } from "ethers";

/**
 * Converts wei to ether and formats it to the specified number of decimal places, removing trailing zeros.
 * @param wei - The amount in wei (can be a bigint or string).
 * @param decimals - The number of decimal places to format the output.
 * @returns The formatted ether value as a string, with trailing zeros removed.
 */
export function formatWeiToEther(wei: bigint | string, decimals: number): string {
    const etherValue = ethers.formatEther(wei);
    const floatValue = parseFloat(etherValue).toFixed(decimals);
    return parseFloat(floatValue).toString().replace(/(\.0+|(?<=\.\d*[1-9])0+)$/, '');
}
