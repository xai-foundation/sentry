import mongoose from "mongoose";
import IEsXaiEmissionDaily from "../types/IEsXaiEmissionDaily";

// Read-only mirror of the schema in packages/core/src/data-centralization/types.ts
const EsXaiEmissionDailySchema = new mongoose.Schema<IEsXaiEmissionDaily>({
	day: { type: String, required: true },
	network: { type: String, required: true },
	allocatedEsXai: { type: Number, required: true, default: 0 },
	mintedEsXai: { type: Number, required: true, default: 0 },
	gasSubsidyXai: { type: Number, required: true, default: 0 },
	challengeCount: { type: Number, required: true, default: 0 },
	firstChallengeNumber: { type: Number, required: true, default: 0 },
	lastChallengeNumber: { type: Number, required: true, default: 0 },
	updatedAt: { type: Date, required: true, default: Date.now },
	createdAt: { type: Date, required: true, default: Date.now }
});

EsXaiEmissionDailySchema.index({ network: 1, day: 1 }, { unique: true });

const EsXaiEmissionDailyModel = mongoose.models.EsXaiEmissionDaily || mongoose.model<IEsXaiEmissionDaily>("EsXaiEmissionDaily", EsXaiEmissionDailySchema);
export default EsXaiEmissionDailyModel;
