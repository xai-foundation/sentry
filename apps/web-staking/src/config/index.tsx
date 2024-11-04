import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrumSepolia, arbitrum, AppKitNetwork } from '@reown/appkit/networks'
import { cookieStorage, createStorage } from '@wagmi/core'

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_APP_ENV === "development" ? "79e38b4593d43c78d7e9ee38f0cdf4ee" : "aa9e5ff297549e8d0cc518d085c28699";

if (!projectId) throw new Error('Project ID is not defined');

export const networks = process.env.NEXT_PUBLIC_APP_ENV === "development" ? [arbitrum, arbitrumSepolia] as [AppKitNetwork, ...AppKitNetwork[]] : [arbitrum] as [AppKitNetwork, ...AppKitNetwork[]];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig