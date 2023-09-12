import { ethers } from 'ethers';

/**
 * Creates an ethers signer from a given Mnemonic object and index.
 * @param mnemonic - The Mnemonic string
 * @param index - The index of the account in the mnemonic.
 * @returns An object containing the signer, address, and private key.
 */
export function getSignerFromMnemonic(mnemonic: string, index: number): { signer: ethers.Signer, address: string, privateKey: string } {
    const path = `m/44'/60'/0'/0/${index}`;
    const wallet = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic), path)
    const signer = new ethers.Wallet(wallet.privateKey);

    return { signer, address: wallet.address, privateKey: wallet.privateKey };
}