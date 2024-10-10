import { MAINNET_ID, TESTNET_ID } from '../config.js';

export const isValidNetwork = (chainId: number | undefined): boolean => {
    if (!chainId) return false;
    return chainId === MAINNET_ID || chainId === TESTNET_ID;
}