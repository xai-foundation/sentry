import { MAINNET_ID, TESTNET_ID } from '../config.js';

/**
 * Validates if a given chain ID corresponds to a recognized network ID.
 *
 * @param {string | number | undefined} chainId - The chain ID to validate, which may be a string, number, or undefined.
 * @param {boolean} [isDevelopment=false] - Flag indicating if the validation should consider test network IDs.
 * 
 * @returns {boolean} True if `chainId` matches a recognized network ID based on the environment; otherwise, false.
 * 
 * @example
 */
export const isValidNetwork = (
    chainId: string | number | undefined,
    isDevelopment = false
): boolean => {
    // Handle invalid inputs (undefined, NaN, or failed conversion)
    const numericChainId = Number(chainId);
    if (!Number.isFinite(numericChainId)) return false;

    // Validate against allowed network IDs
    return numericChainId === MAINNET_ID ||
        (isDevelopment && numericChainId === TESTNET_ID);
};