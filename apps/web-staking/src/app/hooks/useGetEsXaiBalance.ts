import {
    getEsXaiBalance,
    getNetwork
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";


export const useGetEsXaiBalanceHooks = () => {
  const [esXaiBalance, setEsXaiBalance] = useState(0);
  const { address, chainId } = useAccount();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (!address || !chainId) return;
    getEsXaiBalance(getNetwork(chainId), address).then(({ balance }) => {
      setEsXaiBalance(balance);
    });
  }, [address, chainId]);

  const refreshEsXaiBalance = () => setRefresh((refresh) => !refresh);

  return { esXaiBalance, refreshEsXaiBalance };
};


