import React from 'react'
import ReactDOM from 'react-dom/client'
import {AppRoutes} from './features/router'
import {configureChains, createConfig, WagmiConfig} from 'wagmi'
import {arbitrumGoerli} from "viem/chains";
import {publicProvider} from 'wagmi/providers/public'
import {InjectedConnector} from 'wagmi/connectors/injected'
import './index.css'

const { chains, publicClient } = configureChains(
	[arbitrumGoerli],
	[publicProvider()],
)

const config = createConfig({
	autoConnect: true,
	connectors: [new InjectedConnector({ chains })],
	publicClient,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<WagmiConfig config={config}>
		<React.StrictMode>
			<AppRoutes/>
		</React.StrictMode>,
	</WagmiConfig>
)
