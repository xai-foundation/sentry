import {
    getNetwork,
    getStakedKeysCount
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";


export const useGetUserTotalStakedKeysCount = () => {
  const [stakedKeysAmount, setStakedKeysAmount] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;

    const getStakedKeysCountAsync = async () => {
      const response = await getStakedKeysCount(getNetwork(chainId), address);
      setStakedKeysAmount(response);
    };

    getStakedKeysCountAsync();
  }, [address, chainId]);

  return { stakedKeysAmount };
};

