import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createStorage } from 'wagmi'
import { networks, projectId } from './constants'
import { indexedDBStorage } from './storage'

export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({ 
        storage: indexedDBStorage
    }),
    networks,
    projectId,
    ssr: true,
    syncConnectedChain: true
})