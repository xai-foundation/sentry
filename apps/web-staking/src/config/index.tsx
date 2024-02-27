import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'

// Get projectId at https://cloud.walletconnect.com
export const projectId = "4d71771cc1633008048b48359258b055";

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
    name: 'Xai Staking',
    description: 'Xai Staking and redemption',
    url: 'https://xai.games/',
    icons: ['https://xai.games/images/delta%20med.svg']
}

// Create wagmiConfig
export const config = defaultWagmiConfig({
    chains: [arbitrum, arbitrumSepolia], // required
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