import { MAINNET_ID, TESTNET_ID } from '../config.js';

export const isValidNetwork = (chainId: number | undefined, isDevelopment = false): boolean => {
    if (!chainId) return false;
    if (isDevelopment) return chainId === MAINNET_ID || chainId === TESTNET_ID;
    return chainId === MAINNET_ID;
}