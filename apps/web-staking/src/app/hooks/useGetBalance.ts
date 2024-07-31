import {
  getEsXaiBalance,
  getNetwork,
  getXaiBalance
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetBalanceHooks = (refresh: boolean = false) => {
  const [xaiBalance, setXaiBalance] = useState(0);
  const [esXaiBalance, setEsXaiBalance] = useState(0);
  const [xaiBalanceWei, setXaiBalanceWei] = useState("0");
  const [esXaiBalanceWei, setEsXaiBalanceWei] = useState("0");
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getXaiBalance(getNetwork(chainId), address).then(({ balance, balanceWei }) => {
      setXaiBalance(balance);
      setXaiBalanceWei(balanceWei);
    });

    getEsXaiBalance(getNetwork(chainId), address).then(({ balance, balanceWei }) => {
      setEsXaiBalance(balance);
      setEsXaiBalanceWei(balanceWei);
    });
  }, [address, chainId, refresh]);

  return { xaiBalance, esXaiBalance, xaiBalanceWei, esXaiBalanceWei };
};
