import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

// import { cookieStorage, createStorage } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_APP_ENV === "development" ? "7b8edd4521f6f7e5ab27d84d931ddf9b" : "8f5121741edc292ac7e4203b648d61e2";

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
    // storage: createStorage({
    //     storage: cookieStorage
    // }),
    enableWalletConnect: true, // Optional - true by default
    enableInjected: true, // Optional - true by default
    enableEIP6963: true, // Optional - true by default
    enableCoinbase: true, // Optional - true by default
    // ...wagmiOptions // Optional - Override createConfig parameters
})