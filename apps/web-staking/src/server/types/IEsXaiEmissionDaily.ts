import { IDocument } from "./IModel";

/**
 * Daily aggregate of the Referee challenge emissions, written by the core data centralization runtime
 * (packages/core/src/data-centralization/esXaiEmissionSync.ts). Token amounts are whole tokens.
 */
export default interface IEsXaiEmissionDaily extends IDocument {
	/** UTC day as YYYY-MM-DD */
	day: string;
	network: string;
	/** esXAI allocated to claimers by all challenges created on this day */
	allocatedEsXai: number;
	/** esXAI minted through claims for the challenges created on this day */
	mintedEsXai: number;
	/** XAI minted for the gas subsidy by all challenges created on this day */
	gasSubsidyXai: number;
	challengeCount: number;
	firstChallengeNumber: number;
	lastChallengeNumber: number;
	updatedAt: Date;
}
