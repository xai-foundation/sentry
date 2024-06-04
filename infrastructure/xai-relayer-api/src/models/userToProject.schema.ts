import mongoose from "mongoose";
import { IProject } from "./project.schema";

export interface IUserProjectInfo {
    walletAddress: string;
    project: IProject;
    lastRefill: Date;
    lastInteraction: Date;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
};

const UserProjectInfoSchema = new mongoose.Schema<IUserProjectInfo>({
    walletAddress: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    lastRefill: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastInteraction: {
        type: Date,
        required: true,
        default: Date.now
    },
    balance: {
        type: Number,
        required: true,
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

const UserProjectInfoModel = mongoose.models.UserProjectInfo || mongoose.model<IUserProjectInfo>("UserProjectInfo", UserProjectInfoSchema);
export default UserProjectInfoModel;
