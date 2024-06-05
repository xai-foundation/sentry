import mongoose from "mongoose";

export interface IPool {
    _id: mongoose.ObjectId
    poolAddress: string;
    owner: string;
    name: string;
    description: string;
    logo: string;
    keyBucketTracker: string;
    esXaiBucketTracker: string;
    keyCount: number;
    totalStakedAmount: number;
    maxStakedAmount: number;
    tierIndex: number,
    ownerShare: number,
    keyBucketShare: number,
    stakedBucketShare: number,
    updateSharesTimestamp?: number,
    ownerStakedKeys: number,
    ownerRequestedUnstakeKeyAmount: number,
    ownerLatestUnstakeRequestCompletionTime: number,
    pendingShares?: number[];
    userStakedKeyIds: number[],
    socials: [website: string, twitter: string, discord: string, telegram: string, instagram: string, tiktok: string, youtube: string],
    visibility: 'active' | 'inactive' | 'banned',
    network: string,
    updatedAt?: Date
    createdAt: Date
};

export const PoolSchema = new mongoose.Schema<IPool>({
    poolAddress: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true,
        default: ""
    },
    keyBucketTracker: {
        type: String,
        required: true
    },
    esXaiBucketTracker: {
        type: String,
        required: true
    },
    keyCount: {
        type: Number,
        required: true
    },
    totalStakedAmount: {
        type: Number,
        required: true
    },
    maxStakedAmount: {
        type: Number,
        required: true
    },
    tierIndex: {
        type: Number,
        required: true,
        default: 0
    },
    ownerShare: {
        type: Number,
        required: true
    },
    keyBucketShare: {
        type: Number,
        required: true
    },
    stakedBucketShare: {
        type: Number,
        required: true
    },
    updateSharesTimestamp: {
        type: Number,
        required: true
    },
    ownerStakedKeys: {
        type: Number,
        required: true
    },
    ownerRequestedUnstakeKeyAmount: {
        type: Number,
        required: true
    },
    ownerLatestUnstakeRequestCompletionTime: {
        type: Number,
        required: true
    },
    pendingShares: {
        type: [Number],
        default: [0, 0, 0],
        required: true
    },
    userStakedKeyIds: {
        type: [Number],
        required: true,
        default: []
    },

    socials: {
        type: [String],
        required: true,
        default: ["", "", "", "", "", "", ""]
    },

    visibility: {
        type: String,
        required: true,
        default: 'active'
    },
    network: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

export type BaseInfo = {
    poolAddress: string;
    owner: string;
    keyBucketTracker: string;
    esXaiBucketTracker: string;
    keyCount: BigInt;
    totalStakedAmount: BigInt;
    updateSharesTimestamp: BigInt;
    ownerShare: BigInt;
    keyBucketShare: BigInt;
    stakedBucketShare: BigInt;
};

export type Socials = [string, string, string, string, string, string, string];
type PendingShares = [BigInt, BigInt, BigInt];

export type RawPoolInfo = {
    baseInfo: BaseInfo;
    _name: string;
    _description: string;
    _logo: string;
    _socials: Socials;
    _pendingShares: PendingShares;
    _ownerStakedKeys: BigInt;
    _ownerRequestedUnstakeKeyAmount: BigInt;
    _ownerLatestUnstakeRequestLockTime: BigInt;
};