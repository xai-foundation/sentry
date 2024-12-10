import {createAppKit} from '@reown/appkit/react'
import { AppRoutes } from '@/features/router'
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { AppKitNetwork, arbitrum, arbitrumSepolia } from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "wagmi";

const { VITE_APP_ENV } = import.meta.env
const environment = VITE_APP_ENV === "development" ? "development" : "production";

// Get projectId at https://cloud.walletconnect.com
export const projectId = environment === "development" ? "79e38b4593d43c78d7e9ee38f0cdf4ee" : "aa9e5ff297549e8d0cc518d085c28699";

if (!projectId) throw new Error('Project ID is not defined');

export const chains = environment === "development" ? [arbitrum, arbitrumSepolia] as [AppKitNetwork, ...AppKitNetwork[]] : [arbitrum] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: false,
    projectId,
    networks: chains
})

const metadata = {
    name: 'Xai Sentry Node',
    description: 'Connect your wallet to the Xai Sentry Node',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://sentry.xai.games',
    icons: ['https://xai.games/images/delta%20med.svg']
  }

createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: chains,
    defaultNetwork: arbitrum,
    metadata,
    features: {
      allWallets: true,
      smartSessions: true,
      socials: ['google', 'discord', 'github', 'x', 'facebook', 'apple', 'farcaster'],
      }
    // themeMode: 'light',
    // themeVariables: {
    //     '--w3m-color-mix': '#00DCFF',
    //     '--w3m-color-mix-strength': 20
    // }
})

export default function App() {
    return (       
        <AppRoutes />
    )
}