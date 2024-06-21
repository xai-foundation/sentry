import {
    OrderedRedemptions,
    getNetwork,
    getRedemptions
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetRedemptionsHooks = () => {
  const [redemptions, setRedemptions] = useState<OrderedRedemptions>({
    claimable: [],
    open: [],
    closed: [],
  });
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getRedemptions(getNetwork(chainId), address).then((requests) => {
      setRedemptions(requests);
    });
  }, [address, chainId]);

  return { redemptions };
};