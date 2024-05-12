import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import path from "node:path";

export default defineConfig({
	define: {
	  'process.env': process.env
	},
	resolve: {
		alias: [
			{
				find: "@",
				replacement: path.resolve(__dirname, "src"),
			},
			// Add any specific aliases here if needed for wagmi or other packages
		],
	},
	plugins: [
		react(),
		svgr()
	],
	build: {
		rollupOptions: {
			// If there are specific external packages causing issues, configure them here
		},
		commonjsOptions: {
			include: [/node_modules/], // Include all node_modules by default, adjust as necessary
			transformMixedEsModules: true, // Enable transformation of mixed ES modules
		},
	},
	optimizeDeps: {
		include: ["@wagmi/core"], // Explicitly include @wagmi/core for optimization
	},
})
