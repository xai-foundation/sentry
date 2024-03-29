import { TierInfo } from "@/types/Pool";
import { POOL_DATA_ROWS, iconType } from "@/app/components/dashboard/constants/constants";

// TODO move to utils in server?
export const getCurrentTierByStaking = (staking: number): TierInfo & { icon?: iconType } | undefined => {

	let currentTier: TierInfo | undefined;

	if (staking < POOL_DATA_ROWS[1].minValue) {
		currentTier = POOL_DATA_ROWS[0];
	} else {
		for (let i = 1; i < POOL_DATA_ROWS.length; i++) {
			if (staking < POOL_DATA_ROWS[i].minValue) {
				currentTier = POOL_DATA_ROWS[i - 1];
				break;
			} else {
				currentTier = POOL_DATA_ROWS[i];
			}
		}
	}

	if (!currentTier) return undefined;
	return currentTier;
};

export const getProgressValue = (staking: number, currentTier?: TierInfo) => {
	if (!currentTier) return 0;
	if (currentTier.index == POOL_DATA_ROWS.length - 1) return 100;
	const nextTierValue = POOL_DATA_ROWS[currentTier.index + 1].minValue;
	return (staking - currentTier.minValue) / (nextTierValue - currentTier.minValue) * 100;
};

export const getAmountRequiredForUpgrade = (staking: number, currentTier?: TierInfo) => {
	if (!currentTier) return 0;
	if (currentTier.index == POOL_DATA_ROWS.length - 1) return 0;

	const nextTierValue = POOL_DATA_ROWS[currentTier.index + 1].minValue;
	return nextTierValue - staking;
};

export const getTierByName = (name: string): TierInfo | undefined => {
	return POOL_DATA_ROWS.find(p => p.tierName.toLowerCase() == name.toLowerCase());
};

export const getTierByIndex = (index: number): TierInfo | undefined => {
	const tier = POOL_DATA_ROWS[index];
	delete tier.icon;
	return tier;
};


export const getIcon = (index: number = 0): iconType => {
	return POOL_DATA_ROWS[index].icon as iconType;
};