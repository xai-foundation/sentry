import mongoose from "mongoose";

export interface IProject {
  name: string;
  forwarderAddress: string;
  relayerId: string;
  backendWallet: string;
  lastRefill: Date;
  refillInterval: number;
  projectLimit: number;
  projectBalance: number;
  userLimit: number;
  userRefillInterval: number;
  createdAt: Date;
  updatedAt: Date;
};

const ProjectSchema = new mongoose.Schema<IProject>({
  name: {
    type: String,
    required: true
  },
  forwarderAddress: {
    type: String,
    required: true
  },
  relayerId: {
    type: String,
    required: true,
    unique: true
  },
  backendWallet: {
    type: String,
    required: true
  },
  lastRefill: {
    type: Date,
    required: true,
    default: Date.now
  },
  refillInterval: {
    type: Number,
    required: true
  },
  projectLimit: {
    type: Number,
    required: true
  },
  projectBalance: {
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
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const ProjectModel = mongoose.models.ProjectSchema || mongoose.model<IProject>("Project", ProjectSchema);
export default ProjectModel;
