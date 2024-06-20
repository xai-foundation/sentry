import {
    getNetwork,
    getNodeLicenses
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useGetNodeLicenses = () => {
  const [nodeLincenses, setNodeLincenses] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getNodeLicenses(getNetwork(chainId), address).then((lincenses) => {
      setNodeLincenses(lincenses);
    });
  }, [address, chainId]);
  return { nodeLincenses };
};

