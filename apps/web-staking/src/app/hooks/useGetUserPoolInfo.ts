import {
    getNetwork,
    getPoolInfo
} from "@/services/web3.service";
import { PoolInfo } from "@/types/Pool";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

export const useGetUserPoolInfo = (poolAddress: string | null, refresh: boolean = false) => {
  const poolsLoaded = useRef(false);
  const { address, chainId } = useAccount();
  const [userPool, setUserPool] = useState<PoolInfo>();

  useEffect(() => {
    if (!poolAddress) {
      return;
    }

    poolsLoaded.current = true;
    getPoolInfo(getNetwork(chainId), poolAddress, address)
      .then(pool => {
        setUserPool(pool);
      })
      .catch((err) => {
        //TODO show error ?
        console.error("Error loading Pool", err);
      });

  }, [address, chainId, poolAddress, refresh]);

  return { userPool };
};

