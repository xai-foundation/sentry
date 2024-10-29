import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './features/router'
import { Config, WagmiProvider } from 'wagmi'
import { Chain } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { IpLocationChecker } from './features/ipchecker/IpLocationChecker'
import xaiThumbnail from './assets/images/xai-preview.jpg'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { createAppKit } from '@reown/appkit/react'
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, cookieToInitialState, createStorage } from '@wagmi/core'
import { HydrationWrapper } from './HydrationWrapper'

const { VITE_APP_ENV } = import.meta.env
const environment = VITE_APP_ENV === "development" ? "development" : "production"
const projectId = environment === "development" ? "79e38b4593d43c78d7e9ee38f0cdf4ee" : "543ba4882fc1d2e9a9ffe8bc1c473cf9"

export const chains: [Chain, ...Chain[]] = [arbitrum as Chain]
if (environment === "development") chains.push(arbitrumSepolia as Chain)

const storage = createStorage({
	storage: {
		...cookieStorage,
		setItem: (key: string, value: string) => {
			document.cookie = `${key}=${value}; path=/; ${environment === 'production'
					? 'domain=.xai.games; secure; samesite=None'
					: 'samesite=Lax'
				}`
		}
	}
})

export const wagmiAdapter = new WagmiAdapter({
	storage,
	networks: chains,
	projectId,
	ssr: true
})

const queryClient = new QueryClient()

const metadata = {
	name: 'Xai Sentry Node',
	description: 'Connect your wallet to the Xai Sentry Node',
	url: 'https://sentry.xai.games/',
	icons: ['https://xai.games/images/delta%20med.svg']
}

const getInitialState = () => {
	try {
		return cookieToInitialState(wagmiAdapter.wagmiConfig as Config, document.cookie)
	} catch {
		return undefined
	}
}

createAppKit({
	adapters: [wagmiAdapter],
	projectId,
	networks: environment === "development" ? [arbitrum, arbitrumSepolia] : [arbitrum],
	defaultNetwork: arbitrum,
	metadata,
	features: {
		analytics: true
	}
})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<HelmetProvider context={{}}>
		<WagmiProvider
			config={wagmiAdapter.wagmiConfig as Config}
			initialState={getInitialState()}
		>
			<QueryClientProvider client={queryClient}>
				<Helmet>
					<meta name="title" property="og:title" content="Xai Sentry Node" />
					<meta name="description" property="og:description" content="Xai Sentry Node Key Sale Page" />
					<meta name="image" property="og:image" content={xaiThumbnail} />
					<meta name="url" property="og:url" content="https://sentry.xai.games" />
					<meta name="type" property="og:type" content="website" />
					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:site" content="https://sentry.xai.games" />
					<meta name="twitter:title" content="Xai Sentry Node" />
					<meta name="twitter:description" content="Xai Sentry Node Key Sale Page" />
					<meta name="twitter:image" content={xaiThumbnail} />
					<meta name="twitter:creator" content="@xai_games" />
				</Helmet>
				<HydrationWrapper>
					<React.StrictMode>
						<IpLocationChecker>
							<AppRoutes />
						</IpLocationChecker>
					</React.StrictMode>
				</HydrationWrapper>
			</QueryClientProvider>
		</WagmiProvider>
	</HelmetProvider>
)