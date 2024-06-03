import mongoose from "mongoose";
import { IUserToProject } from "./userToProject.schema";

interface IProject {
  name: string;
  forwarderAddress: string;
  receiverAddress: string;
  relayerId: string;
  refillTimestamp: Date;
  refillInterval: number;
  studioLimit: number;
  studioBalance: number;
  userLimit: number;
  userRefillInterval: number;
  users: IUserToProject[];
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
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserToProject',
    required: true
  }],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const ProjectModel = mongoose.models.ProjectSchema || mongoose.model<IProject>("Project", ProjectSchema);
export default ProjectModel;
