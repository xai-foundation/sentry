import mongoose from "mongoose";
import { IUserProjectInfo } from "./types/UserProjectInfo";

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
    lastRefillTimestamp: {
        type: Number,
        required: true,
    },
    lastInteractionTimestamp: {
        type: Number,
        required: true,
    },
    balanceWei: {
        type: String,
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
