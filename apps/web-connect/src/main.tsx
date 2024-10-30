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

// Environment Configuration
const environment = import.meta.env.VITE_APP_ENV === "development" ? "development" : "production"
const projectId = environment === "development" 
  ? "79e38b4593d43c78d7e9ee38f0cdf4ee" 
  : "543ba4882fc1d2e9a9ffe8bc1c473cf9"

// Chain Configuration
export const chains: [Chain, ...Chain[]] = [arbitrum as Chain]
if (environment === "development") chains.push(arbitrumSepolia as Chain)

// Simple Connector ID Management
const CONNECTOR_KEY = 'wagmi.connector.id'

const getStoredConnectorId = (): string | null => {
  return localStorage.getItem(CONNECTOR_KEY)
}

const setStoredConnectorId = (id: string): void => {
  localStorage.setItem(CONNECTOR_KEY, id)
}

// Enhanced Storage
const storage = createStorage({
  storage: {
    ...cookieStorage,
    getItem: async (key: string) => {
      const value = cookieStorage.getItem(key)
      if (key === 'wagmi.store' && value) {
        try {
          const parsed = JSON.parse(value)
          const savedConnectorId = getStoredConnectorId()
          
          if (savedConnectorId && 
              parsed?.state?.connections?.__type === 'Map' && 
              Array.isArray(parsed.state.connections.value) && 
              parsed.state.connections.value.length > 0) {
            const connectionData = parsed.state.connections.value[0][1]
            parsed.state.connections.value = [[savedConnectorId, connectionData]]
            parsed.state.current = savedConnectorId
            return JSON.stringify(parsed)
          }
        } catch (error) {
          // Silently handle parse errors
        }
      }
      return value
    },
    setItem: (key: string, value: string) => {
      if (key === 'wagmi.store') {
        try {
          const parsed = JSON.parse(value)
          if (parsed?.state?.connections?.__type === 'Map' && 
              Array.isArray(parsed.state.connections.value) && 
              parsed.state.connections.value.length > 0) {
            const connectorId = parsed.state.connections.value[0][0]
            if (connectorId) {
              setStoredConnectorId(connectorId)
            }
          }
        } catch (error) {
          // Silently handle parse errors
        }
      }
      cookieStorage.setItem(key, value)
    },
    removeItem: (key: string) => {
      if (key === 'wagmi.store') {
        localStorage.removeItem(CONNECTOR_KEY)
      }
      cookieStorage.removeItem(key)
    }
  }
})

// Safe Initial State
const getInitialState = () => {
  try {
    const state = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, document.cookie)
    if (!state) return undefined

    const savedConnectorId = getStoredConnectorId()
    if (!savedConnectorId) return state

    if (state.connections instanceof Map && state.connections.size > 0) {
      const firstConnection = Array.from(state.connections.values())[0]
      if (firstConnection) {
        state.connections.clear()
        state.connections.set(savedConnectorId, firstConnection)
        state.current = savedConnectorId
      }
    }

    return state
  } catch (error) {
    return undefined
  }
}

// Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  storage,
  networks: chains,
  projectId,
  ssr: true
})

// Query Client
const queryClient = new QueryClient()

// Metadata
const metadata = {
  name: 'Xai Sentry Node',
  description: 'Connect your wallet to the Xai Sentry Node',
  url: 'https://sentry.xai.games/',
  icons: ['https://xai.games/images/delta%20med.svg']
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