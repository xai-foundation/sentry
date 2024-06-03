import IGameStudio from "@/types/IGameStudio";
import mongoose from "mongoose";

const GameStudioSchema = new mongoose.Schema<IGameStudio>({
  name: {
    type: String,
    required: true
  },
  forwarderAddress: {
    type: String,
    required: true
  },
  receiverAddress: {
    type: String,
    required: true
  },
  relayerId: {
    type: String,
    required: true
  },
  refillTimestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  refillInterval: {
    type: Number,
    required: true
  },
  studioLimit: {
    type: Number,
    required: true
  },
  studioBalance: {
    type: Number,
    required: true
  },
  userLimit: {
    type: Number,
    required: true
  },
  userRefillInterval: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const GameStudioModel = mongoose.models.GameStudio || mongoose.model<IGameStudio>("GameStudio", GameStudioSchema);
export default GameStudioModel;
