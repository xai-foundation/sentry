import {
    getDelegateOwner,
    getNetwork,
    getPoolInfo
} from "@/services/web3.service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Rewards } from "../components/createPool/RewardComponent";

export const useGetPoolInfoHooks = () => {
  const [poolDetailsValues, setPoolDetailsValues] = useState({
    name: "",
    description: "",
    logoUrl: "",
    trackerName: "",
    trackerTicker: "",
  });
  const [rewardsValues, setRewardsValues] = useState<Rewards>({
    owner: "",
    keyholder: "",
    staker: "",
  });
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    discord: "",
    telegram: "",
    twitter: "",
    instagram: "",
    youTube: "",
    tiktok: "",
  });
  const [delegateAddress, setDelegateAddress] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const { poolAddress } = useParams<{ poolAddress: string }>();
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) {
      return;
    }

    setisLoading(true);
    const requestPoolInfo = async () => {
      try {
        const poolInfo = await getPoolInfo(
          getNetwork(chainId),
          poolAddress,
          address
        );
        setPoolDetailsValues({
          name: poolInfo.meta.name,
          description: poolInfo.meta.description,
          logoUrl: poolInfo.meta.logo,
          trackerName: "",
          trackerTicker: "",
        });
        setRewardsValues({
          owner: poolInfo.ownerShare,
          keyholder: poolInfo.keyBucketShare,
          staker: poolInfo.stakedBucketShare,
        });
        setSocialLinks({
          website: poolInfo.meta.website,
          discord: poolInfo.meta.discord,
          telegram: poolInfo.meta.telegram,
          twitter: poolInfo.meta.twitter,
          instagram: poolInfo.meta.instagram,
          youTube: poolInfo.meta.youtube,
          tiktok: poolInfo.meta.tiktok,
        });

        const delegate = await getDelegateOwner(getNetwork(chainId), poolAddress)
        setDelegateAddress(delegate);
        setisLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    requestPoolInfo();
  }, [address, chainId, poolAddress]);

  return {
    poolDetailsValues,
    setPoolDetailsValues,
    socialLinks,
    setSocialLinks,
    rewardsValues,
    isLoading,
    setRewardsValues,
    poolAddress,
    delegateAddress,
    setDelegateAddress,
  };
};