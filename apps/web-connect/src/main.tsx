import React from 'react'
import ReactDOM from 'react-dom/client'
import {AppRoutes} from './features/router'
import { Config, WagmiProvider, createConfig, http  } from 'wagmi'
import {Chain} from 'viem'
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {arbitrum, arbitrumSepolia} from 'wagmi/chains'
import './index.css'
import { IpLocationChecker } from './features/ipchecker/IpLocationChecker'

const projectId = '8f5121741edc292ac7e4203b648d61e2'



export const chains: [Chain, ...Chain[]] = [
	arbitrum as Chain,
	arbitrumSepolia as Chain
]

const queryClient = new QueryClient()

const metadata = {
	name: 'Xai Sentry Node',
	description: 'Connect your wallet to the Xai Sentry Node',
	url: 'https://web3modal.com',
	icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const wagmiConfig = createConfig({
	chains,	
	transports: {
		[arbitrum.id]: http(),
		[arbitrumSepolia.id]: http(),
	},
})

createWeb3Modal({
	projectId,
	wagmiConfig,
	metadata,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<WagmiProvider  config={wagmiConfig as Config}>
		<QueryClientProvider client={queryClient}>
			<React.StrictMode>
				<IpLocationChecker>
					<AppRoutes/>
				</IpLocationChecker>
			</React.StrictMode>
		</QueryClientProvider>
	</WagmiProvider>
)
