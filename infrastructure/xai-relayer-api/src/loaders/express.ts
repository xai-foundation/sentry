import { app } from "@/app";
import cors from "cors";

export async function loadExpress() {
	app.enable("trust proxy");

	app.use(
		cors({
			origin: (origin, callback) => {
				callback(null, true);
			},
		}),
	);

	await import("@/api/routes");

	app.all("*", (req, res) => res.sendStatus(404));
}
