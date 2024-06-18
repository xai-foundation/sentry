import {
    getNetwork,
    getPoolAddressesOfUser,
    getPoolInfo
} from "@/services/web3.service";
import { PoolInfo, PoolRewardRates } from "@/types/Pool";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { makeApiRequest } from "../utils/makeApiRequest";

export const useGetUserInteractedPools = (refresh: boolean = false) => {
  const poolsLoaded = useRef(false);
  const { address, chainId } = useAccount();
  const [userPools, setUserPools] = useState<PoolInfo[]>([]);
  const [isLoading, setIsLoading] = useState(address ? true : false);
  const [totalClaimableAmount, setTotalClaimableAmount] = useState(0);

  useEffect(() => {
    const populateUserPools = async () => {

      setIsLoading(true);
      const userPoolAddresses = await getPoolAddressesOfUser(getNetwork(chainId), address);

      // Get reward rates for user pools from API      
      let rewardRates: PoolRewardRates[] = [];
      if(userPoolAddresses.length > 0) {
        const uri = "/api/get-reward-rates";
        const body = { poolAddresses: userPoolAddresses };
        const result  = await makeApiRequest(uri, body);
        rewardRates = result.rewardRates;
      }
      
      if (!userPoolAddresses.length) {
        setIsLoading(false);
      }

      let totalClaim = 0;

      for (let index = 0; index < userPoolAddresses.length; index++) {
        const poolAddress = userPoolAddresses[index];
        let poolInfo: PoolInfo;
        try {
          poolInfo = await getPoolInfo(getNetwork(chainId), poolAddress, address);
          // Set reward rates for user pools
          if(rewardRates.length > 0) {
            const poolRewardRate = rewardRates.find(rate => rate.poolAddress === poolAddress);
            poolInfo.keyRewardRate = poolRewardRate?.keyRewardRate || 0;
            poolInfo.esXaiRewardRate = poolRewardRate?.esXaiRewardRate || 0;
          }
          setUserPools(userPools => [...userPools, poolInfo]);
          totalClaim += poolInfo.userClaimAmount || 0;
          setTotalClaimableAmount(totalClaim);
          await new Promise((resolve) => setTimeout(resolve, 100));

        } catch (error) {
          // console.error("Error loading user pool", poolAddress, error);
        }
      }

      setIsLoading(false);
    }

    if (!address || !chainId) {
      return;
    }

    if (!poolsLoaded.current) {
      poolsLoaded.current = true;
      populateUserPools();
    }
  }, [address, chainId, refresh]);

  return { userPools, isLoading, totalClaimableAmount };
};
