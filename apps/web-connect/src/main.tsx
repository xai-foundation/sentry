import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './features/router'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { Config, WagmiProvider } from 'wagmi'
import { Chain } from 'viem'
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { arbitrum } from 'wagmi/chains'
import './index.css'
import { IpLocationChecker } from './features/ipchecker/IpLocationChecker'

const projectId = '8f5121741edc292ac7e4203b648d61e2'

export const chains: [Chain, ...Chain[]] = [
	arbitrum as Chain,
	// arbitrumSepolia as Chain
]

const queryClient = new QueryClient()

const metadata = {
	name: 'Xai Sentry Node',
	description: 'Connect your wallet to the Xai Sentry Node',
    url: 'https://sentry.xai.games/',
    icons: ['https://xai.games/images/delta%20med.svg']
}

export const wagmiConfig = defaultWagmiConfig({
	chains, // required
	projectId, // required
	metadata, // required
	ssr: true,
	// storage: createStorage({
	//     storage: cookieStorage
	// }),
	// transports: {
	// 	[arbitrum.id]: http(),
	// 	[arbitrumSepolia.id]: http(),
	// },
	enableWalletConnect: true, // Optional - true by default
	enableInjected: true, // Optional - true by default
	enableEIP6963: true, // Optional - true by default
	enableCoinbase: true, // Optional - true by default
	// ...wagmiOptions // Optional - Override createConfig parameters
})

createWeb3Modal({
	projectId,
	wagmiConfig
})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<WagmiProvider config={wagmiConfig as Config}>
		<QueryClientProvider client={queryClient}>
			<React.StrictMode>
				<IpLocationChecker>
					<AppRoutes />
				</IpLocationChecker>
			</React.StrictMode>
		</QueryClientProvider>
	</WagmiProvider>
)