import {
    getMaxBucketShares,
    getNetwork
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetMaxBucketShares = () => {
  const [maxBucketSharest, setMaxBucketSharest] = useState<
    [ownerShare: number, keyShare: number, esXaiStakeShare: number]
  >([0, 0, 0]);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getMaxBucketShares(getNetwork(chainId)).then((count) => {
      setMaxBucketSharest([count[0], count[1], count[2]]);
    });
  }, [address, chainId]);
  return { maxBucketSharest };
};
