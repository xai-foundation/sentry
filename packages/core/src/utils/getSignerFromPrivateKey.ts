import { ethers } from 'ethers';
import { getProvider } from './getProvider.js';
import { ArbitrumWallet } from './ArbitrumWallet.js';

/**
 * Creates an ethers signer from a given private key.
 * @param privateKey - The private key.
 * @returns An object containing the signer, address, and private key.
 */
export function getSignerFromPrivateKey(privateKey: string): { signer: ethers.Signer, address: string, privateKey: string } {
    const wallet = new ethers.Wallet(privateKey);
    const signer = new ArbitrumWallet(wallet.privateKey, getProvider());

    return { signer, address: wallet.address, privateKey: wallet.privateKey };
}
