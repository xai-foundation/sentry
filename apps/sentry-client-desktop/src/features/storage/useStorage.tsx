import {useEffect, useState} from 'react';
import {atom, useAtom} from 'jotai';

const dataAtom = atom<IData | undefined>(undefined);

export type IData = Partial<{
	addedWallets: string[];
	kycStartedWallets: string[];
	sentryRunning: boolean;
}>;

interface IUseStorageResponse {
	data?: IData;
	setData: (data: IData) => void;
	removeData: () => void;
	loading: boolean;
	getFilePath: () => Promise<string>;
}

/**
 * Custom hook to save a JSON object to disk in the user directory,
 * and provides a result of what is currently stored to disk in the hook,
 * as well as a function to set new values and remove values.
 * @returns The response from the hook.
 */
export function useStorage(): IUseStorageResponse {
	const [data, setData] = useAtom(dataAtom);
	const [loading, setLoading] = useState<boolean>(false);

	const getFilePath = async () => {
		return await window.ipcRenderer.invoke('path-join', await window.ipcRenderer.invoke('get-user-data-path'), 'sentry-node-config.json');
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			const filePath = await getFilePath();
			const fileExists = await window.ipcRenderer.invoke('fs-existsSync', filePath);
			if (fileExists) {
				const rawData = await window.ipcRenderer.invoke('fs-readFileSync', filePath, 'utf8');
				setData(JSON.parse(rawData.toString()));
			} else {
				// If the data is null on disk, save an empty {} to it.
				await window.ipcRenderer.invoke('fs-writeFileSync', filePath, JSON.stringify({}));
				setData({});
			}
			setLoading(false);
		};
		void fetchData();
	}, [setData]);

	const setDataToFile = async (newData: IData) => {
		setLoading(true);
		try {
			const filePath = await getFilePath();
			await window.ipcRenderer.invoke('fs-writeFileSync', filePath, JSON.stringify(newData));
			setData(newData);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const removeData = async () => {
		setLoading(true);
		try {
			const filePath = await getFilePath();
			await window.ipcRenderer.invoke('fs-unlinkSync', filePath);
			setData(undefined);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return {data, setData: setDataToFile, removeData, loading, getFilePath};
}
