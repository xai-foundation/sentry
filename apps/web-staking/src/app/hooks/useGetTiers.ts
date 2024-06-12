import { TierInfo } from "@/types/Pool";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ACTIVE_NETWORK_IDS, getNetwork, getTierTresholds } from "@/services/web3.service";
import { iconType } from "../components/staking/utils";
import { POOL_DATA_ROWS } from "../components/dashboard/constants/constants";

export const useGetTiers = () => {
	const [tiers, setTiers] = useState<Array<TierInfo & { icon?: iconType }> | undefined>(undefined);
	const { chainId, address } = useAccount();

	useEffect(() => {
		const syncTierData = async () => {
			const network = getNetwork(chainId ? chainId : ACTIVE_NETWORK_IDS[0]);
			const tierData: { nextTierRequirement: number, minValue: number, reward: string }[] = await getTierTresholds(network);
			const tiersToUpdate = [...POOL_DATA_ROWS];
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