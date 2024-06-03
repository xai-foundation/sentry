import IUserToGameStudio from "@/types/IUserToGameStudio";
import mongoose from "mongoose";

const UserToGameStudioSchema = new mongoose.Schema<IUserToGameStudio>({
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

const UserToGameStudioModel = mongoose.models.UserToGameStudio || mongoose.model<IUserToGameStudio>("UserToGameStudio", UserToGameStudioSchema);
export default UserToGameStudioModel;