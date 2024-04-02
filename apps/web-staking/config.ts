import { http, createConfig } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { injected, safe, walletConnect } from 'wagmi/connectors'

const projectId = "8f5121741edc292ac7e4203b648d61e2"

export const config = createConfig({
  chains: [arbitrum],
  ssr: true,
  connectors: [
    injected(),
    walletConnect({ projectId }),
    safe(),
  ],
  transports: {
    [arbitrum.id]: http()
  },
})