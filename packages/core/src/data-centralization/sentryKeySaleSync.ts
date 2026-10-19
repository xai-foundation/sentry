import mongoose from 'mongoose';
import { config } from '../config.js';
import {
	getFirstKeyIdMintedSinceFromGraph,
	getLatestKeyIdFromGraph,
	getSentryKeyMintTimestampFromGraph,
	getSentryKeyMintsFromGraph
} from '../subgraph/getSentryKeyMintBoundariesFromGraph.js';
import { ISentryKeySaleDaily, SentryKeySaleDailySchema } from './types.js';
import { getUtcDayStart } from './esXaiEmissionSync.js';

const DAY_IN_SECONDS = 24 * 60 * 60;
const PAGE_SIZE = 1000;

/** Unix timestamp of the first Sentry Key mint on Arbitrum One (key id 1, 2023-12-05). */
const FIRST_KEY_MINT_TIMESTAMP = 1701809037;

/**
 * The tiny keys airdrop (1:100 key split) per network. Taken from the TinyKeysAirdrop contract events on
 * Arbitrum One (0x0209a0C0Abfe82916DF492D121667aCcA26C7eb0): AirdropStarted at block 283359875
 * (2024-12-10 15:28 UTC) with totalSupplyAtStart 35180 and keyMultiplier 99, AirdropEnded at block 284163061
 * (2024-12-13 01:23 UTC). Minting was disabled while the airdrop ran, so every key id in
 * (totalSupplyAtStart, totalSupplyAtStart * (keyMultiplier + 1)] was minted by the airdrop and is not a sale.
 */
export const TINY_KEYS_AIRDROP: { [network: string]: { lastKeyIdBeforeSplit: bigint; lastAirdropKeyId: bigint; keyMultiplier: number } } = {
	arbitrum: {
		lastKeyIdBeforeSplit: 35180n,
		lastAirdropKeyId: 35180n * 100n,
		keyMultiplier: 100
	}
};

interface SyncSentryKeySalesArgs {
	/** When given, a mongoose connection is opened for the sync and closed afterwards. Omit when a connection is already open (runtime). */
	mongoUri?: string;
	/** Unix timestamp (seconds). Every UTC day from the day containing this timestamp up to now is recomputed. Defaults to the first key mint. */
	fromTimestamp?: number;
	logFunction?: (log: string) => void;
}

export interface SyncSentryKeySalesResult {
	days: number;
	keys: number;
}

type DailyBucket = { sold: bigint; airdrop: bigint; preSplit: boolean; first: bigint; last: bigint };

export function getSentryKeySaleDailyModel() {
	return mongoose.models.SentryKeySaleDaily || mongoose.model<ISentryKeySaleDaily>('SentryKeySaleDaily', SentryKeySaleDailySchema);
}

const toDayKey = (timestamp: number): string => new Date(timestamp * 1000).toISOString().slice(0, 10);
const dayStartOf = (timestamp: number): number => Math.floor(timestamp / DAY_IN_SECONDS) * DAY_IN_SECONDS;

const emptyBucket = (): DailyBucket => ({ sold: 0n, airdrop: 0n, preSplit: false, first: 0n, last: 0n });

const noteKey = (bucket: DailyBucket, keyId: bigint) => {
	if (bucket.first === 0n || keyId < bucket.first) bucket.first = keyId;
	if (keyId > bucket.last) bucket.last = keyId;
};

/**
 * Loads every key with id in (afterKeyId, toKeyId] page by page and counts it on its mint day as a sale.
 */
async function collectSoldKeys(afterKeyId: bigint, toKeyId: bigint, preSplit: boolean, buckets: Map<string, DailyBucket>, logFunction: (log: string) => void): Promise<number> {
	let cursor = afterKeyId;
	let count = 0;
	while (cursor < toKeyId) {
		const page = await getSentryKeyMintsFromGraph(cursor, toKeyId, PAGE_SIZE);
		for (const key of page) {
			const day = toDayKey(key.mintTimeStamp);
			const bucket = buckets.get(day) || emptyBucket();
			bucket.sold += 1n;
			bucket.preSplit = preSplit;
			noteKey(bucket, key.keyId);
			buckets.set(day, bucket);
		}
		count += page.length;
		if (page.length < PAGE_SIZE) break;
		cursor = page[page.length - 1].keyId;
		if (count % 20000 === 0) logFunction(`Loaded ${count} keys (cursor ${cursor})`);
	}
	return count;
}

/**
 * Attributes the airdrop key ids to the UTC days they were minted on. The airdrop spans only a few days, so one
 * timestamp based boundary query per day is affordable.
 */
