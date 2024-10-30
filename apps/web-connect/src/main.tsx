
declare global {
  interface Window {
    ethereum?: {
      on: (event: string, callback: (...args: string[]) => void) => void;
      removeListener: (event: string, callback: (...args: string[]) => void) => void;
      request: (args: { method: string; params?: string[] }) => Promise<string>;
      isMetaMask?: boolean;
    };
    walletConnectProvider?: {
      isSameOrigin: boolean;
      shouldShimWeb3: boolean;
    };
  }
}

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
import { cookieStorage, createStorage } from '@wagmi/core'

// Environment and domain configuration
const environment = import.meta.env.VITE_APP_ENV === "development" ? "development" : "production"
const projectId = environment === "development" 
  ? "aa9e5ff297549e8d0cc518d085c28699" 
  : "543ba4882fc1d2e9a9ffe8bc1c473cf9"

const debugLogger = {
  logCookies: (event: string) => {
    if (environment === 'development') {
      console.group(`🍪 Cookie State: ${event}`)
      console.log('All Cookies:', document.cookie.split(';').map(c => c.trim()))
      const wagmiCookies = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith('wagmi.'))
      console.log('Wagmi Cookies:', wagmiCookies)
      console.groupEnd()
    }
  },
  
  logWalletState: (event: string) => {
    if (environment === 'development') {
      console.group(`👛 Wallet State: ${event}`)
      console.log('Ethereum Provider:', window.ethereum?.isMetaMask ? 'MetaMask' : 'Other/None')
    //  console.log('Connected Chain:', window.ethereum?.chainId)
      console.groupEnd()
    }
  }
}
// Then use it
if (typeof window !== 'undefined') {
  window.walletConnectProvider = {
    isSameOrigin: true,
    shouldShimWeb3: true
  };
}

if (typeof window !== 'undefined' && window.ethereum) {
  window.ethereum.on('chainChanged', () => {
    debugLogger.logWalletState('Chain Changed')
    debugLogger.logCookies('After Chain Change')
  })

  window.ethereum.on('accountsChanged', () => {
    debugLogger.logWalletState('Accounts Changed')
    debugLogger.logCookies('After Accounts Change')
  })
}

// Keep this configuration
const getDomain = () => {
  const hostname = window.location.hostname
  if (hostname === 'localhost') return undefined
  return hostname.includes('cryptit.at') ? '.cryptit.at' : '.xai.games'
}

const cookieConfig = {
  domain: getDomain(),
  path: '/',
  sameSite: 'strict' as const,
  secure: window.location.protocol === 'https:',
  maxAge: 30 * 24 * 60 * 60 // 30 days
}

// Chain Configuration
export const chains: [Chain, ...Chain[]] = [arbitrum as Chain]
if (environment === "development") chains.push(arbitrumSepolia as Chain)


// Safe initial state handling
const getInitialState = () => {
  try {
    const state = cookieStorage.getItem('wagmi.store');
    if (!state) return undefined;
    
    const parsed = JSON.parse(state);
    
    return parsed.state
  } catch (error) {
    console.error('Error parsing initial state:', error)
    return undefined
  }
};

// Wagmi Adapter with optimized configuration
const wagmiStorage = createStorage({
  storage: {
    ...cookieStorage,
    setItem: (key: string, value: string) => {
      // Different configuration for MetaMask cookies
      if (key.includes('metamask')) {
        document.cookie = `${key}=${value}; path=${cookieConfig.path}${
          cookieConfig.domain ? `; domain=${cookieConfig.domain}` : ''
        }; samesite=none; secure; max-age=${cookieConfig.maxAge}`
      } else {
        // Regular Wagmi cookies
        document.cookie = `${key}=${value}; path=${cookieConfig.path}${
          cookieConfig.domain ? `; domain=${cookieConfig.domain}` : ''
        }; samesite=${cookieConfig.sameSite}${
          cookieConfig.secure ? '; secure' : ''
        }; max-age=${cookieConfig.maxAge}`
      }
    }
  }
})

const debugWalletConnect = (projectId: string) => {
  if (environment === 'development') {
    console.group('🔗 WalletConnect Debug')
    console.log('Project ID:', projectId)
    console.log('Origin:', window.location.origin)
    console.log('Referrer:', document.referrer)
    console.log('Headers:', {
      origin: window.location.origin,
      host: window.location.host,
      pathname: window.location.pathname
    })
    console.groupEnd()
  }
}

// Add this right after declaring wagmiAdapter
if (typeof window !== 'undefined') {
  // Force same-origin context for WalletConnect
  window.walletConnectProvider = {
    isSameOrigin: true,
    shouldShimWeb3: true
  };
}

const debugState = (label: string) => {
  if (typeof window !== 'undefined') {
    const state = cookieStorage.getItem('wagmi.store');
    console.group(`🔄 Wagmi State: ${label}`);
    console.log('Raw State:', state);
    try {
      console.log('Parsed State:', state ? JSON.parse(state) : null);
    } catch (e) {
      console.log('Parse Error:', e);
    }
    console.groupEnd();
  }
};

// Add in your code:
debugState('Initial Load');

debugWalletConnect(projectId)

export const wagmiAdapter = new WagmiAdapter({
  storage: wagmiStorage,
  networks: chains,
  projectId,
  ssr: true,
  syncConnectedChain: true
})

// Query Client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5000,
      refetchOnWindowFocus: false
    }
  }
})

// Metadata
// const metadata = {
//   name: 'Xai Sentry Node',
//   description: 'Connect your wallet to the Xai Sentry Node',
//   //url: 'https://sentry.xai.games/',
//   url: window.location.origin,
//   icons: ['https://xai.games/images/delta%20med.svg'],
//   verifyUrl: window.location.origin, 
// }

// Initialize AppKit with error boundaries
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: environment === "development" ? [arbitrum, arbitrumSepolia] : [arbitrum],
  defaultNetwork: arbitrum,
  metadata: {
    name: 'Xai Sentry Node',
    description: 'Connect your wallet to the Xai Sentry Node',
    url: `${window.location.protocol}//${window.location.host}`,
    icons: ['https://xai.games/images/delta%20med.svg']
  },
  features: {
    analytics: true
  }
})
const headers = {
  'Referer': window.location.origin,
  'Origin': window.location.origin
}

// Add to debug logging
console.log('Custom Headers:', headers)

// Render Application
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
          <meta name="referrer" content="origin" />
          <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
          <meta httpEquiv="Set-Cookie" content="_sendc; SameSite=None; Secure" />
          <base href={window.location.origin} />
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