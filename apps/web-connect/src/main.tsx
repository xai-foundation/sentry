import React from 'react'
import ReactDOM from 'react-dom/client'
import {AppRoutes} from './features/router'
import {createWeb3Modal, defaultWagmiConfig} from '@web3modal/wagmi/react'
import {WagmiConfig} from 'wagmi'
import {arbitrum, arbitrumNova} from 'wagmi/chains'
import './index.css'
import { IpLocationChecker } from './features/ipchecker/IpLocationChecker'

const projectId = '8f5121741edc292ac7e4203b648d61e2'

const chains = [
	arbitrum,
	arbitrumNova,
	// arbitrumSepolia
]

const metadata = {
	name: 'Xai Sentry Node',
	description: 'Connect your wallet to the Xai Sentry Node',
	url: 'https://web3modal.com',
	icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const wagmiConfig = defaultWagmiConfig({
	chains,
	projectId,
	metadata
})

createWeb3Modal({wagmiConfig, projectId, chains})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<WagmiConfig config={wagmiConfig as any}>
		<React.StrictMode>
			<IpLocationChecker>
				<AppRoutes/>
			</IpLocationChecker>
		</React.StrictMode>
	</WagmiConfig>
)
