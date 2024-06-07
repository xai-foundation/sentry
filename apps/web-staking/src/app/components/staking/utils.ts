import { TierInfo } from "@/types/Pool";
import { getMaxStakedAmountPerLicense, getNetwork, MAINNET_ID } from "@/services/web3.service";

export type iconType = ({
	width,
	height,
}: {
	width?: number | undefined;
	height?: number | undefined;
	fill?: string | undefined;
}) => React.JSX.Element;

export const getCurrentTierByStaking = (staking: number, tiers: Array<TierInfo & { icon?: iconType }>): TierInfo & { icon?: iconType } | undefined => {
	let currentTier: TierInfo | undefined;

	if (staking < tiers[1].minValue) {
		currentTier = tiers[0];
	} else {
		for (let i = 1; i < tiers.length; i++) {
			if (staking < tiers[i].minValue) {
				currentTier = tiers[i - 1];
				break;
			} else {
				currentTier = tiers[i];
			}
		}
	};

	if (!currentTier) return undefined;
	return currentTier;
};

export const getProgressValue = (staking: number, tiers: Array<TierInfo & { icon?: iconType }>, currentTier?: TierInfo) => {
	if (!currentTier) return 0;
	if (currentTier.index == tiers.length - 1) return 100;
	const nextTierValue = tiers[currentTier.index + 1].minValue;
	return (staking - currentTier.minValue) / (nextTierValue - currentTier.minValue) * 100;
};

export const getAmountRequiredForUpgrade = (staking: number, tiers: Array<TierInfo & { icon?: iconType }>, currentTier?: TierInfo) => {
	if (!currentTier) return 0;
	if (currentTier.index == tiers.length - 1) return 0;

	const nextTierValue = tiers[currentTier.index + 1].minValue;
	return nextTierValue - staking;
};

export const getTierByIndex = (index: number, tiers: Array<TierInfo & { icon?: iconType }>): TierInfo | undefined => {
	const tier = tiers[index];
	delete tier.icon;
	return tier;
};

export const getIcon = (index: number = 0, tiers: Array<TierInfo & { icon?: iconType }>): iconType => {
	return tiers[index].icon as iconType;
};

type ExtendedTierInfo = TierInfo & {
	icon?: iconType
}

export const calculateKeysToNextTier = async (totalStakedAmount: number, keyCount: number, tier: ExtendedTierInfo, tiers: ExtendedTierInfo[], chainId: number | undefined) => {
	const tierByStaking = getCurrentTierByStaking(totalStakedAmount, tiers)!;
	const nextTierInfo = tiers[tier.index + 1];
	const maxStakePerKey = await getMaxStakedAmountPerLicense(getNetwork(chainId || MAINNET_ID));

	if (tierByStaking.index !== tier.index) {
		return Math.ceil(tierByStaking.minValue / maxStakePerKey - keyCount);
	}

	return Math.ceil(nextTierInfo.minValue / maxStakePerKey - keyCount);
};