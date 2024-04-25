import { TierInfo } from "@/types/Pool";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getNetwork, getTierTresholds } from "@/services/web3.service";
import { iconType } from "../components/staking/utils";
import { POOL_DATA_ROWS } from "../components/dashboard/constants/constants";

export const useGetTiers = () => {
	const [tiers, setTiers] = useState<Array<TierInfo & { icon?: iconType }>>(POOL_DATA_ROWS);
	const { chainId, address } = useAccount();

	useEffect(() => {

		if (!chainId) return;
		const syncTierData = async () => {
			const tierData: { nextTierRequirement: number, minValue: number, reward: string }[] = await getTierTresholds(getNetwork(chainId));
			const tiersToUpdate = [...tiers];
			for (let i = 0; i < tierData.length; i++) {
				tiersToUpdate[i] = {
					...tiersToUpdate[i],
					minValue: tierData[i].minValue,
					requirement: `${tierData[i].minValue} staked esXAI`,
					reward: tierData[i].reward,
				};
			};
			setTiers(tiersToUpdate);
		}

		syncTierData();

	}, [chainId, address]);

	return { tiers };
};