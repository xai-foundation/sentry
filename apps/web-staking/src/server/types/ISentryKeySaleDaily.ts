import { IDocument } from "./IModel";

/**
 * Daily aggregate of Sentry Key mints, written by the core data centralization runtime
 * (packages/core/src/data-centralization/sentryKeySaleSync.ts).
 */
export default interface ISentryKeySaleDaily extends IDocument {
	/** UTC day as YYYY-MM-DD */
	day: string;
	network: string;
	/** All keys minted on this day (sales plus airdrop) */
	mintedKeys: number;
	/** Keys minted by the tiny keys airdrop on this day */
	airdropKeys: number;
	/** Keys sold on this day in the key units of that day */
	soldKeys: number;
	/** 100 before the 1:100 split, 1 after */
	keyMultiplier: number;
	/** soldKeys * keyMultiplier */
	soldKeysNormalized: number;
	firstKeyId: number;
	lastKeyId: number;
	updatedAt: Date;
}
