import {
    getNetwork,
    isKYCApprovedForRedemption
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetKYCApprovedForRedemptionClaim = () => {
  const [isApproved, setIsApproved] = useState(false);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    isKYCApprovedForRedemption(getNetwork(chainId), address).then((approved) => {
      setIsApproved(approved);
    });
  }, [address, chainId]);
  return { isApproved };
};
