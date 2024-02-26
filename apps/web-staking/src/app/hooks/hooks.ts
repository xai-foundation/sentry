import {
  OrderedRedemptions,
  getEsXaiAllowance,
  getEsXaiBalance,
  getMaxStakedAmount,
  getNetwork,
  getRedemptions,
  getStakedAmount,
  getXaiBalance,
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetBalanceHooks = () => {
  const [xaiBalance, setXaiBalance] = useState(0);
  const [esXaiBalance, setEsXaiBalance] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getXaiBalance(getNetwork(chainId), address).then((balance) => {
      setXaiBalance(balance);
    });

    getEsXaiBalance(getNetwork(chainId), address).then((balance) => {
      setEsXaiBalance(balance);
    });
  }, [address, chainId]);

  return { xaiBalance, esXaiBalance };
};

export const useGetTotalStakedHooks = () => {
  const [totalStaked, setTotalStaked] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getStakedAmount(getNetwork(chainId), address).then((amount) => {
      setTotalStaked(amount);
    });
  }, [address, chainId]);

  return { totalStaked };
};

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

export const useGetRedemptionsHooks = () => {
  const [redemptions, setRedemptions] = useState<OrderedRedemptions>({
    claimable: [],
    open: [],
    closed: [],
  });
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getRedemptions(getNetwork(chainId), address).then((amount) => {
      setRedemptions(amount);
    });
  }, [address, chainId]);

  return { redemptions };
};

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