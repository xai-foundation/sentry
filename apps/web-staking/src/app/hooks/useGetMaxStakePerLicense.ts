import {
    getMaxStakedAmountPerLicense,
    getNetwork
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetMaxStakePerLicense = () => {
  const [maxStakePerKey, setMaxStakePerKey] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getMaxStakedAmountPerLicense(getNetwork(chainId)).then((amount) => {
      setMaxStakePerKey(amount);
    });
  }, [address, chainId]);
  return { maxStakePerKey };
};
