import { sentryVitePlugin } from "@sentry/vite-plugin";
import {defineConfig} from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
		alias: [
			{
				find: "@",
				replacement: path.resolve(__dirname, "src"),
			},
			{
				find: 'crypto',
				replacement: 'crypto-js',
			},
		],
	},

    css: {
		postcss: {
			plugins: [
				tailwindcss,
				// autoprefixer({}) as any,
			],
		},
	},

    plugins: [react(), svgr(), electron({
        main: {
            // Shortcut of `build.lib.entry`.
            entry: 'electron/main.ts',
        },
        preload: {
            // Shortcut of `build.rollupOptions.input`.
            // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
            input: path.join(__dirname, 'electron/preload.ts'),
        },
        // Ployfill the Electron and Node.js built-in modules for Renderer process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
    }), sentryVitePlugin({
        org: "xai-foundation",
        project: "javascript-react",
		authToken: process.env.SENTRY_AUTH_TOKEN
    })],

    define: {
		'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version)
	},

    build: {
        sourcemap: true
    }
})
