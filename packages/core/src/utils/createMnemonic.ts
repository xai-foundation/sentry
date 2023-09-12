import { ethers, Mnemonic } from 'ethers';

/**
 * Creates a mnemonic using ethers.js and returns it.
 * @returns An object containing the generated Mnemonic object and its corresponding phrase as a string.
 */
export function createMnemonic(): { mnemonic: Mnemonic, phrase: string } {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = Mnemonic.fromPhrase(wallet.mnemonic!.phrase);
    return { mnemonic, phrase: wallet.mnemonic!.phrase };
}