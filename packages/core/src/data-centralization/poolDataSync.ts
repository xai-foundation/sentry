import mongoose from 'mongoose';
import { getPoolAddressesFromGraph } from '../subgraph/getPoolAddressesFromGraph.js';
import { updatePoolInDB } from './updatePoolInDB.js';

/**
 * Arguments required to initialize the data centralization runtime.
 * @param {string} mongoUri - The URI for connecting to MongoDB.
 * @param {(log: string) => void} [logFunction] - An optional logging function to capture runtime logs.
 */
interface PoolDataSyncArgs {
	mongoUri: string;
	logFunction?: (log: string) => void;
}

/**
 * Sync the databse with updated pool data when the referee config changed
 * @param {PoolDataSyncArgs} args - The arguments required for the runtime.
 * @returns {Promise<void>}
 */
export async function poolDataSync({
	mongoUri,
	logFunction = (_) => { }
}: PoolDataSyncArgs): Promise<void> {


	try {
		await mongoose.connect(mongoUri);
		logFunction(`Connected to MongoDB`);
	} catch (error) {
		logFunction(`Failed to connect to MongoDB: ${error}`);
		throw new Error(`Failed to connect to MongoDB: ${error}`);
	}

	const poolsAddresses = await getPoolAddressesFromGraph();

	logFunction("Found pools: " + poolsAddresses.length);
	for (let i = 0; i < poolsAddresses.length; i++) {
		const poolAddress = poolsAddresses[i];
		try {
			logFunction("Trying to update " + poolAddress);
			await updatePoolInDB(poolAddress, "UpdateMetadata");
			logFunction("Updated " + poolAddress)
		} catch (error) {
			logFunction("Errored " + poolAddress + "\n" + error)
		}
	}
}