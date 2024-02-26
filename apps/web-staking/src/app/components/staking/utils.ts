import { TIER_VALUES, POOL_DATA_ROWS, TierInfo } from "../overview/constants/constants";

export const getCurrentTierByStaking = (staking: number): TierInfo | undefined => {
	const currentTier = POOL_DATA_ROWS
		.find(({ minValue, maxValue }) => {
			if (minValue === TIER_VALUES.DIAMOND && staking > minValue) {
				return true;
			}
			return staking >= minValue && staking < maxValue
		});

	if (!currentTier) return undefined;

	currentTier.maxValue = currentTier.minValue === TIER_VALUES.DIAMOND ? staking : currentTier.maxValue;
	return currentTier;
};

export const getProgressValue = (staking: number, tier?: TierInfo) => {
	if (staking >= TIER_VALUES.DIAMOND) return 100;

	if (!tier) return 0;

	const { minValue, maxValue } = tier

	if (minValue === TIER_VALUES.DIAMOND) return 100;

	return (staking - minValue) / (maxValue - minValue) * 100;
};

export const getAmountRequiredForUpgrade = (staking: number, tier?: TierInfo) => {
	if (!tier) return 0;

	if (tier.minValue === TIER_VALUES.DIAMOND) { 
		return 0;
	}
	return (tier?.maxValue + 1 ?? 0) - (staking ?? 0)
};