import {
  getNetwork,
  getMaxKeyCount,
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetMaxKeyPerPool = () => {
  const [maxKeyPerPool, setMaxKeyPerPool] = useState(1000);
  const { chainId } = useAccount();

  useEffect(() => {
    getMaxKeyCount(getNetwork(chainId)).then((keys) => {
      setMaxKeyPerPool(keys);
    });
  }, [chainId]);
  return { maxKeyPerPool };
};
