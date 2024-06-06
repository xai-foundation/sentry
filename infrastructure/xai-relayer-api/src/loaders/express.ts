import { app } from "@/app";
import cors from "cors";
import { json, urlencoded, Request, Response, NextFunction } from "express";

export async function loadExpress() {
	app.enable("trust proxy");

	app.use(
		cors({
			origin: (origin, callback) => {
				callback(null, true);
			},
		}),
	);

	app.use((req: Request, res: Response, next: NextFunction) => {
		json()(req, res, next);
	});

	app.use(
		urlencoded({
			extended: true
		}),
	);

	await import("@/api/routes");

	app.all("*", (req, res) => res.sendStatus(404));

	app.use((error: any, req: Request, res: Response, next: NextFunction) => {
		const currentDate = Date.now();
		console.error("Error Timestamp:", currentDate, "\n", error);

		return res.status(400).send({
			message: error.message || error
		});
	});
}
