'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'
import { WagmiProvider, type Config, deserialize, type State } from 'wagmi'

// Create a queryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Changed to true for real-time updates
      refetchOnMount: true,
      refetchOnReconnect: 'always',
      refetchInterval: false, // Don't poll by default
      staleTime: 15_000, // 15 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Xai App',
  description: 'Xai Games App',
  url: 'https://app.xai.games/',
  icons: ['https://xai.games/images/delta%20med.svg']
}

// Initialize AppKit only on client side
const initializeAppKit = () => {
  if (typeof window === 'undefined') return

  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: process.env.NEXT_PUBLIC_APP_ENV === "development" 
      ? [arbitrum, arbitrumSepolia] 
      : [arbitrum],
    defaultNetwork: arbitrum,
    metadata: {
      ...metadata,
      url: typeof window !== 'undefined' ? window.location.origin : 'https://app.xai.games'
    },
    features: {
      socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook', 'farcaster'],
      analytics: true
    }
  })
}

function getInitialState(): State | undefined {
  if (typeof window === 'undefined') return undefined
  
  try {
    const persistedState = localStorage.getItem('wagmi')
    if (!persistedState) return undefined
    
    return deserialize(persistedState) as State
  } catch (error) {
    console.error('Failed to get initial state from localStorage:', error)
    return undefined
  }
}

export function ContextProvider({
  children
}: {
  children: ReactNode
}) {  
  const wagmiConfig = wagmiAdapter.wagmiConfig as Config
  const [mounted, setMounted] = useState(false)
  
  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    initializeAppKit()
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <WagmiProvider config={wagmiConfig} initialState={getInitialState()}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}