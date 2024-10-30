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
type ConnectorState = {
	accounts: string[];
	chainId: number;
	connector: {
		id: string;
		name: string;
		type: string;
		uid: string;
	};
};


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
import { cookieStorage, cookieToInitialState, createStorage, type State } from '@wagmi/core'

// Environment Setup
const { VITE_APP_ENV } = import.meta.env
const environment = VITE_APP_ENV === "development" ? "development" : "production"
const projectId = environment === "development" ? "79e38b4593d43c78d7e9ee38f0cdf4ee" : "543ba4882fc1d2e9a9ffe8bc1c473cf9"

export const chains: [Chain, ...Chain[]] = [arbitrum as Chain]
if (environment === "development") chains.push(arbitrumSepolia as Chain)

// Logging utilities
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

// Domain configuration
const getDomainConfig = () => {
	const hostname = window.location.hostname;
	const isProduction = environment === 'production';

	console.log('Hostname check:', {
		full: hostname,
		isProduction,
		isDev: hostname.includes('cryptit.at')
	});

	if (isProduction) {
		return {
			domain: '.xai.games',
			secure: true,
			sameSite: 'None' as const
		};
	}

	if (hostname === 'localhost') {
		return {
			domain: undefined,
			secure: false,
			sameSite: 'Lax' as const
		};
	}

	return {
		domain: hostname.includes('cryptit.at') ? '.cryptit.at' : hostname,
		secure: true,
		sameSite: 'None' as const
	};
};

// Connector ID preservation
const getStoredConnectorId = (): string | null => {
	try {
		const cookieStore = document.cookie
			.split(';')
			.map(cookie => cookie.trim())
			.find(cookie => cookie.startsWith('wagmi.store='));

		if (cookieStore) {
			const storeValue = JSON.parse(decodeURIComponent(cookieStore.split('=')[1])) as {
				state: {
					connections: {
						__type: 'Map';
						value: [string, ConnectorState][];
					};
				};
			};

			if (storeValue?.state?.connections?.__type === 'Map' &&
				Array.isArray(storeValue.state.connections.value) &&
				storeValue.state.connections.value.length > 0) {
				const [[connectorId]] = storeValue.state.connections.value;
				return connectorId;
			}
		}
	} catch (error) {
		console.error('Error getting stored connector ID:', error);
	}
	return null;
};
// Storage setup with debouncing and ID preservation
const createDebouncedStorage = () => {
	const memoryStorage = new Map<string, string>();
	let timeoutId: number | null = null;
	const pendingWrites = new Map<string, string>();

	const flushWrites = () => {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
			timeoutId = null;
		}

		pendingWrites.forEach((value, key) => {
			try {
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

				console.group('📝 Setting Cookie (Batched)');
				console.log('Key:', key);
				console.log('Value:', value);
				console.log('Attributes:', cookieAttributes);
				console.log('Domain Config:', getDomainConfig());
				console.log('Timestamp:', new Date().toISOString());

				// If it's the wagmi.store, preserve the connector ID
				if (key === 'wagmi.store') {
					const existingId = getStoredConnectorId();
					if (existingId) {
						try {
							const parsed = JSON.parse(value) as { state: State };
							if (parsed.state?.connections instanceof Map && parsed.state.connections.size > 0) {
								const firstConnection = Array.from(parsed.state.connections.values())[0];
								parsed.state.connections = new Map([[existingId, firstConnection]]);
								parsed.state.current = existingId;
								value = JSON.stringify(parsed);
							}
						} catch (e) {
							console.error('Error preserving connector ID:', e);
						}
					}
				}

				document.cookie = `${key}=${value}; ${cookieAttributes}`;
				memoryStorage.set(key, value);

				logCookies('Cookies after setting');
				console.groupEnd();
			} catch (error) {
				console.warn('Cookie write failed, using memory storage:', error);
				memoryStorage.set(key, value);
			}
			pendingWrites.delete(key);
		});
	};

	return createStorage({
		storage: {
			getItem: async (key: string) => {
				try {
					if (key === 'wagmi.store') {
						const cookieValue = cookieStorage.getItem(key);
						if (cookieValue) {
							const existingId = getStoredConnectorId();
							if (existingId) {
								try {
									const parsed = JSON.parse(cookieValue) as { state: State };
									if (parsed.state?.connections instanceof Map && parsed.state.connections.size > 0) {
										const firstConnection = Array.from(parsed.state.connections.values())[0];
										parsed.state.connections = new Map([[existingId, firstConnection]]);
										parsed.state.current = existingId;
										return JSON.stringify(parsed);
									}
								} catch (e) {
									console.error('Error processing wagmi.store:', e);
								}
							}
							return cookieValue;
						}
					}
					const cookieValue = cookieStorage.getItem(key);
					if (cookieValue) return cookieValue;
					return memoryStorage.get(key) || null;
				} catch (error) {
					console.warn('Cookie access failed, using memory storage:', error);
					return memoryStorage.get(key) || null;
				}
			},
			setItem: (key: string, value: string) => {
				pendingWrites.set(key, value);
				if (timeoutId) {
					window.clearTimeout(timeoutId);
				}
				timeoutId = window.setTimeout(flushWrites, 100);
			},
			removeItem: (key: string) => {
				try {
					if (pendingWrites.has(key)) {
						pendingWrites.delete(key);
					}

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
					console.log('Timestamp:', new Date().toISOString());

					document.cookie = `${key}=; ${cookieAttributes}`;
					memoryStorage.delete(key);

					logCookies('Cookies after removal');
					console.groupEnd();
				} catch (error) {
					console.warn('Cookie removal failed:', error);
					memoryStorage.delete(key);
				}
			}
		}
	});
};

const storage = createDebouncedStorage();

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

		if (initialState && initialState.connections instanceof Map && initialState.connections.size > 0) {
			const existingId = getStoredConnectorId();
			if (existingId) {
				// Get the first connection's state
				const firstConnection = Array.from(initialState.connections.values())[0];

				// Create new Map with preserved ID
				initialState.connections.clear();
				initialState.connections.set(existingId, firstConnection);
				initialState.current = existingId;

				console.log('Restored connector ID:', existingId);
			}
		}

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

// Set up MetaMask event listeners
if (typeof window !== 'undefined' && window.ethereum) {

	const handleChainChanged = (chainId: string) => {
		console.group('⛓️ MetaMask Chain Changed');
		console.log('New Chain ID:', chainId);
		console.log('Timestamp:', new Date().toISOString());
		logCookies('Cookies at chain change');
		console.groupEnd();
	};

	window.ethereum.on('chainChanged', handleChainChanged);

	window.addEventListener('unload', () => {
		if (window.ethereum) {
			window.ethereum.removeListener('chainChanged', handleChainChanged);
		}
	});
}

// Initialize AppKit
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

// Render application
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
);