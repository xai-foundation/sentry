import {
    OrderedUnstakeRequests,
    getNetwork,
    getUnstakeRequest
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";


export const useGetUnstakeRequests = (poolAddress: string | undefined, refresh: boolean = false) => {
  const [unstakeRequests, setRequests] = useState<OrderedUnstakeRequests>({
    claimable: [],
    open: [],
    closed: [],
  });
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    if (!poolAddress) {
      setRequests({
        claimable: [],
        open: [],
        closed: []
      });
      return;
    }
    getUnstakeRequest(getNetwork(chainId), address, poolAddress).then((requests) => {
      setRequests(requests);
    });
  }, [address, chainId, poolAddress, refresh]);

  return { unstakeRequests };
};
