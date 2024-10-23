import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from '@wagmi/core'

// import { cookieStorage, createStorage } from 'wagmi'
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_APP_ENV === "development" ? "79e38b4593d43c78d7e9ee38f0cdf4ee" : "aa9e5ff297549e8d0cc518d085c28699";

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