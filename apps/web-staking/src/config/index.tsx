import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from '@wagmi/core'

// import { cookieStorage, createStorage } from 'wagmi'
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_APP_ENV === "development" ? "7b8edd4521f6f7e5ab27d84d931ddf9b" : "8f5121741edc292ac7e4203b648d61e2";

if (!projectId) throw new Error('Project ID is not defined');

const networks = process.env.NEXT_PUBLIC_APP_ENV === "development" ? [arbitrum, arbitrumSepolia] : [arbitrum];

export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    networks,
    projectId,
    ssr: true
})