import {
  OrderedRedemptions,
  getAvailableKeysForStaking,
  getEsXaiAllowance,
  getEsXaiBalance,
  getMaxBucketShares,
  getMaxStakedAmount,
  getNetwork,
  getNodeLicenses,
  getPoolAddressesOfUser,
  getPoolInfo,
  getRedemptions,
  getStakedAmount,
  getXaiBalance,
  getStakedKeysCount,
  isKYCApproved,
  getMaxStakedAmountPerLicense,
  OrderedUnstakeRequests,
  getUnstakeRequest,
  getMaxKeyCount,
  getDelegateOwner,
} from "@/services/web3.service";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { PoolDetails } from "../components/createPool/PoolDetailsComponent";
import { BLACK_LIST } from "../components/createPool/constants/constants";
import { PoolInfo } from "@/types/Pool";
import { useParams } from "next/navigation";
import { Rewards } from "../components/createPool/RewardComponent";

export const useGetBalanceHooks = () => {
  const [xaiBalance, setXaiBalance] = useState(0);
  const [esXaiBalance, setEsXaiBalance] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getXaiBalance(getNetwork(chainId), address).then((balance) => {
      setXaiBalance(balance);
    });

    getEsXaiBalance(getNetwork(chainId), address).then((balance) => {
      setEsXaiBalance(balance);
    });
  }, [address, chainId]);

  return { xaiBalance, esXaiBalance };
};

export const useGetEsXaiBalanceHooks = () => {
  const [esXaiBalance, setEsXaiBalance] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getEsXaiBalance(getNetwork(chainId), address).then((balance) => {
      setEsXaiBalance(balance);
    });
  }, [address, chainId]);

  return { esXaiBalance };
};

export const useGetTotalStakedHooks = () => {
  const [totalStaked, setTotalStaked] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getStakedAmount(getNetwork(chainId), address).then((amount) => {
      setTotalStaked(amount);
    });
  }, [address, chainId]);

  return { totalStaked };
};

export const useGetMaxTotalStakedHooks = () => {
  const [totalMaxStaked, setTotalMaxStaked] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getMaxStakedAmount(getNetwork(chainId), address).then((amount) => {
      setTotalMaxStaked(amount);
    });
  }, [address, chainId]);
  return { totalMaxStaked };
};

export const useGetMaxStakePerLicense = () => {
  const [maxStakePerKey, setMaxStakePerKey] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getMaxStakedAmountPerLicense(getNetwork(chainId)).then((amount) => {
      setMaxStakePerKey(amount);
    });
  }, [address, chainId]);
  return { maxStakePerKey };
};

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

export const useGetEsXaiAllowance = () => {
  const [allowance, setAllowance] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getEsXaiAllowance(getNetwork(chainId), address).then((amount) => {
      setAllowance(amount);
    });
  }, [address, chainId]);
  return { allowance: allowance };
};

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

export const useGetUserInteractedPools = (refresh: boolean = false) => {
  const poolsLoaded = useRef(false);
  const { address, chainId } = useAccount();
  const [userPools, setUserPools] = useState<PoolInfo[]>([]);
  const [isLoading, setIsLoading] = useState(address ? true : false);
  const [totalClaimableAmount, setTotalClaimableAmount] = useState(0);

  useEffect(() => {
    const populateUserPools = async () => {

      setIsLoading(true);
      const userPoolAddresses = await getPoolAddressesOfUser(getNetwork(chainId), address);

      if (!userPoolAddresses.length) {
        setIsLoading(false);
      }

      let totalClaim = 0;

      for (let index = 0; index < userPoolAddresses.length; index++) {
        const poolAddress = userPoolAddresses[index];

        let poolInfo: PoolInfo;

        try {
          poolInfo = await getPoolInfo(getNetwork(chainId), poolAddress, address);
          setUserPools(userPools => [...userPools, poolInfo]);
          totalClaim += poolInfo.userClaimAmount || 0;
          setTotalClaimableAmount(totalClaim);
          await new Promise((resolve) => setTimeout(resolve, 100));

        } catch (error) {
          // console.error("Error loading user pool", poolAddress, error);
        }
      }

      setIsLoading(false);
    }

    if (!address || !chainId) {
      return;
    }

    if (!poolsLoaded.current) {
      poolsLoaded.current = true;
      populateUserPools();
    }
  }, [address, chainId, refresh]);

  return { userPools, isLoading, totalClaimableAmount };
};

