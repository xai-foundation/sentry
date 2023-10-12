import { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs';

export type IData = Partial<{
    encryptedPrivateKey: string;
}>

interface IUseStorageResponse {
    data?: IData;
    setData: (data: IData) => void;
    removeData: () => void;
    loading: boolean;
}

/**
 * Custom hook to save a JSON object to disk in the user directory,
 * and provides a result of what is currently stored to disk in the hook,
 * as well as a function to set new values and remove values.
 * @param props - The props for the hook.
 * @returns The response from the hook.
 */
export function useStorage(): IUseStorageResponse {
    const [data, setData] = useState<IData>();
    const [loading, setLoading] = useState<boolean>(false);

    const filePath = path.join(ipcRenderer.sendSync('get-user-data-path'), "sentry-node-config.json");

    useEffect(() => {
        setLoading(true);
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            setData(JSON.parse(rawData.toString()));
        } else {
            // If the data is null on disk, save an empty {} to it.
            fs.writeFileSync(filePath, JSON.stringify({}));
            setData({});
        }
        setLoading(false);
    }, [filePath]);

    const setDataToFile = (newData: any) => {
        setLoading(true);
        fs.writeFileSync(filePath, JSON.stringify(newData));
        setData(newData);
        setLoading(false);
    };

    const removeData = () => {
        setLoading(true);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        setData(undefined);
        setLoading(false);
    };

    return { data, setData: setDataToFile, removeData, loading };
}
