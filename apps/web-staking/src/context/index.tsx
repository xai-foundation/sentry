'use client'

import React, { ReactNode, useEffect } from 'react'
import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit, useAppKitState, useWalletInfo } from '@reown/appkit/react'
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitEvents } from '@reown/appkit/react'

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
    analytics: true
  }
})
const { open, selectedNetworkId, loading, activeChain } = modal.getState()



export function ContextProvider({
  children,
  cookies
}: {
  children: ReactNode,
  cookies: string | null
}) {
  const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const { walletInfo } = useWalletInfo();
  const { open, selectedNetworkId } = useAppKitState();
  const events = useAppKitEvents();
  //console.log('events', events);
  
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  useEffect(() => {
    // console.log('initialState', initialState)
    // console.log('selectedNetworkId', selectedNetworkId, loading, activeChain);
    // console.log('address', address, isConnected, caipAddress, status);
    // console.log('walletInfo', walletInfo);
    // console.log('open', open, selectedNetworkId);
  } , [initialState])

  //console.log('initialState', initialState)
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}