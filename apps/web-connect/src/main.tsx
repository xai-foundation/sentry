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

const { VITE_APP_ENV } = import.meta.env
const environment = VITE_APP_ENV === "development" ? "development" : "production"
const projectId = environment === "development" ? "79e38b4593d43c78d7e9ee38f0cdf4ee" : "543ba4882fc1d2e9a9ffe8bc1c473cf9"

export const chains: [Chain, ...Chain[]] = [arbitrum as Chain]
if (environment === "development") chains.push(arbitrumSepolia as Chain)

// Get domain configuration based on environment and hostname
// Log domain config
const getDomainConfig = () => {
	const hostname = window.location.hostname
	const isProduction = environment === 'production'

	const config = isProduction ? {
		domain: '.xai.games',
		secure: true,
		sameSite: 'None' as const
	} : {
		domain: hostname === 'localhost' ? undefined : '.cryptit.at',
		secure: hostname !== 'localhost',
		sameSite: hostname === 'localhost' ? 'Lax' as const : 'None' as const
	}

	console.log('Domain Config:', {
		hostname,
		isProduction,
		config
	})

	return config
}

// Create custom storage with smart cookie handling
const storage = createStorage({
	storage: {
		...cookieStorage,
		setItem: (key: string, value: string) => {
			const { domain, secure, sameSite } = getDomainConfig()

			const cookieAttributes = [
				'path=/',
				domain && `domain=${domain}`,
				secure && 'secure',
				`samesite=${sameSite}`,
				'max-age=2592000' // 30 days
			]
				.filter(Boolean)
				.join('; ')

			console.log('Setting cookie:', {
				key,
				value,
				attributes: cookieAttributes
			})

			document.cookie = `${key}=${value}; ${cookieAttributes}`
		},
		removeItem: (key: string) => {
			const { domain } = getDomainConfig()
			const cookieAttributes = [
				'path=/',
				domain && `domain=${domain}`,
				'expires=Thu, 01 Jan 1970 00:00:00 GMT'
			]
				.filter(Boolean)
				.join('; ')

			console.log('Removing cookie:', {
				key,
				attributes: cookieAttributes
			})

			document.cookie = `${key}=; ${cookieAttributes}`
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
		console.log('Current cookies:', document.cookie)
		const state = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, document.cookie)
		console.log('Initial Wagmi state:', state)
		return state
	} catch (error) {
		console.error('Error parsing initial state:', error)
		return undefined
	}
}

// Log Wagmi configuration
console.log('Wagmi Configuration:', {
	projectId,
	chains,
	environment
})
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
				<React.StrictMode>
					<IpLocationChecker>
						<AppRoutes />
					</IpLocationChecker>
				</React.StrictMode>
			</QueryClientProvider>
		</WagmiProvider>
	</HelmetProvider>
)