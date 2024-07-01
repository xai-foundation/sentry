import {
  getNetwork,
  getUnstakeTimes,
} from "@/services/web3.service";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import moment from "moment";


export const useGetUnstakePeriods = () => {
  moment.relativeTimeThreshold("d", 1000);
  const [unstakePeriods, setUnstakePeriods] = useState<{
    unstakeKeysDelayPeriod: string;
    unstakeGenesisKeyDelayPeriod: string;
    unstakeEsXaiDelayPeriod: string
  }>(
    {
      unstakeKeysDelayPeriod: "-",
      unstakeGenesisKeyDelayPeriod: "-",
      unstakeEsXaiDelayPeriod: "-"
    }
  );

  const { chainId } = useAccount();

  useEffect(() => {
    getUnstakeTimes(getNetwork(chainId)).then((item) => {
      setUnstakePeriods({
        unstakeKeysDelayPeriod: `${moment.duration(item.unstakeEsXaiDelayPeriod).humanize()}`,
        unstakeGenesisKeyDelayPeriod: `${moment.duration(item.unstakeGenesisKeyDelayPeriod).humanize()}`,
        unstakeEsXaiDelayPeriod: `${moment.duration(item.unstakeKeysDelayPeriod).humanize()}`
      })
    })
  }, [chainId]);

  return unstakePeriods;
};
