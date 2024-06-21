import {
    getAvailableKeysForStaking,
    getNetwork
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetAvailableKeysForStaking = () => {
  const [availableKeys, setAvailableKeys] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getAvailableKeysForStaking(getNetwork(chainId), address).then((keys) => {
      setAvailableKeys(keys);
    });
  }, [address, chainId]);
  return { availableKeys };
};

