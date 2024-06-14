import { findPool, getPoolRewardRatesByAddress } from "@/server/services/Pool.service";
import {
    getNetwork,
    getPoolAddressesOfUser,
    getPoolInfo
} from "@/services/web3.service";
import { PoolInfo } from "@/types/Pool";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

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
          console.log("userPoolAddresses", userPoolAddresses);
          if(userPoolAddresses.length > 0) {
          //const result = await findPool({ poolAddress: userPoolAddresses[0] });
          //console.log("result", result);
          //const poolRewardRates = await getPoolRewardRatesByAddress(userPoolAddresses);
          //console.log("poolRewardRates", poolRewardRates);
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
