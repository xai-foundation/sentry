import { Storage, StorageItemMap } from '@wagmi/core'

export const localStorageProvider: Storage = {
    getItem: <
        TKey extends string = string,
        TValue extends (StorageItemMap & Record<string, unknown>)[TKey] = (StorageItemMap & Record<string, unknown>)[TKey],
        TDefault extends TValue | null | undefined = undefined,
    >(
        key: TKey,
        defaultValue?: TDefault
    ): Promise<TDefault extends null ? TValue | null : TValue> => {
        return new Promise((resolve) => {
            try {
                if (typeof window !== 'undefined') {
                    const item = window.localStorage.getItem(key);
                    if (item === null) {
                        resolve(defaultValue as TDefault extends null ? TValue | null : TValue);
                    } else {
                        resolve(JSON.parse(item) as TDefault extends null ? TValue | null : TValue);
                    }
                } else {
                    resolve(defaultValue as TDefault extends null ? TValue | null : TValue);
                }
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                resolve(defaultValue as TDefault extends null ? TValue | null : TValue);
            }
        });
    },
    setItem: <
        TKey extends string = string,
        TValue extends (StorageItemMap & Record<string, unknown>)[TKey] = (StorageItemMap & Record<string, unknown>)[TKey]
    >(
        key: TKey,
        value: TValue
    ): void => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },
    removeItem: (key: string): void => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },
    key: 'localStorage'
};
