import mongoose from "mongoose";
import { IProject } from "./types/IProject";

// Define the Project schema
const ProjectSchema = new mongoose.Schema<IProject>({
  name: { type: String, required: true },
  forwarderAddress: { type: String, required: true },
  relayerId: { type: String, required: true },
  backendWallet: { type: String, required: true },
  lastRefillTimestamp: { type: Number, required: true },
  refillInterval: { type: Number, required: true },
  projectLimitWei: { type: String, required: true },
  projectBalanceWei: { type: String, required: true },
  userLimitWei: { type: String, required: true },
  userRefillInterval: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
});

const ProjectModel = mongoose.models.ProjectSchema || mongoose.model<IProject>("Project", ProjectSchema);
export default ProjectModel;
