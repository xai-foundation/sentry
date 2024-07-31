import {
  getNetwork,
  getRewardBreakdownUpdateDelay,
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import moment from "moment";



export const useGetRewardBreakdownUpdateDelay = () => {
  moment.relativeTimeThreshold("d", 1000);
  const [rewardBreakdownDelay, setRewardBreakdownDelay] = useState<string>("-");

  const { chainId } = useAccount();

  useEffect(() => {
    getRewardBreakdownUpdateDelay(getNetwork(chainId)).then((period) => {
      setRewardBreakdownDelay(moment.duration(period).humanize())
    })
  }, [chainId]);

  return { rewardBreakdownDelay };
};

