import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createStorage } from '@wagmi/core'
import { localStorageProvider } from './storage'
import { networks, projectId } from './constants'

export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: localStorageProvider
    }),
    networks,
    projectId,
    ssr: true
});