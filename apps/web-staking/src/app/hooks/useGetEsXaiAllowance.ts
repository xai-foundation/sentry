import {
    getEsXaiAllowance,
    getNetwork
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetEsXaiAllowance = () => {
  const [allowance, setAllowance] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getEsXaiAllowance(getNetwork(chainId), address).then((amount) => {
      setAllowance(amount);
    });
  }, [address, chainId]);
  return { allowance: allowance };
};
