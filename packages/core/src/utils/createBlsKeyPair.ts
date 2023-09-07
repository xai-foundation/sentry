import bls from "@chainsafe/bls";

/**
 * Creates a BLS Key Pair and returns the secret and public key in hexadecimal format.
 * @returns An object containing the secret key and public key in hexadecimal format.
 * @example
 * const { secretKeyHex, publicKeyHex } = await createBlsKeyPair();
 */
export async function createBlsKeyPair(): Promise<{ secretKeyHex: string, publicKeyHex: string }> {
    const secretKey = bls.SecretKey.fromKeygen();
    const publicKey = secretKey.toPublicKey();
    
    const secretKeyBytes = secretKey.toBytes();
    const publicKeyBytes = publicKey.toBytes();
    
    const secretKeyHex = Buffer.from(secretKeyBytes).toString('hex');
    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');
    
    return { secretKeyHex, publicKeyHex };
}