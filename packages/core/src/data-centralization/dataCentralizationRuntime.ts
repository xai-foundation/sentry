import mongoose from 'mongoose';
import { EventListenerError, resilientEventListener } from '../utils/resilientEventListener.js';
import { LogDescription } from 'ethers';
import { config } from '../config.js';
import { PoolFactoryAbi } from '../abis/PoolFactoryAbi.js';
import { updatePoolInDB } from './updatePoolInDB.js';

/**
 * Arguments required to initialize the data centralization runtime.
 * @param {string} mongoUri - The URI for connecting to MongoDB.
 * @param {(log: string) => void} [logFunction] - An optional logging function to capture runtime logs.
 */
interface DataCentralizationRuntimeArgs {
	mongoUri: string;
	logFunction?: (log: string) => void;
}

const toSaveString = (obj: any) => {
	return JSON.stringify(obj, (key, value) =>
		typeof value === 'bigint'
			? value.toString()
			: value // return everything else unchanged
	);
}

/**
 * Initializes the data centralization runtime with MongoDB and event listeners.
 * @param {DataCentralizationRuntimeArgs} args - The arguments required for the runtime.
 * @returns {Promise<() => Promise<void>>} A function to stop the runtime.
 */
export async function dataCentralizationRuntime({
	mongoUri,
	logFunction = (_) => { }
}: DataCentralizationRuntimeArgs): Promise<() => Promise<void>> {

	// Establish a connection to MongoDB via mongoose.
	try {
		await mongoose.connect(mongoUri);
		logFunction(`Connected to MongoDB`);
	} catch (error) {
		logFunction(`Failed to connect to MongoDB: ${error}`);
		throw new Error(`Failed to connect to MongoDB: ${error}`);
	}

	// Establish a single event listener for multiple events for data centralization.
	// Map poolfactory event to index of pool address in event logs
	const eventToPoolAddressInLog: { [eventName: string]: number } = {
		'PoolCreated': 1,
		'StakeEsXai': 1,
		'UnstakeEsXai': 1,
		'StakeKeys': 1,
		'UnstakeKeys': 1,
		'UpdatePoolDelegate': 1,
		'UnstakeRequestStarted': 1,
		'UpdateShares': 0,
		'UpdateMetadata': 0
	}

	const stopListener = resilientEventListener({
		rpcUrl: config.arbitrumOneWebSocketUrl,
		contractAddress: config.poolFactoryAddress,
		abi: PoolFactoryAbi,
		eventName: Object.keys(eventToPoolAddressInLog),
		log: logFunction,
		callback: (log: LogDescription | null, err?: EventListenerError) => {
			if (err) {
				logFunction(`Error listening to event: ${err.message}`);
			} else if (log) {
				logFunction(`Event ${log.name} received: ${toSaveString(log.args)}`);

				const poolAddress = log.args[eventToPoolAddressInLog[log.name]];
				if (!poolAddress) {
					logFunction(`Error finding poolAddress on event ${log.name}`);
					return;
				}

				updatePoolInDB(poolAddress)
					.then(() => {
						logFunction("Updated pool:" + poolAddress)
					})
					.catch(err => {
						logFunction(`Error updating pool ${poolAddress} on event ${log.name}, error: ${err}`);
					});

			} else {
				logFunction(`Received null log description.`);
			}
		},
	}).stop;

	/**
	 * Stops the data centralization runtime.
	 * @returns {Promise<void>} A promise that resolves when the runtime is successfully stopped.
	 */
	return async () => {
		// Disconnect from MongoDB.
		await mongoose.disconnect();
		logFunction('Disconnected from MongoDB.');

		// Remove event listener listener.
		stopListener();
		logFunction('Event listener removed.');
	};
}