import {app, BrowserWindow, dialog, ipcMain, safeStorage, shell} from 'electron';
import os from 'os';
import fs from 'fs';
import path from 'path';
import express from 'express';
import net from "net";
import log from "electron-log";
import {autoUpdater} from 'electron-updater';

const isWindows = os.platform() === "win32";

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
// @ts-ignore
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoRunAppAfterInstall = true;
log.info('App starting...');

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | undefined | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

const protocolUrl = 'xai-sentry';
if (process.defaultApp) {
	if (process.argv.length >= 2) {
		app.setAsDefaultProtocolClient(protocolUrl, process.execPath, [path.resolve(process.argv[1])]);
	}
} else {
	app.setAsDefaultProtocolClient(protocolUrl);
}

ipcMain.on('open-external', (_, url) => {
	void shell.openExternal(url);
});

ipcMain.handle('encrypt-string', async (_, plainText) => {
	return safeStorage.encryptString(plainText);
});

ipcMain.handle('decrypt-string', async (_, encrypted) => {
	return safeStorage.decryptString(encrypted);
});

ipcMain.handle('is-encryption-available', () => {
	return safeStorage.isEncryptionAvailable();
});

ipcMain.handle('get-user-data-path', () => {
	return app.getPath('home');
});

ipcMain.handle('fs-writeFileSync', (_, path, data) => {
	fs.writeFileSync(path, data);
});

ipcMain.handle('fs-unlinkSync', (_, path) => {
	fs.unlinkSync(path);
});

ipcMain.handle('fs-readFileSync', (_, path, encoding?) => {
	return fs.readFileSync(path, encoding);
});

ipcMain.handle('fs-existsSync', (_, path) => {
	return fs.existsSync(path);
});

ipcMain.handle('path-join', (_, ...paths) => {
	return path.join(...paths);
});

ipcMain.handle('buffer-from', (_, str, encoding) => {
	return Buffer.from(str, encoding);
});

function createWindow() {
	win = new BrowserWindow({
		width: 1920,
		height: 1080,
		minWidth: 1650,
		minHeight: 900,
		autoHideMenuBar: true,
		icon: path.join(process.env.VITE_PUBLIC, 'xai-logo.svg'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	// Test active push message to Renderer-process.
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', (new Date).toLocaleString())
	})

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL)
	} else {
		win.loadFile(path.join(process.env.DIST, 'index.html'))
	}

	win.on('close', (e) => {
		const choice = dialog.showMessageBoxSync({
			type: 'question',
			buttons: ['Yes', 'No'],
			title: 'Confirm',
			message: 'Are you sure you want to quit? You will stop accruing rewards once you exit the client.'
		});

		if (choice === 1) {
			e.preventDefault();
		}
	});
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
		win = null;
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// When the app is ready, we are going to start a local web server to deploy the web-connect project
app.on('ready', async () => {
	const isPortOpen = async (port: number): Promise<boolean> => {
		return new Promise((resolve) => {
			const s = net.createServer();
			s.once('error', (err) => {
				s.close();
				if (err["code"] == "EADDRINUSE") {
					resolve(false);
				} else {
					resolve(false); // or throw error!!
					// reject(err); 
				}
			});
			s.once('listening', () => {
				resolve(true);
				s.close();
			});
			s.listen(port);
		});
	}

	// on windows, the server gets started multiple times when it shouldn't
	if (!(await isPortOpen(8080))) {
		return;
	}

	const server = express();
	const publicWebPath = path.join(process.env.VITE_PUBLIC, '/web');
	server.use(express.static(publicWebPath)); // takes dir, makes root
	server.get("/*", (_, res) => {
		res.sendFile(path.join(publicWebPath, "index.html")) // force web to load index.html
	})
	server.listen(8080);
});

app.on('ready', function()  {
	autoUpdater.checkForUpdatesAndNotify();
});

setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
}, 1000 * 60 * 5);

// autoUpdater.on('checking-for-update', () => {
// 	win?.webContents.send("update-message", "checking-for-update");
// });
autoUpdater.on('update-available', () => {
	win?.webContents.send("update-available");
});
// autoUpdater.on('update-not-available', () => {
// 	win?.webContents.send("update-message", "update-not-available");
// });
autoUpdater.on('error', (err) => {
	win?.webContents.send("update-error", err.message);
});
// autoUpdater.on('download-progress', (progressObj) => {
// 	let logMessage = "Download speed: " + progressObj.bytesPerSecond;
// 	logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
// 	logMessage = logMessage + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
// 	win?.webContents.send("update-message", logMessage);
// });
autoUpdater.on('update-downloaded', () => {
	// win?.webContents.send("update-message", "update-downloaded");
	autoUpdater.quitAndInstall(true, true);
});

// Windows deep-link
if (isWindows) {
	const gotTheLock = app.requestSingleInstanceLock();
	if (!gotTheLock) {
		app.quit();
	} else {
		app.on('second-instance', (event, commandLine) => {
			// Someone tried to run a second instance, we should focus our window.
			if (win) {
				if (win.isMinimized()) win.restore();
				win.focus();
			}
			// the commandLine is array of strings in which last element is deep link url
			// dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop()}`);

			// win?.webContents.send("assigned-wallet", commandLine.pop());
			handleDeeplink(event, commandLine.pop());
		})

		// Create mainWindow, load the rest of the app, etc...
		app.whenReady().then(createWindow);
	}
} else {
	// Mac deep-link
	app.whenReady().then(createWindow);
	app.on('open-url', handleDeeplink);
}

function handleDeeplink(_, url) {
	const fullProtocol = "xai-sentry://";
	const instruction = url.slice(fullProtocol.length, url.indexOf("?"));
	let txHash: string;

	switch (instruction) {
		case "assigned-wallet/":
		case "assigned-wallet":
			txHash = url.slice(url.indexOf("=") + 1);
			win?.webContents.send("assigned-wallet", txHash);
			break;
		case "unassigned-wallet/":
		case "unassigned-wallet":
			txHash = url.slice(url.indexOf("=") + 1);
			win?.webContents.send("unassigned-wallet", txHash);
			break;
		case "purchase-successful/":
		case "purchase-successful":
			txHash = url.slice(url.indexOf("=") + 1);
			win?.webContents.send("purchase-successful", txHash);
			break;
	}
}
