// main.tsx
import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import {AppRoutes} from './features/router'
import {EthereumClient, w3mConnectors, w3mProvider} from '@web3modal/ethereum'
import {Web3Modal} from '@web3modal/react'
import {configureChains, createConfig, WagmiConfig} from 'wagmi'
import {arbitrum, mainnet} from 'wagmi/chains'
import "./index.css";
import {MetaMaskProvider} from "@metamask/sdk-react";

const chains = [arbitrum, mainnet]
const projectId = '8f5121741edc292ac7e4203b648d61e2'

const {publicClient} = configureChains(chains, [w3mProvider({projectId})])
const wagmiConfig = createConfig({
	autoConnect: true,
	connectors: w3mConnectors({projectId, chains}),
	publicClient
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<WagmiConfig config={wagmiConfig}>
				<MetaMaskProvider debug={false} sdkOptions={{
					logging: {
						developerMode: false,
					},
					checkInstallationImmediately: false, // This will automatically connect to MetaMask on page load
					dappMetadata: {
						name: "Xai Sentry Node",
						url: window.location.host,
					}
				}}>

					<AppRoutes/>
				</MetaMaskProvider>
			</WagmiConfig>

			<Web3Modal projectId={projectId} ethereumClient={ethereumClient}/>
		</StrictMode>,
	)
}

// Remove Preload scripts loading
postMessage({payload: 'removeLoading'}, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
	console.log(message)
})
