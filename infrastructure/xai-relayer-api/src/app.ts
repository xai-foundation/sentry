import express from "express";
import { disconnectMongoose, loadMongoose } from "@/loaders/mongoose";
import { loadExpress } from "@/loaders/express";
import { resolve } from "path";
import dotenv from "dotenv";
dotenv.config({ path: resolve(__dirname, "../.env") });

export const app = express();

(async () => {
	await loadMongoose();
	await loadExpress();

	console.log("Starting at port", process.env.PORT);
	const server = app.listen(process.env.PORT, () => {
		console.log("\x1b[33m%s\x1b[0m", "[nodemon] server started - waiting for changes before restart");
	});

	async function gracefullyExit() {
		console.log("Exiting gracefully...");

		try {
			await Promise.allSettled([
				disconnectMongoose(),
				// closing express server
				server.close((error) => {
					if (error) {
						console.error(error);
						return;
					}

					console.log("Express server successfully stopped");
				}),
			]);

			console.log("Backend exited gracefully.");
		} catch {
			console.error("An error occurred while exiting gracefully.");
		}
	}

	// SIGTERM is sent from Google cloud run when the server is idle and will be shut down in the next 10 seconds
	process.on("SIGTERM", async () => {
		await gracefullyExit();
		process.exit(0);
	});

	// SIGUSR2 is sent from nodemon if running in dev mode
	process.on("SIGUSR2", async () => {
		await gracefullyExit();
		process.exit(0);
	});
})();
