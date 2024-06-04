import mongoose from "mongoose";

export interface IUserProjectInfo {
    walletAddress: string;
    lastRefill: Date;
    lastInteraction: Date;
    balance: number;
    createdAt: Date;
};

const UserProjectInfoSchema = new mongoose.Schema<IUserProjectInfo>({
    walletAddress: {
        type: String,
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
    }
});

const UserProjectInfoModel = mongoose.models.UserProjectInfo || mongoose.model<IUserProjectInfo>("UserProjectInfo", UserProjectInfoSchema);
export default UserProjectInfoModel;
