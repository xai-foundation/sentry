import { ethers } from "ethers";

/**
 * Converts a value in wei to an ether value (as a string), with configurable decimal formatting and rounding.
 *
 * This function first uses `ethers.formatEther` to convert wei into an ether string, then applies
 * either truncation (flooring) or standard rounding to the specified number of decimal places. 
 * Finally, it removes any unnecessary trailing zeros.
 *
 * @param wei - The amount in wei, expressed as a `bigint` or a `string` representing a number.
 * @param decimals - The number of decimal places to include in the formatted ether value.
 * @param roundDown - If `true`, truncates the value by flooring instead of performing rounding. 
 *                    If `false`, standard rounding rules apply. Default is `false`.
 * @returns The formatted ether value as a string with trailing zeros removed.
 *
 */
export function formatWeiToEther(wei: bigint | string, decimals: number, roundDown = false): string {
    const etherValue = ethers.formatEther(wei);
    const numericValue = parseFloat(etherValue);

    let finalValue: number;
    if (roundDown) {
        // Truncate by flooring at the desired decimal place
        const factor = Math.pow(10, decimals);
        finalValue = Math.floor(numericValue * factor) / factor;
    } else {
        // Use toFixed for rounding, then parse to remove trailing zeros
        finalValue = parseFloat(numericValue.toFixed(decimals));
    }

    // Convert to string and remove trailing zeros
    return finalValue.toString().replace(/(\.0+|(?<=\.\d*[1-9])0+)$/, '');
}
