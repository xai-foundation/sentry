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
    esXaiRewardRate: number,
    keyRewardRate: number,
    totalEsXaiClaimed: number,
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
    totalEsXaiClaimed: {
        type: Number,
        required: true,
        default: 0
    },   
    esXaiRewardRate: {
        type: Number,
        required: true,
        default: 0
    },
    keyRewardRate: {
        type: Number,
        required: true,
        default: 0
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
/**
 * Daily aggregate of the Referee challenge emissions, one document per UTC day and network.
 * Token amounts are stored as numbers in whole tokens (not wei).
 */
export interface IEsXaiEmissionDaily {
    _id: mongoose.ObjectId;
    /** UTC day in the format YYYY-MM-DD */
    day: string;
    network: string;
    /** esXAI allocated to claimers by all challenges created on this day (the esXAI emission). */
    allocatedEsXai: number;
    /** esXAI minted through claims for the challenges created on this day (can still grow while challenges are open). */
    mintedEsXai: number;
    /** XAI minted for the gas subsidy by all challenges created on this day. */
    gasSubsidyXai: number;
    challengeCount: number;
    firstChallengeNumber: number;
    lastChallengeNumber: number;
    updatedAt: Date;
    createdAt: Date;
}

export const EsXaiEmissionDailySchema = new mongoose.Schema<IEsXaiEmissionDaily>({
    day: {
        type: String,
        required: true
    },
    network: {
        type: String,
        required: true
    },
    allocatedEsXai: {
        type: Number,
        required: true,
        default: 0
    },
    mintedEsXai: {
        type: Number,
        required: true,
        default: 0
    },
    gasSubsidyXai: {
        type: Number,
        required: true,
        default: 0
    },
    challengeCount: {
        type: Number,
        required: true,
        default: 0
    },
    firstChallengeNumber: {
        type: Number,
        required: true,
        default: 0
    },
    lastChallengeNumber: {
        type: Number,
        required: true,
        default: 0
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

EsXaiEmissionDailySchema.index({ network: 1, day: 1 }, { unique: true });
