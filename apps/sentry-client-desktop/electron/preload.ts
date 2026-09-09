import {contextBridge, ipcRenderer} from 'electron';
// import {useSetAtom} from "jotai";
// import {assignedWalletModalAtom} from "../src/components/DeepLinkManager";

// --------- Expose some API to the Renderer process ---------
//
// Only the three methods the renderer actually uses are exposed, and each is
// declared explicitly.
//
// This previously exposed the whole ipcRenderer object, patched by a helper that
// copied its prototype methods onto the instance with Object.entries(). That only
// sees enumerable properties. Electron's ipcRenderer methods are not enumerable,
// so the helper copied nothing, contextBridge received an object with no
// functions on it, and every call failed with
// "window.ipcRenderer.on is not a function".

type IpcListener = (...args: unknown[]) => void;

// contextBridge hands the preload a proxy for each renderer function and returns
// the same proxy for the same underlying function, so a listener can be looked up
// again when the renderer asks to remove it. Keyed by listener, then by channel,
// because the same function may be registered on more than one channel.
const listenerWrappers = new WeakMap<IpcListener, Map<string, (...args: any[]) => void>>();

contextBridge.exposeInMainWorld('ipcRenderer', {
	invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),

	// The IpcRendererEvent is deliberately not forwarded. It carries the sender and
	// its message ports, which are not cloneable across the context bridge. Listeners
	// receive only the payload.
	on: (channel: string, listener: IpcListener) => {
		const wrapper = (_event: unknown, ...args: unknown[]) => listener(...args);

		let byChannel = listenerWrappers.get(listener);
		if (!byChannel) {
			byChannel = new Map();
			listenerWrappers.set(listener, byChannel);
		}
		byChannel.set(channel, wrapper);

		ipcRenderer.on(channel, wrapper);
	},

	removeListener: (channel: string, listener: IpcListener) => {
		const byChannel = listenerWrappers.get(listener);
		const wrapper = byChannel?.get(channel);
		if (!wrapper) return;

		ipcRenderer.removeListener(channel, wrapper);
		byChannel!.delete(channel);
	},
});

contextBridge.exposeInMainWorld(
	'electron',
	{
		openExternal: (url: string) => ipcRenderer.send('open-external', url),
		platform: process.platform,
	}
);

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
	return new Promise(resolve => {
		if (condition.includes(document.readyState)) {
			resolve(true)
		} else {
			document.addEventListener('readystatechange', () => {
				if (condition.includes(document.readyState)) {
					resolve(true)
				}
			})
		}
	})
}

const safeDOM = {
	append(parent: HTMLElement, child: HTMLElement) {
		if (!Array.from(parent.children).find(e => e === child)) {
			parent.appendChild(child)
		}
	},
	remove(parent: HTMLElement, child: HTMLElement) {
		if (Array.from(parent.children).find(e => e === child)) {
			parent.removeChild(child)
		}
	},
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
	const className = `loaders-css__square-spin`
	const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `

	const oStyle = document.createElement('style')
	const oDiv = document.createElement('div')

	oStyle.id = 'app-loading-style'
	oStyle.innerHTML = styleContent
	oDiv.className = 'app-loading-wrap'
	oDiv.innerHTML = `<div class="${className}"><div></div></div>`

	return {
		appendLoading() {
			safeDOM.append(document.head, oStyle)
			safeDOM.append(document.body, oDiv)
		},
		removeLoading() {
			safeDOM.remove(document.head, oStyle)
			safeDOM.remove(document.body, oDiv)
		},
	}
}

// ----------------------------------------------------------------------

const {appendLoading, removeLoading} = useLoading();
domReady().then(appendLoading)

window.onmessage = ev => {
	ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)

contextBridge.exposeInMainWorld('deeplinks', {
	assignedWallet: (callback: (_event, txHash) => void) => ipcRenderer.on("assigned-wallet", callback),
	unassignedWallet: (callback: (_event, txHash) => void) => ipcRenderer.on("unassigned-wallet", callback),
	purchaseSuccessful: (callback: (_event, txHash) => void) => ipcRenderer.on("purchase-successful", callback),
	// updateMessage: (callback: (_event, txHash) => void) => ipcRenderer.on("update-message", callback),
	updateAvailable: (callback: (_event, txHash) => void) => ipcRenderer.on("update-available", callback),
	updateError: (callback: (_event, txHash) => void) => ipcRenderer.on("update-error", callback),
});

// ipcRenderer.on("test", (event, url) => {
// 	const setAssignedWalletModalState = useSetAtom(assignedWalletModalAtom);
// 	console.log(event);
// 	// alert(url);
// 	setAssignedWalletModalState(url);
// });
