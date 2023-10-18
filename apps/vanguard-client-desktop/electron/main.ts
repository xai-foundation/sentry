import { app, BrowserWindow, ipcMain, shell, safeStorage } from 'electron'
import fs from 'fs';
import path from 'path';
import express from 'express';

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

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

ipcMain.on('open-external', (_, url) => {
	void shell.openExternal(url);
});

ipcMain.handle('encrypt-string', async (_, plainText) => {
	return await safeStorage.encryptString(plainText);
});

ipcMain.handle('decrypt-string', async (_, encrypted) => {
	return await safeStorage.decryptString(encrypted);
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
		minWidth: 1024,
		minHeight: 900,
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
		// win.loadFile('dist/index.html')
		win.loadFile(path.join(process.env.DIST, 'index.html'))
	}
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
		win = null
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
app.on('ready', () => {
	const server = express();
	const publicWebPath = path.join(process.env.VITE_PUBLIC, '/web');
	server.use(express.static(publicWebPath));
	server.listen(7555);
})

app.whenReady().then(createWindow)
