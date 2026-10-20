import SentryKeySaleDailyModel from "../models/sentryKeySaleDaily.schema";
import ISentryKeySaleDaily from "../types/ISentryKeySaleDaily";
import { executeQuery } from "./Database.service";
import { NetworkKey } from "@/services/web3.service";

export type SentryKeySaleDay = {
	/** UTC day as YYYY-MM-DD */
	day: string;
	/** Keys sold in the units of that day */
	soldKeys: number;
	/** 100 before the 1:100 split, 1 after */
	keyMultiplier: number;
	/** Keys sold expressed in today's key units */
	soldKeysNormalized: number;
};

export type SentryKeySaleData = {
	days: SentryKeySaleDay[];
	/** First day of the tiny keys airdrop (the split), null when the split has not happened */
	splitDay: string | null;
	/** Multiplier applied to pre-split sales, 1 when there was no split */
	keyMultiplier: number;
	/** ISO timestamp of the most recent sync, null when there is no data yet */
	lastUpdated: string | null;
};

/**
 * Loads the daily Sentry Key sale aggregates for a network, oldest day first.
 */
export async function getSentryKeySales(network: NetworkKey): Promise<SentryKeySaleData> {
	try {
		const docs = (await executeQuery(
			SentryKeySaleDailyModel
				.find({ network })
				.select("day soldKeys airdropKeys keyMultiplier soldKeysNormalized updatedAt")
				.sort({ day: 1 })
				.lean()
		)) as ISentryKeySaleDaily[];

		let lastUpdated: Date | null = null;
		let splitDay: string | null = null;
		let keyMultiplier = 1;

		const days = docs.map((d) => {
			if (!lastUpdated || d.updatedAt > lastUpdated) {
				lastUpdated = d.updatedAt;
			}
			if (d.keyMultiplier > 1) {
				keyMultiplier = d.keyMultiplier;
			}
			if (!splitDay && d.airdropKeys > 0) {
				splitDay = d.day;
			}
			return {
				day: d.day,
				soldKeys: d.soldKeys,
				keyMultiplier: d.keyMultiplier,
				soldKeysNormalized: d.soldKeysNormalized
			};
		});

		return { days, splitDay, keyMultiplier, lastUpdated: lastUpdated ? (lastUpdated as Date).toISOString() : null };
	} catch (error) {
		throw new Error(`ERROR @getSentryKeySales: ${error}`);
	}
}
