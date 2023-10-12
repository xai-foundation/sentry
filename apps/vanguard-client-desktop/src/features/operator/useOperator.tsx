import { ethers } from 'ethers';
import { useState, useEffect, useRef } from 'react';
import { useStorage } from '../storage/useStorage';
import { createMnemonic, getSignerFromMnemonic, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

interface IUseOperatorResponse {
    signer?: ethers.Signer;
    privateKey?: string;
    publicKey?: string;
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
    const [privateKey, setPrivateKey] = useState<string>();
    const [publicKey, setPublicKey] = useState<string>();
    const signerRef = useRef<any>();
    const [error, setError] = useState<Error>();

    const getOperatorFilePath = async () => {
        return await window.ipcRenderer.invoke('path-join', await window.ipcRenderer.invoke('get-user-data-path'), ".sentry-operator");
    };


    useEffect(() => {

        async function startup() {

            setLoading(true);

            const path = await getOperatorFilePath();

            // check to see the file exists
            const fileExists = await window.ipcRenderer.invoke('fs-existsSync', path);

            // check to see if we have a private key saved in storage
            if (fileExists) {

                // read the file from the disk
                const data: Buffer = await window.ipcRenderer.invoke('fs-readFileSync', path);

                // Decrypt the encrypted private key using the ipcRenderer
                const decryptedPrivateKey: string = await window.ipcRenderer.invoke('decrypt-string', data);
                setPrivateKey(decryptedPrivateKey);

                // get the signer from the decrypter private key
                const {signer} = getSignerFromPrivateKey(decryptedPrivateKey);
                signerRef.current = signer;
                setPublicKey(await signer.getAddress())

                setLoading(false);
                return;
            }

            let encryptionAvailable = false;
            let attempts = 0;

            do {
                // check to see if the encryption is available
                encryptionAvailable = await window.ipcRenderer.invoke("is-encryption-available");
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
            const { privateKey, signer, address } = await getSignerFromMnemonic(phrase, 0);
            setPrivateKey(privateKey);
            setPublicKey(address);

            // set the signer on the ref
            signerRef.current = signer;

            // encrypt the private key
            const encrypted: Buffer = await window.ipcRenderer.invoke('encrypt-string', privateKey);

            // save to disk
            await window.ipcRenderer.invoke('fs-writeFileSync', path, encrypted)

            setLoading(false);
        }

            startup()
                .catch(setError)
    }, [window.ipcRenderer])

    const importPrivateKey = async (privateKey: string) => {
        
        // set loading to true
        setLoading(true);

        const path = await getOperatorFilePath();

        try {
            // get the signer from the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // set the signer on the ref
            signerRef.current = signer;

            // encrypt the private key
            const encrypted: Buffer = await window.ipcRenderer.invoke('encrypt-string', privateKey);
            
            // save to disk
            await window.ipcRenderer.invoke('fs-writeFileSync', path, encrypted)
            
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
        privateKey,
        publicKey
    };
}

