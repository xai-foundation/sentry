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
import { cookieStorage, cookieToInitialState, createStorage, State } from '@wagmi/core'
import ErrorBoundary from './ErrorBoundary'

const { VITE_APP_ENV } = import.meta.env
const environment = VITE_APP_ENV === "development" ? "development" : "production"
const projectId = environment === "development" ? "79e38b4593d43c78d7e9ee38f0cdf4ee" : "543ba4882fc1d2e9a9ffe8bc1c473cf9"

declare global {
    interface Window {
      ethereum?: {
        on: (event: string, callback: (...args: string[]) => void) => void;
        removeListener: (event: string, callback: (...args: string[]) => void) => void;
        request: (args: { method: string; params?: string[] }) => Promise<string>;
        isMetaMask?: boolean;
      };
    }
  }
  

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
const logState = (message: string, state: State | undefined) => {
	console.group(`🔄 ${message}`);
	console.log('State:', state);
	console.log('Timestamp:', new Date().toISOString());
	console.groupEnd();
};

const logCookies = (message: string) => {
	console.group(`🍪 ${message}`);
	const cookies = document.cookie.split(';')
		.map(cookie => cookie.trim())
		.reduce((acc, cookie) => {
			const [key, value] = cookie.split('=');
			acc[key] = value;
			return acc;
		}, {} as Record<string, string>);
	console.log('Parsed Cookies:', cookies);
	console.log('Raw Cookies:', document.cookie);
	console.log('Timestamp:', new Date().toISOString());
	console.groupEnd();
};
// Create custom storage with smart cookie handling
const storage = createStorage({
	storage: {
		...cookieStorage,
		setItem: (key: string, value: string) => {
			const { domain, secure, sameSite } = getDomainConfig();

			const cookieAttributes = [
				'path=/',
				domain && `domain=${domain}`,
				secure && 'secure',
				`samesite=${sameSite}`,
				'max-age=2592000'
			]
				.filter(Boolean)
				.join('; ');

			console.group('📝 Setting Cookie');
			console.log('Key:', key);
			console.log('Value:', value);
			console.log('Attributes:', cookieAttributes);
			console.log('Domain Config:', getDomainConfig());
			console.log('Timestamp:', new Date().toISOString());

			document.cookie = `${key}=${value}; ${cookieAttributes}`;

			// Log cookies after setting
			logCookies('Cookies after setting');
			console.groupEnd();
		},
		removeItem: (key: string) => {
			const { domain } = getDomainConfig();
			const cookieAttributes = [
				'path=/',
				domain && `domain=${domain}`,
				'expires=Thu, 01 Jan 1970 00:00:00 GMT',
				'secure',
				'samesite=None'
			]
				.filter(Boolean)
				.join('; ');

			console.group('🗑️ Removing Cookie');
			console.log('Key:', key);
			console.log('Attributes:', cookieAttributes);
			console.log('Domain Config:', getDomainConfig());
			console.log('Timestamp:', new Date().toISOString());

			document.cookie = `${key}=; ${cookieAttributes}`;

			// Log cookies after removal
			logCookies('Cookies after removal');
			console.groupEnd();
		}
	}
});

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


// Enhanced getInitialState
const getInitialState = () => {
	try {
		console.group('🚀 Initializing Wagmi State');
		console.log('Initialization Start:', new Date().toISOString());

		logCookies('Pre-initialization Cookies');

		console.log('Wagmi Config:', {
			projectId,
			chains,
			environment,
			storage: wagmiAdapter.wagmiConfig.storage
		});

		const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, document.cookie);
		logState('Parsed Initial State', initialState);

		if (initialState?.current) {
			console.log('✅ Found active connection:', {
				connector: initialState.current,
				chainId: initialState.chainId
			});
		} else {
			console.log('❌ No active connection found in initial state');
		}

		console.groupEnd();
		return initialState;
	} catch (error) {
		console.group('❌ Initial State Error');
		console.error('Error parsing initial state:', error);
		console.error('Error details:', {
			error,
			cookies: document.cookie,
			config: wagmiAdapter.wagmiConfig,
			timestamp: new Date().toISOString()
		});
		console.groupEnd();
		return undefined;
	}
};
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


// Add these cleanup handlers for MetaMask events
if (typeof window !== 'undefined' && window.ethereum) {

	const handleChainChanged = (chainId: string) => {
		console.group('⛓️ MetaMask Chain Changed');
		console.log('New Chain ID:', chainId);
		console.log('Timestamp:', new Date().toISOString());
		logCookies('Cookies at chain change');
		console.groupEnd();
	};

	window.ethereum.on('chainChanged', handleChainChanged);

	// Cleanup listeners on page unload
	window.addEventListener('unload', () => {
		if (window.ethereum) {
			window.ethereum.removeListener('chainChanged', handleChainChanged);
		}
	});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<HelmetProvider context={{}}>
		<WagmiProvider
			config={wagmiAdapter.wagmiConfig as Config}
			initialState={getInitialState()}
		>
			<QueryClientProvider client={queryClient}>
				<ErrorBoundary
					fallback={({ error }) => {
						console.error('🔥 React Error:', {
							error,
							message: error.message,
							stack: error.stack,
							timestamp: new Date().toISOString()
						});
						return (
							<div className="p-4 text-red-600 bg-red-50 rounded-lg">
								<h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
								<p className="text-sm">{error.message}</p>
							</div>
						);
					}}
				>
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
				</ErrorBoundary>
			</QueryClientProvider>
		</WagmiProvider>
	</HelmetProvider>
);