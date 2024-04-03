import mongoose from 'mongoose';
import IPool from '../types/IPool';

const PoolSchema = new mongoose.Schema<IPool>({
    poolAddress: {
        type: String,
        required: true
    },
    poolIndex: {
        type: Number,
        required: true
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
        type: String
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
    },
    userStakedKeyIds: {
        type: [Number],
        required: true,
        default: []
    },
    socials: [String],
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
        type: Date,
        required: true,
        default: Date.now
    }
});

const PoolModel = mongoose.models.Pool || mongoose.model<IPool>('Pool', PoolSchema);
export default PoolModel;