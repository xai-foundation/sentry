'use client'

import React, { ReactNode } from 'react'
import { wagmiAdapter, projectId } from '@/config'

import { createWeb3Modal } from '@web3modal/wagmi/react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Setup queryClient
const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Xai App',
  description: 'Xai Games App',
  url: 'https://app.xai.games/',
  icons: ['https://xai.games/images/delta%20med.svg']
}

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: process.env.NEXT_PUBLIC_APP_ENV === "development" ? [arbitrum, arbitrumSepolia] : [arbitrum],
  defaultNetwork: arbitrum,
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

// Create modal
// createWeb3Modal({
//   wagmiConfig: config,
//   projectId,
//   enableAnalytics: true, // Optional - defaults to your Cloud configuration
// })

export function ContextProvider({
  children,
  cookies
  // initialState
}: {
  children: ReactNode,
  cookies: string | null
  // initialState?: State
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}