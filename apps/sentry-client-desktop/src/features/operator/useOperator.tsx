import {ethers} from "ethers";
import {useState, useEffect, useRef} from 'react';
import {atom, useAtom} from "jotai";
import {createMnemonic, getSignerFromMnemonic, getSignerFromPrivateKey} from "@sentry/core";

export const privateKeyAtom = atom<string | undefined>(undefined);

interface IUseOperatorResponse {
	signer?: ethers.Signer;
	privateKey?: string;
	publicKey?: string;
	importPrivateKey: (privateKey: string) => Promise<void>
	// regenerate: () => Promise<void>
	error?: Error;
	isLoading: boolean;
}

let startupRunning = false;

/**
 * Hook for working with the locally saved operator
 * @param props - The props for the hook.
 * @returns The response from the hook.
 */
export function useOperator(): IUseOperatorResponse {

	const [privateKey, setPrivateKey] = useAtom(privateKeyAtom);
	const [publicKey, setPublicKey] = useState<string>();
	const signerRef = useRef<any>();
	const [error, setError] = useState<Error>();

	const getOperatorFilePath = async () => {
		return await window.ipcRenderer.invoke('path-join', await window.ipcRenderer.invoke('get-user-data-path'), ".sentry-operator");
	};

	useEffect(() => {
		async function startup() {
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

				// // get the signer from the decrypter private key
				// const {signer} = getSignerFromPrivateKey(decryptedPrivateKey);
				// signerRef.current = signer;
				// setPublicKey(await signer.getAddress())

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
			const {privateKey} = await getSignerFromMnemonic(phrase, 0);
			setPrivateKey(privateKey);

			// encrypt the private key
			const encrypted: Buffer = await window.ipcRenderer.invoke('encrypt-string', privateKey);

			// save to disk
			await window.ipcRenderer.invoke('fs-writeFileSync', path, encrypted)
		}

		if (!privateKey && !startupRunning) {
			startupRunning = true;
			startup()
				.catch(setError)
				.finally(() => {
					startupRunning = false;
				})
		}
	}, [window.ipcRenderer])

	useEffect(() => {
		if (privateKey) {
			const {signer, address} = getSignerFromPrivateKey(privateKey);
			signerRef.current = signer;
			setPublicKey(address)
		}
	}, [privateKey])

	const importPrivateKey = async (_privateKey: string) => {

		const path = await getOperatorFilePath();

		try {
			// encrypt the private key
			const encrypted: Buffer = await window.ipcRenderer.invoke('encrypt-string', _privateKey);

			// save to disk
			await window.ipcRenderer.invoke('fs-writeFileSync', path, encrypted)

			setPrivateKey(_privateKey);

		} catch (error) {
			setError(error as Error);
		}
	};


	return {
		error,
		isLoading: !privateKey || !publicKey || !signerRef.current,
		signer: signerRef?.current,
		importPrivateKey,
		privateKey,
		publicKey
	};
}

