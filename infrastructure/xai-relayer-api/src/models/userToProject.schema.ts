import mongoose from "mongoose";

export interface IUserToProject {
    walletAddress: string;
    lastRefill: Date;
    lastInteraction: Date;
    balance: number;
    createdAt: Date;
};

const UserToProject = new mongoose.Schema<IUserToProject>({
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

const UserToProjectModel = mongoose.models.UserToProject || mongoose.model<IUserToProject>("UserToProject", UserToProject);
export default UserToProjectModel;