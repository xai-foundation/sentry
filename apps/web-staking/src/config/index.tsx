import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'

// Get projectId at https://cloud.walletconnect.com
export const projectId = "04863bd18ce33c9fc97f0e295b149123";

if (!projectId) throw new Error('Project ID is not defined');

const chains = process.env.NEXT_PUBLIC_APP_ENV === "development" ? [arbitrum, arbitrumSepolia] as const : [arbitrum] as const;

const metadata = {
    name: 'Xai App',
    description: 'Xai Games App',
    url: 'https://app.xai.games/',
    icons: ['https://xai.games/images/delta%20med.svg']
}

export const config = defaultWagmiConfig({
    chains, // required
    projectId, // required
    metadata, // required
    ssr: true,
    storage: createStorage({
        storage: cookieStorage
    }),
    enableWalletConnect: true, // Optional - true by default
    enableInjected: true, // Optional - true by default
    enableEIP6963: true, // Optional - true by default
    enableCoinbase: true, // Optional - true by default
    // ...wagmiOptions // Optional - Override createConfig parameters
})
