import {
    getAvailableKeysForStaking,
    getNetwork
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetUnstakedNodeLicenseCount = () => {
  const [unstakedKeyCount, setUnstakedKeyCount] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getAvailableKeysForStaking(getNetwork(chainId), address).then((count) => {
      setUnstakedKeyCount(count);
    });
  }, [address, chainId]);
  return { unstakedKeyCount };
};
