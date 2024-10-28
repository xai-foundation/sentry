// storage.ts
import { Storage, StorageItemMap } from '@wagmi/core'
import { del, get, set } from 'idb-keyval'

let isInitialized = false
const initializationPromise = new Promise<void>(resolve => {
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            isInitialized = true
            resolve()
        })
    } else {
        isInitialized = true
        resolve()
    }
})

export const indexedDBStorage: Storage = {
    getItem: async <
        TKey extends string = string,
        TValue extends (StorageItemMap & Record<string, unknown>)[TKey] = (StorageItemMap & Record<string, unknown>)[TKey],
        TDefault extends TValue | null | undefined = undefined,
    >(
        key: TKey,
        defaultValue?: TDefault
    ): Promise<TDefault extends null ? TValue | null : TValue> => {
        try {
            if (typeof window !== 'undefined') {
                if (!isInitialized) {
                    await initializationPromise
                }
                const value = await get(key)
                if (value === undefined) {
                    return defaultValue as TDefault extends null ? TValue | null : TValue
                }
                return value as TDefault extends null ? TValue | null : TValue
            }
            return defaultValue as TDefault extends null ? TValue | null : TValue
        } catch (error) {
            console.error('Error reading from IndexedDB:', error)
            return defaultValue as TDefault extends null ? TValue | null : TValue
        }
    },
    setItem: async <
        TKey extends string = string,
        TValue extends (StorageItemMap & Record<string, unknown>)[TKey] = (StorageItemMap & Record<string, unknown>)[TKey]
    >(
        key: TKey,
        value: TValue
    ): Promise<void> => {
        try {
            if (typeof window !== 'undefined') {
                if (!isInitialized) {
                    await initializationPromise
                }
                await set(key, value)
            }
        } catch (error) {
            console.error('Error writing to IndexedDB:', error)
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            if (typeof window !== 'undefined') {
                if (!isInitialized) {
                    await initializationPromise
                }
                await del(key)
            }
        } catch (error) {
            console.error('Error removing from IndexedDB:', error)
        }
    },
    key: 'indexedDB'
}