import mongoose from 'mongoose';
import { EventListenerError, resilientEventListener } from '../utils/resilientEventListener.js';
import { LogDescription } from 'ethers';
import { config } from '../config.js';
import { PoolFactoryAbi } from '../abis/PoolFactoryAbi.js';

/**
 * Arguments required to initialize the data centralization runtime.
 * @param {string} mongoUri - The URI for connecting to MongoDB.
 * @param {(log: string) => void} [logFunction] - An optional logging function to capture runtime logs.
 */
interface DataCentralizationRuntimeArgs {
	mongoUri: string;
	logFunction?: (log: string) => void;
}

/**
 * Initializes the data centralization runtime with MongoDB and event listeners.
 * @param {DataCentralizationRuntimeArgs} args - The arguments required for the runtime.
 * @returns {Promise<() => Promise<void>>} A function to stop the runtime.
 */
async function dataCentralizationRuntime({
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
	const events = [
		'PoolCreated',
		'StakeEsXai',
		'UnstakeEsXai',
		'StakeKeys',
		'UnstakeKeys',
		'UpdatePoolDelegate',
		'UnstakeRequestStarted',
		'UpdateShares',
	];

	const stopListener = resilientEventListener({
		rpcUrl: config.arbitrumOneWebSocketUrl,
		contractAddress: config.poolFactoryAddress,
		abi: PoolFactoryAbi,
		eventName: events,
		log: logFunction,
		callback: (log: LogDescription | null, err?: EventListenerError) => {
			if (err) {
				logFunction(`Error listening to event: ${err.message}`);
			} else if (log) {
				logFunction(`Event ${log.name} received: ${JSON.stringify(log.args)}`);
                switch(log.name) {
                    case "PoolCreated":
                    break;
                    case "StakeEsXai":
                    break;
                    case "UnstakeEsXai":
                    break;
                    case "StakeKeys":
                    break;
                    case "UnstakeKeys":
                    break;
                    case "UpdatePoolDelegate":
                    break;
                    case "UnstakeRequestStarted":
                    break;
                    case "UpdateShares":
                    break;
                }
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