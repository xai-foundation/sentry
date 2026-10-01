import EsXaiEmissionDailyModel from "../models/esXaiEmissionDaily.schema";
import IEsXaiEmissionDaily from "../types/IEsXaiEmissionDaily";
import { executeQuery } from "./Database.service";
import { NetworkKey } from "@/services/web3.service";

export type EsXaiEmissionDay = {
	/** UTC day as YYYY-MM-DD */
	day: string;
	allocatedEsXai: number;
	challengeCount: number;
};

export type EsXaiEmissionData = {
	days: EsXaiEmissionDay[];
	/** ISO timestamp of the most recent sync, null when there is no data yet */
	lastUpdated: string | null;
};

/**
 * Loads the daily esXAI emission aggregates for a network, oldest day first.
 */
export async function getEsXaiEmissions(network: NetworkKey): Promise<EsXaiEmissionData> {
	try {
		const docs = (await executeQuery(
			EsXaiEmissionDailyModel
				.find({ network })
				.select("day allocatedEsXai challengeCount updatedAt")
				.sort({ day: 1 })
				.lean()
		)) as IEsXaiEmissionDaily[];

		let lastUpdated: Date | null = null;
		const days = docs.map((d) => {
			if (!lastUpdated || d.updatedAt > lastUpdated) {
				lastUpdated = d.updatedAt;
			}
			return {
				day: d.day,
				allocatedEsXai: d.allocatedEsXai,
				challengeCount: d.challengeCount
			};
		});

		return { days, lastUpdated: lastUpdated ? (lastUpdated as Date).toISOString() : null };
	} catch (error) {
		throw new Error(`ERROR @getEsXaiEmissions: ${error}`);
	}
}
