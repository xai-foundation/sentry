import { ethers } from 'ethers';
import { useState, useEffect, useRef } from 'react';
import { useStorage } from '../storage/useStorage';
import { createMnemonic, getSignerFromMnemonic, getSignerFromPrivateKey } from "@xai-vanguard-node/core";
const { ipcRenderer } = window.require('electron');

interface IUseOperatorResponse {
    signer?: ethers.Signer;
    privateKey?: string;
    importPrivateKey: (privateKey: string) => Promise<void>
    // regenerate: () => Promise<void>
    error?: Error;
    loading: boolean;
}

/**
 * Custom hook
 * @param props - The props for the hook.
 * @returns The response from the hook.
 */
export function useOperator(): IUseOperatorResponse {

    const [loading, setLoading] = useState(true);
    const signerRef = useRef<any>();
    const [error, setError] = useState<Error>();
    const {data, loading: storageLoading, setData} = useStorage();

    useEffect(() => {

        async function startup() {

            setLoading(true);

            // check to see if we have a private key saved in storage
            if (data?.encryptedPrivateKey) {
                // Convert the encrypted private key string to a buffer
                const encryptedBuffer: Buffer = Buffer.from(data.encryptedPrivateKey, 'hex');

                // Decrypt the encrypted private key using the ipcRenderer
                const decryptedPrivateKey: string = await ipcRenderer.invoke('decrypt-string', encryptedBuffer);

                // get the signer from the decrypter private key
                const {signer} = getSignerFromPrivateKey(decryptedPrivateKey);
                signerRef.current = signer;

                setLoading(false);
                return;
            }

            let encryptionAvailable = false;
            let attempts = 0;

            do {
                // check to see if the encryption is available
                encryptionAvailable = await ipcRenderer.invoke("is-encryption-available");
                attempts++;

                // if it is not available, wait for a second and try again
                if (!encryptionAvailable) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                // if 5 seconds pass, throw error
                if (attempts > 5) {
                    throw new Error("Encryption not available after 5 seconds");
                }
            } while (!encryptionAvailable);
        
            // generate a mneomnic for the signer
            const {phrase} = createMnemonic();

            // get the private key from index 0 of the mnemonic
            const { privateKey, signer } = await getSignerFromMnemonic(phrase, 0);

            // set the signer on the ref
            signerRef.current = signer;

            // encrypt the private key
            const encrypted: Buffer = await ipcRenderer.invoke('encrypt-string', privateKey);

            // convert the buffer to a string
            const encryptedString: string = encrypted.toString('hex');

            // save the encryptedString to disk
            setData({
                ...data,
                encryptedPrivateKey: encryptedString,
            });

            setLoading(false);
        }

        if (!storageLoading) {
            startup()
                .catch(setError)
        }
    }, [ipcRenderer, storageLoading])

    const importPrivateKey = async (privateKey: string) => {
        
        // set loading to true
        setLoading(true);

        try {
            // get the signer from the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // set the signer on the ref
            signerRef.current = signer;

            // encrypt the private key
            const encrypted: Buffer = await ipcRenderer.invoke('encrypt-string', privateKey);

            // convert the buffer to a string
            const encryptedString: string = encrypted.toString('hex');

            // save the encryptedString to disk
            setData({
                ...data,
                encryptedPrivateKey: encryptedString,
            });
            
        } catch (error) {
            setError(error as Error);
        } finally {
            // set loading to false
            setLoading(false);
        }
    };


    return {
        error,
        loading,
        signer: signerRef?.current,
        importPrivateKey,
    };
}

