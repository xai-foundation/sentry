import {
    getAvailableKeysForStaking,
    getMaxStakedAmountPerLicense,
    getNetwork,
    getStakedAmount
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetTotalStakedHooks = () => {
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalStakedWei, setTotalStakedWei] = useState("0");
  const [maxStakedCapacity, setMaxStakedCapacity] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;

    const getStakeAmounts = async () => {
      const unstakedKeys = await getAvailableKeysForStaking(getNetwork(chainId), address);
      const maxStakePerKey = await getMaxStakedAmountPerLicense(getNetwork(chainId));
      setMaxStakedCapacity(unstakedKeys * maxStakePerKey);

      const { stakedAmount, stakedAmountWei } = await getStakedAmount(getNetwork(chainId), address)
      setTotalStaked(stakedAmount);
      setTotalStakedWei(stakedAmountWei);
    }

    getStakeAmounts();

  }, [address, chainId]);

  return { totalStaked, totalStakedWei, maxStakedCapacity };
};











