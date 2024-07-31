import {
  getEsXaiBalance,
  getNetwork,
  getWeb3Instance,
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";


export const useGetTotalV1StakedAmount = () => {
  const [totalV1StakeAmount, setTotalV1StakeAmount] = useState<number>(0);

  const { chainId } = useAccount();

  useEffect(() => {
    getEsXaiBalance(getNetwork(chainId), getWeb3Instance(getNetwork(chainId)).refereeAddress)
      .then(({ balance }) => {
        setTotalV1StakeAmount(balance)
      })
  }, [chainId]);

  return { totalV1StakeAmount };
};