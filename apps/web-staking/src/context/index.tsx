'use client'

import React, { ReactNode } from 'react'
import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'
import { cookieToInitialState, createConfig, WagmiProvider, type Config } from 'wagmi'
import { useEffect } from 'react'

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

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: process.env.NEXT_PUBLIC_APP_ENV === "development" 
    ? [arbitrum, arbitrumSepolia] 
    : [arbitrum],
  defaultNetwork: arbitrum,
  metadata: metadata,
  features: {
    analytics: true
  }
})

export function ContextProvider({
  children,
  cookies
}: {
  children: ReactNode,
  cookies: string | null
}) {  

  const wagmiConfig = wagmiAdapter.wagmiConfig as Config
  // Parse the initial state from cookies
  const initialState = cookies 
    ? cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
    : undefined;
  console.log('initialState', initialState);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}