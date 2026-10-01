import mongoose from 'mongoose';
import { formatEther } from 'ethers';
import { config } from '../config.js';
import { getChallengeEmissionsFromGraph, ChallengeEmission } from '../subgraph/getChallengeEmissionsFromGraph.js';
import { IEsXaiEmissionDaily, EsXaiEmissionDailySchema } from './types.js';

const DAY_IN_SECONDS = 24 * 60 * 60;

/** Number of trailing UTC days that are recomputed on every incremental sync (covers subgraph lag and late claims). */
export const ESXAI_EMISSION_RESYNC_DAYS = 3;

interface SyncEsXaiEmissionsArgs {
	/** When given, a mongoose connection is opened for the sync and closed afterwards. Omit when a connection is already open (runtime). */
	mongoUri?: string;
	/** Unix timestamp (seconds). Every UTC day from the day containing this timestamp up to now is recomputed. Defaults to everything. */
	fromTimestamp?: number;
	logFunction?: (log: string) => void;
}

export interface SyncEsXaiEmissionsResult {
	days: number;
	challenges: number;
}

export function getEsXaiEmissionDailyModel() {
	return mongoose.models.EsXaiEmissionDaily || mongoose.model<IEsXaiEmissionDaily>('EsXaiEmissionDaily', EsXaiEmissionDailySchema);
}

/**
 * Returns the unix timestamp (seconds) of the start of the UTC day that lies `daysBack` days before now.
 */
export function getUtcDayStart(daysBack: number = 0): number {
	const now = Math.floor(Date.now() / 1000);
	return Math.floor(now / DAY_IN_SECONDS) * DAY_IN_SECONDS - daysBack * DAY_IN_SECONDS;
}

const toDayKey = (timestamp: number): string => new Date(timestamp * 1000).toISOString().slice(0, 10);

type DailyBucket = {
	allocated: bigint;
	minted: bigint;
	gasSubsidy: bigint;
	count: number;
	first: bigint;
	last: bigint;
};

/**
 * Groups challenges by UTC day of their creation timestamp.
 */
export function aggregateChallengesByDay(challenges: ChallengeEmission[]): Map<string, DailyBucket> {
	const buckets = new Map<string, DailyBucket>();
	for (const c of challenges) {
		const day = toDayKey(c.createdTimestamp);
		const bucket = buckets.get(day) || { allocated: 0n, minted: 0n, gasSubsidy: 0n, count: 0, first: c.challengeNumber, last: c.challengeNumber };
		bucket.allocated += c.rewardAmountForClaimers;
		bucket.minted += c.amountClaimedByClaimers;
		bucket.gasSubsidy += c.amountForGasSubsidy;
		bucket.count += 1;
		if (c.challengeNumber < bucket.first) bucket.first = c.challengeNumber;
		if (c.challengeNumber > bucket.last) bucket.last = c.challengeNumber;
		buckets.set(day, bucket);
	}
	return buckets;
}

/**
 * Syncs the daily esXAI emission aggregates from the subgraph into MongoDB.
 * Uses the open mongoose connection of the caller unless a mongoUri is given.
 * Days are recomputed from scratch from the challenges the subgraph returns, so the function is idempotent.
 *
 * @param {SyncEsXaiEmissionsArgs} args - The sync arguments.
 * @returns {Promise<SyncEsXaiEmissionsResult>} Number of days written and challenges processed.
 */
export async function syncEsXaiEmissions({
	mongoUri,
	fromTimestamp = 0,
	logFunction = (_) => { }
}: SyncEsXaiEmissionsArgs = {}): Promise<SyncEsXaiEmissionsResult> {

	if (mongoUri) {
		await mongoose.connect(mongoUri);
		logFunction(`Connected to MongoDB`);
		try {
			return await syncEsXaiEmissions({ fromTimestamp, logFunction });
		} finally {
			await mongoose.disconnect();
			logFunction(`Disconnected from MongoDB`);
		}
	}

	const from = Math.floor(fromTimestamp / DAY_IN_SECONDS) * DAY_IN_SECONDS;
	logFunction(`Syncing esXAI emissions from ${toDayKey(from)} (network ${config.defaultNetworkName})`);

	const challenges = await getChallengeEmissionsFromGraph(from);
	logFunction(`Loaded ${challenges.length} challenges from subgraph`);

	const buckets = aggregateChallengesByDay(challenges);
	const EsXaiEmissionDailyModel = getEsXaiEmissionDailyModel();
	const now = new Date();

	for (const [day, bucket] of buckets) {
		await EsXaiEmissionDailyModel.updateOne(
			{ network: config.defaultNetworkName, day },
			{
				$set: {
					allocatedEsXai: Number(formatEther(bucket.allocated)),
					mintedEsXai: Number(formatEther(bucket.minted)),
					gasSubsidyXai: Number(formatEther(bucket.gasSubsidy)),
					challengeCount: bucket.count,
					firstChallengeNumber: Number(bucket.first),
					lastChallengeNumber: Number(bucket.last),
					updatedAt: now
				},
				$setOnInsert: { createdAt: now }
			},
			{ upsert: true }
		);
	}

	logFunction(`Wrote ${buckets.size} daily esXAI emission documents`);
	return { days: buckets.size, challenges: challenges.length };
}
