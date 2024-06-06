import mongoose, { ConnectOptions, Connection } from "mongoose";

export async function disconnectMongoose(): Promise<void> {
	await mongoose.disconnect();
	console.log("Mongoose disconnected");
}

let cachedConnection: typeof mongoose;

export async function loadMongoose(): Promise<void> {
	if (cachedConnection) {
		return Promise.resolve();
	}
	mongoose.set("strictQuery", false);
	mongoose.set("applyPluginsToDiscriminators", true);

	const connectOptions: ConnectOptions = {
		user: process.env.MONGO_DB_USER,
		pass: process.env.MONGO_DB_PASS,
		dbName: process.env.MONGO_DB_DB_NAME,
		authSource: "admin",
		autoCreate: true,
		connectTimeoutMS: 30000,
		socketTimeoutMS: 30000,
		maxIdleTimeMS: 30000,
		waitQueueTimeoutMS: 30000,
		localThresholdMS: 30000,
		serverSelectionTimeoutMS: 30000,
	};

	let connected = false;
	let retries = 0;
	while (!connected && retries < 1) {
		try {
			cachedConnection = await mongoose.connect(process.env.MONGO_DB_URL, connectOptions);
			connected = true;
		} catch (error) {
			console.error("Error connecting to the Util MongoDB.", error);
			await new Promise((r) => setTimeout(r, Math.floor(4001 * Math.random() + 1000)));
			retries++;
		}
	}

	if (!connected) {
		throw new Error("Failed all retries to connect to Util MongoDB ");
	}
}
