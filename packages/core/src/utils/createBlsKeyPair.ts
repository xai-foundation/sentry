import { bls12_381 as bls } from '@noble/curves/bls12-381';

/**
 * Creates a BLS Key Pair and returns the secret and public key in hexadecimal format.
 * @param secretKeyString - An optional string representing the secret key. If not provided, a new secret key is generated.
 * @returns An object containing the secret key and public key in hexadecimal format.
 * @example
 * const { secretKeyHex, publicKeyHex } = await createBlsKeyPair();
 * const { secretKeyHex, publicKeyHex } = await createBlsKeyPair('yourSecretKeyString');
 */
export async function createBlsKeyPair(secretKeyString?: string): Promise<{ secretKeyHex: string, publicKeyHex: string }> {
    const secretKey = secretKeyString || secretKeyString?.length ? Buffer.from(secretKeyString, 'hex') : bls.utils.randomPrivateKey();
    const secretKeyHex = Buffer.from(secretKey).toString('hex');
    const publicKey = bls.getPublicKey(secretKey);
    const publicKeyHex = Buffer.from(publicKey).toString('hex');
    
    return { secretKeyHex, publicKeyHex };
}