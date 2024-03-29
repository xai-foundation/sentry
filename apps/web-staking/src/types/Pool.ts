import { iconType } from "@/app/components/dashboard/constants/constants";

/* export type Pool = {
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
	tier: string;
	bucketShares: BucketShares;
	socials: Socials;
} */

export type PoolMetadata = {
	name: string;
	description: string;
	logo: string;
	website: string;
	twitter: string;
	discord: string;
	telegram: string;
	instagram: string;
	tiktok: string;
	youtube: string;
}

export type TierInfo = {
	tierName: string;
	nextTierName: string;
	nextTierRequirement?: string;
	tierBackgroundColor?: string;
	iconText?: string;
	requirement: string;
	gradient?: string;
	minValue: number;
	reward: string;
	index: number;
};

export type UserPoolDataType = {
	userStakedEsXaiAmount: number;
	userClaimAmount: number;
	userStakedKeyIds: number[];
	unstakeRequestkeyAmount: number;
	unstakeRequestesXaiAmount: number;
}

export type PoolInfo = {
	address: string;							// address of the pool contract
	owner: string;								// address of the user that created the pool
	keyBucketTracker: string;					// the key bucket tracker contract address
	esXaiBucketTracker: string;					// the esXai bucket tracker contract address
	keyCount: number;							// current number of NodeLicenses allocated to the pool
	totalStakedAmount: number;					// The total esXai staked in that pool
	maxStakedAmount: number;					// The maximum capacity of esXai for this pool
	ownerShare: number;							// The share for the pool owner
	keyBucketShare: number;						// The share for the key staker
	stakedBucketShare: number;					// The share for the esXai staker
	maxKeyCount: number;						// maximum number of NodeLicenses that can be allocated to the pool
	userStakedEsXaiAmount?: number;				// current amount of esXai the given user has staked on the pool
	unstakeRequestkeyAmount?: number,			// pending unstake key amount from user
	unstakeRequestesXaiAmount?: number,			// pending unstake esXai amount from user
	userClaimAmount?: number;		    		// available claim amount for pool
	userStakedKeyIds: number[];	    			// current number of NodeLicense keys staked on the pool by the given user
	tier?: TierInfo;	       	 				// current reward tier of the pool
	meta: PoolMetadata;							// metadata about the pool
	pendingShares: number[]; 					// new pending shares set by the owner (owner, keys, esXai)
	updateSharesTimestamp: number;				// timestamp when the pending shares will take effect, 0 if there are no pending shares
}

export type CreatePool = {
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
	tierIndex?: number;
	ownerShare: number;
	keyBucketShare: number;
	stakedBucketShare: number;
	updateSharesTimestamp: number;
	pendingShares: number[];
	socials: string[];
	network: string;
}

export type UpdateablePoolProps = {
	name?: string;
	description?: string;
	logo?: string;
	keyCount?: number;
	totalStakedAmount?: number;
	maxStakedAmount?: number;
	tierIndex?: number;
	ownerShare?: number;
	keyBucketShare?: number;
	stakedBucketShare?: number;
	updateSharesTimestamp?: number;
	pendingShares?: number[];
	socials?: string[];
	visibility?: string;
}

/* export type Socials = {
	website?: string,
	discord?: string,
	telegram?: string,
	instagram?: string,
	tiktok?: string,
	youtube?: string
}  */

/* export type BucketShares = {
	ownerShare?: number;
	keyBucketShare?: number;
	stakedBucketShare?: number;
} */