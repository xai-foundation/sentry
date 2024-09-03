import mongoose from 'mongoose';
import { EventListenerError, resilientEventListener } from '../utils/resilientEventListener.js';
import { LogDescription, getAddress } from 'ethers';
import { config } from '../config.js';
import { PoolFactoryAbi } from '../abis/PoolFactoryAbi.js';
import { updatePoolInDB } from './updatePoolInDB.js';
import { retry } from '../utils/retry.js';
import { listenForChallenges } from '../operator/listenForChallenges.js';
import { Challenge } from '../challenger/getChallenge.js';
import { IPool, PoolSchema } from './types.js';
import { getRewardRatesFromGraph } from '../subgraph/getRewardRatesFromGraph.js';
import { sendSlackNotification } from '../utils/sendSlackNotification.js';

/**
 * Arguments required to initialize the data centralization runtime.
 * @param {string} mongoUri - The URI for connecting to MongoDB.
 * @param {(log: string) => void} [logFunction] - An optional logging function to capture runtime logs.
 */
interface DataCentralizationRuntimeArgs {
	mongoUri: string;
	slackWebHookUrl: string;
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
	slackWebHookUrl,
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

				retry(() => updatePoolInDB(poolAddress, log.name), 3)
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

	const closeChallengeListener = listenForChallenges(
		async (challengeNumber: bigint, challenge: Challenge, event?: any) => {
			try {
				const startTime = new Date().getTime();
				const PoolModel = mongoose.models.Pool || mongoose.model<IPool>('Pool', PoolSchema);

				const slackStartMessage = `Starting pool sync update for challenge ${challengeNumber}`;
				await sendSlackNotification(slackWebHookUrl, slackStartMessage, logFunction);

				const graphUpdateStartTime = new Date().getTime();

				const updatedPools = await retry(() => getRewardRatesFromGraph([]));

				const graphUpdateEndTime = new Date().getTime();

				const mongoInsertStartTime = new Date().getTime();

				for (const updatedPool of updatedPools) {
					const checksumAddress = getAddress(updatedPool.poolAddress);

					await PoolModel.updateOne(
						{ poolAddress: checksumAddress },
						{
							$set: {
								esXaiRewardRate: updatedPool.averageDailyEsXaiReward,
								keyRewardRate: updatedPool.averageDailyKeyReward,
								totalEsXaiClaimed: updatedPool.totalEsXaiClaimed
							}
						},
					);
				}
				const mongoInsertEndTime = new Date().getTime();
				const totalSeconds = mongoInsertEndTime - startTime;
				const totalGraphSeconds = graphUpdateEndTime - graphUpdateStartTime;
				const totalMongoSeconds = mongoInsertEndTime - mongoInsertStartTime;
				const slackMessage = `Finished pool sync update for ${updatedPools.length} pools in ${totalSeconds}ms. Graph update took ${totalGraphSeconds}ms. Mongo insert took ${totalMongoSeconds}ms.`;

				await sendSlackNotification(slackWebHookUrl, slackMessage, logFunction);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				const slackMessage = `<!channel> Error in challenge listener: ${errorMessage}`;
				await sendSlackNotification(slackWebHookUrl, slackMessage, logFunction);
				logFunction(`Error in challenge listener: ${errorMessage}`);
			}
		},
		async (error: Error) => {
			const errorMessage = `Error in listenForChallenges: ${error.message}`;
			const slackMessage = `<!channel> Error in challenge listener: ${errorMessage}`;
			await sendSlackNotification(slackWebHookUrl, slackMessage, logFunction);
			logFunction(errorMessage);
		}
	);

	/**
	 * Stops the data centralization runtime.
	 * @returns {Promise<void>} A promise that resolves when the runtime is successfully stopped.
	 */
	return async () => {
		try {
			// Disconnect from MongoDB.
			await mongoose.disconnect();
			logFunction('Disconnected from MongoDB.');
			closeChallengeListener();
			// Remove event listener listener.
			stopListener();
			logFunction('Event listener removed.');
		} catch (error) {
			logFunction(`Error stopping the data centralization runtime: ${error}`);
		}
	};
}
