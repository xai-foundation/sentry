// main.tsx
import {StrictMode, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import {AppRoutes} from './features/router'
import * as Sentry from "@sentry/react";
import {HttpClient} from "@sentry/integrations";
import "./index.css";
import {createRoutesFromChildren, matchRoutes, useLocation, useNavigationType} from "react-router-dom";
import log from "electron-log";

const rootElement = document.getElementById('root')!

Sentry.init({
	release: import.meta.env.APP_VERSION,
	dsn: "https://a72bd57d284f8711761b36655e40b65e@o4506378569777152.ingest.sentry.io/4506378571612160",

	integrations: [
		new Sentry.BrowserTracing({
			// See docs for support of different versions of variation of react router
			// https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
			routingInstrumentation: Sentry.reactRouterV6Instrumentation(
				useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes
			),
		}),
		// Following are true by default: maskAllText: true, blockAllMedia: true,
		new Sentry.Replay(),

		new HttpClient()
	],
	// Performance Monitoring
	tracesSampleRate: 0.1, // Capture 10% of the transactions
	tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/], // Control for which URLs distributed tracing should be enabled

	// Session Replay
	replaysSessionSampleRate: 0.1, // Sample rate = 10%.
	replaysOnErrorSampleRate: 1.0, // Sample rate= 100% where errors occur.
	
	sendDefaultPii: true, // This option is required for capturing headers and cookies.
});

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<AppRoutes/>
		</StrictMode>,
	)
}

// Remove Preload scripts loading
postMessage({payload: 'removeLoading'}, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
	log.info(message)
})
