import { IDocument } from './IModel';

export default interface IPool extends IDocument {
	poolAddress: string;
	poolIndex: number;
	owner: string;
	name: string;
	description: string;
	logo?: string;
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
};