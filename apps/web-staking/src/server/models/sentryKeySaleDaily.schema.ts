import mongoose from "mongoose";
import ISentryKeySaleDaily from "../types/ISentryKeySaleDaily";

// Read-only mirror of the schema in packages/core/src/data-centralization/types.ts
const SentryKeySaleDailySchema = new mongoose.Schema<ISentryKeySaleDaily>({
	day: { type: String, required: true },
	network: { type: String, required: true },
	mintedKeys: { type: Number, required: true, default: 0 },
	airdropKeys: { type: Number, required: true, default: 0 },
	soldKeys: { type: Number, required: true, default: 0 },
	keyMultiplier: { type: Number, required: true, default: 1 },
	soldKeysNormalized: { type: Number, required: true, default: 0 },
	firstKeyId: { type: Number, required: true, default: 0 },
	lastKeyId: { type: Number, required: true, default: 0 },
	updatedAt: { type: Date, required: true, default: Date.now },
	createdAt: { type: Date, required: true, default: Date.now }
});

SentryKeySaleDailySchema.index({ network: 1, day: 1 }, { unique: true });

const SentryKeySaleDailyModel = mongoose.models.SentryKeySaleDaily || mongoose.model<ISentryKeySaleDaily>("SentryKeySaleDaily", SentryKeySaleDailySchema);
export default SentryKeySaleDailyModel;
