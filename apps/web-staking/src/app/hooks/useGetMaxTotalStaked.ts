import {
    getMaxStakedAmount,
    getNetwork
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetMaxTotalStakedHooks = () => {
  const [totalMaxStaked, setTotalMaxStaked] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getMaxStakedAmount(getNetwork(chainId), address).then((amount) => {
      setTotalMaxStaked(amount);
    });
  }, [address, chainId]);
  return { totalMaxStaked };
};
