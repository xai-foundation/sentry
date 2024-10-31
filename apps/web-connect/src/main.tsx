import React from 'react'
import ReactDOM from 'react-dom/client'
import { Config, cookieToInitialState, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { IpLocationChecker } from './features/ipchecker/IpLocationChecker'
import xaiThumbnail from './assets/images/xai-preview.jpg'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import App, { wagmiAdapter } from './app/App'

const helmetContext = {};
const queryClient = new QueryClient()

const cookies = typeof window !== 'undefined' ? document.cookie : ''
const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider context={helmetContext}>
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
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
          <base href={window.location.origin} />
        </Helmet>
        <React.StrictMode>
          <IpLocationChecker>
            <App />
          </IpLocationChecker>
        </React.StrictMode>
      </QueryClientProvider>
    </WagmiProvider>
  </HelmetProvider>
  )