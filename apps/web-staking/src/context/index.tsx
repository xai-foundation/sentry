'use client'

import { createAppKit } from '@reown/appkit/react'
import { arbitrum } from '@reown/appkit/networks'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import React, { ReactNode } from 'react'
import { config, networks, projectId, wagmiAdapter } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


// Setup queryClient
const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Xai App',
  description: 'Xai Games App',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://app.xai.games',
  icons: ['https://xai.games/images/delta%20med.svg']
}
// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: networks,
  defaultNetwork: arbitrum,
  metadata: metadata,
  features: {
    analytics: true,
    allWallets: true,
    smartSessions: true,
    socials: ['google', 'discord', 'github', 'x', 'facebook', 'apple', 'farcaster'],
    }
})

export function ContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const cookies = typeof window !== 'undefined' ? document.cookie : ''
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}