async function collectAirdropKeys(firstAirdropKeyId: bigint, lastAirdropKeyId: bigint, buckets: Map<string, DailyBucket>): Promise<void> {
	const startTs = await getSentryKeyMintTimestampFromGraph(firstAirdropKeyId);
	const endTs = await getSentryKeyMintTimestampFromGraph(lastAirdropKeyId);
	if (startTs === null || endTs === null) return;

	let boundary = firstAirdropKeyId;
	for (let dayStart = dayStartOf(startTs); dayStart <= dayStartOf(endTs); dayStart += DAY_IN_SECONDS) {
		const nextDayStart = dayStart + DAY_IN_SECONDS;
		const nextBoundaryRaw = nextDayStart > endTs ? lastAirdropKeyId + 1n : (await getFirstKeyIdMintedSinceFromGraph(nextDayStart)) ?? lastAirdropKeyId + 1n;
		const nextBoundary = nextBoundaryRaw > lastAirdropKeyId + 1n ? lastAirdropKeyId + 1n : nextBoundaryRaw;
		const count = nextBoundary - boundary;
		if (count > 0n) {
			const day = toDayKey(dayStart);
			const bucket = buckets.get(day) || emptyBucket();
			bucket.airdrop += count;
			noteKey(bucket, boundary);
			noteKey(bucket, nextBoundary - 1n);
			buckets.set(day, bucket);
		}
		boundary = nextBoundary;
	}
}

/**
 * Syncs the daily Sentry Key sale aggregates from the subgraph into MongoDB.
 * Keys are paged by id (fast on the subgraph) and the airdrop id range is skipped, so a full backfill needs only
 * about a hundred requests. Days are recomputed from scratch, so the function is idempotent.
 *
 * @param {SyncSentryKeySalesArgs} args - The sync arguments.
 * @returns {Promise<SyncSentryKeySalesResult>} Number of days written and keys processed.
 */
export async function syncSentryKeySales({
	mongoUri,
	fromTimestamp = FIRST_KEY_MINT_TIMESTAMP,
	logFunction = (_) => { }
}: SyncSentryKeySalesArgs = {}): Promise<SyncSentryKeySalesResult> {

	if (mongoUri) {
		await mongoose.connect(mongoUri);
		logFunction(`Connected to MongoDB`);
		try {
			return await syncSentryKeySales({ fromTimestamp, logFunction });
		} finally {
			await mongoose.disconnect();
			logFunction(`Disconnected from MongoDB`);
		}
	}

	const network = config.defaultNetworkName;
	const airdrop = TINY_KEYS_AIRDROP[network];
	const firstDayStart = Math.max(dayStartOf(fromTimestamp), dayStartOf(FIRST_KEY_MINT_TIMESTAMP));
	const todayStart = getUtcDayStart(0);
	logFunction(`Syncing Sentry Key sales from ${toDayKey(firstDayStart)} (network ${network})`);

	const latestKeyId = await getLatestKeyIdFromGraph();
	// Exclusive lower bound of the keys to load: everything from the first key of the first day on.
	const afterKeyId = firstDayStart <= dayStartOf(FIRST_KEY_MINT_TIMESTAMP)
		? 0n
		: ((await getFirstKeyIdMintedSinceFromGraph(firstDayStart)) ?? latestKeyId + 1n) - 1n;

	const buckets = new Map<string, DailyBucket>();
	let keys = 0;

	if (airdrop) {
		// Pre split sales, then the airdrop days, then post split sales. Ranges that lie before afterKeyId are skipped.
		if (afterKeyId < airdrop.lastKeyIdBeforeSplit) {
			keys += await collectSoldKeys(afterKeyId, airdrop.lastKeyIdBeforeSplit, true, buckets, logFunction);
		}
		if (afterKeyId < airdrop.lastAirdropKeyId) {
			await collectAirdropKeys(airdrop.lastKeyIdBeforeSplit + 1n, airdrop.lastAirdropKeyId, buckets);
		}
		const postSplitAfter = afterKeyId > airdrop.lastAirdropKeyId ? afterKeyId : airdrop.lastAirdropKeyId;
		keys += await collectSoldKeys(postSplitAfter, latestKeyId, false, buckets, logFunction);
	} else {
		keys += await collectSoldKeys(afterKeyId, latestKeyId, false, buckets, logFunction);
	}
	logFunction(`Loaded ${keys} sold keys from subgraph`);

	const SentryKeySaleDailyModel = getSentryKeySaleDailyModel();
	const now = new Date();
	let days = 0;

	for (let dayStart = firstDayStart; dayStart <= todayStart; dayStart += DAY_IN_SECONDS) {
		const day = toDayKey(dayStart);
		const bucket = buckets.get(day) || emptyBucket();
		const keyMultiplier = bucket.preSplit && airdrop ? airdrop.keyMultiplier : 1;

		await SentryKeySaleDailyModel.updateOne(
			{ network, day },
			{
				$set: {
					mintedKeys: Number(bucket.sold + bucket.airdrop),
					airdropKeys: Number(bucket.airdrop),
					soldKeys: Number(bucket.sold),
					keyMultiplier,
					soldKeysNormalized: Number(bucket.sold) * keyMultiplier,
					firstKeyId: Number(bucket.first),
					lastKeyId: Number(bucket.last),
					updatedAt: now
				},
				$setOnInsert: { createdAt: now }
			},
			{ upsert: true }
		);
		days++;
	}

	logFunction(`Wrote ${days} daily Sentry Key sale documents`);
	return { days, keys };
}
