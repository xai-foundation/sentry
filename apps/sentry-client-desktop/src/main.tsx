// main.tsx
import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import {AppRoutes} from './features/router'
import "./index.css";

const rootElement = document.getElementById('root')!
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
	console.log(message)
})