export const useGetUserPoolInfo = (poolAddress: string | null, refresh: boolean = false) => {
  const poolsLoaded = useRef(false);
  const { address, chainId } = useAccount();
  const [userPool, setUserPool] = useState<PoolInfo>();

  useEffect(() => {
    if (!address || !chainId || !poolAddress) {
      return;
    }

    poolsLoaded.current = true;
    getPoolInfo(getNetwork(chainId), poolAddress, address)
      .then(pool => {
        setUserPool(pool);
      })
      .catch((err) => {
        //TODO show error ?
        console.error("Error loading Pool", err);
      });

  }, [address, chainId, poolAddress, refresh]);

  return { userPool };
};


export const useFindBlackListWordsHooks = ({
  name,
  description,
  logoUrl,
}: PoolDetails) => {
  const [badInputName, setBadInputName] = useState(false);
  const [badInputDescription, setBadInputDescription] = useState(false);
  const [debouncedInputValue, setDebouncedInputValue] = useState({
    name: "",
    description: "",
    logoUrl: "",
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedInputValue({ name, description, logoUrl });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [description, logoUrl, name]);

  const checkBlackListWords = ({ name, description }: PoolDetails) => {
    setBadInputName(false);
    setBadInputDescription(false);

    BLACK_LIST.forEach((word) => {
      if (name.toLowerCase().includes(word)) {
        setBadInputName(true);
      }
      if (description.toLowerCase().includes(word)) {
        setBadInputDescription(true);
      }
    });
  };

  useEffect(() => {
    checkBlackListWords(debouncedInputValue);
  }, [debouncedInputValue]);

  return { badInputName, badInputDescription };
};

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

export const useGetKYCApproved = () => {
  const [isApproved, setIsApproved] = useState(false);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    isKYCApproved(getNetwork(chainId), address).then((approved) => {
      setIsApproved(approved);
    });
  }, [address, chainId]);
  return { isApproved };
};

export const useGetPoolInfoHooks = () => {
  const [poolDetailsValues, setPoolDetailsValues] = useState({
    name: "",
    description: "",
    logoUrl: "",
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
  const [tokenTracker, setTokenTracker] = useState({
    trackerName: "",
    trackerTicker: "",
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
        setTokenTracker({
          trackerName: "",
          trackerTicker: "",
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
    tokenTracker,
    setTokenTracker,
    rewardsValues,
    isLoading,
    setRewardsValues,
    poolAddress,
    delegateAddress,
    setDelegateAddress,
  };
};

export const useGetUserTotalStakedKeysCount = () => {
  const [stakedKeysAmount, setStakedKeysAmount] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;

    const getStakedKeysCountAsync = async () => {
      const response = await getStakedKeysCount(getNetwork(chainId), address);
      setStakedKeysAmount(response);
    };

    getStakedKeysCountAsync();
  }, [address, chainId]);

  return { stakedKeysAmount };
};

export const useGetAvailableKeysForStaking = () => {
  const [availableKeys, setAvailableKeys] = useState(0);
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!address || !chainId) return;
    getAvailableKeysForStaking(getNetwork(chainId), address).then((keys) => {
      setAvailableKeys(keys);
    });
  }, [address, chainId]);
  return { availableKeys };
};

export const useGetMaxKeyPerPool = () => {
  const [maxKeyPerPool, setMaxKeyPerPool] = useState(600);
  const { chainId } = useAccount();

  useEffect(() => {
    if (!chainId) return;
    getMaxKeyCount(getNetwork(chainId)).then((keys) => {
      setMaxKeyPerPool(keys);
    });
  }, [chainId]);
  return { maxKeyPerPool };
};
