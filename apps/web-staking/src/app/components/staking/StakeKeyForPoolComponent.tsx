"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";

import { PoolDetails } from "@/app/components/createPool/PoolDetailsComponent";
import StakePoolKeyComponent from "@/app/components/createPool/StakePoolKeyComponent";
import {
  loadingNotification,
  updateNotification,
} from "@/app/components/notifications/NotificationsComponent";
import {
  getNetwork,
  getPoolInfo,
  getUnstakedKeysOfUser,
  mapWeb3Error,
} from "@/services/web3.service";
import { executeContractWrite, WriteFunctions } from "@/services/web3.writes";
import { PoolInfo } from "@/types/Pool";
import { sendUpdatePoolRequest } from "@/services/requestService";

export default function StakeForPoolComponent() {
  const router = useRouter();
  const { chainId, address } = useAccount();
  const { poolAddress, isStake } = useParams<{ poolAddress: string, isStake: string }>();
  const [poolInfo, setPoolInfo] = useState({} as PoolInfo);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const poolDetails: PoolDetails = {
    logoUrl: poolInfo?.meta.logo,
    name: poolInfo?.meta.name,
    description: poolInfo?.meta.description,
  };
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!chainId) {
      return;
    }

    getPoolInfo(getNetwork(chainId), poolAddress, address)
      .then((result) => {
        setPoolInfo(result);
        //setIsLoading(false);
      })
      .catch((err) => {
        //TODO show error ?
        console.error("Error loading Pool", err);
      });
  }, [address, poolAddress, chainId]);

  const onStakeKeys = async (numKeys: number) => {
    setTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {
      const keyIds = await getUnstakedKeysOfUser(
        getNetwork(chainId),
        address as string,
        Number(numKeys)
      );
      const receipt = await executeContractWrite(
        WriteFunctions.stakeKeys,
        [poolAddress, keyIds],
        chainId,
        writeContractAsync,
        switchChain
      );

      setTimeout(async () => {
        updateNotification(
          "Successfully stakedKeys",
          loading,
          false,
          receipt,
          chainId
        );

        sendUpdatePoolRequest(poolAddress, chainId);
        setTransactionLoading(false);
        //router.refresh()
      }, 3000);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
    }
  };

  const onUnstakeKeys = async (numKeys: number) => {
    setTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {
      const keyIds = await getUnstakedKeysOfUser(
        getNetwork(chainId),
        address as string,
        Number(numKeys)
      );
      const receipt = await executeContractWrite(
        WriteFunctions.stakeKeys,
        [poolAddress, keyIds],
        chainId,
        writeContractAsync,
        switchChain
      );


      setTimeout(async () => {
        updateNotification(
          "Successfully stakedKeys",
          loading,
          false,
          receipt,
          chainId
        );
        sendUpdatePoolRequest(poolAddress, chainId);
        setTransactionLoading(false);
        //router.refresh()
      }, 3000);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center sm:px-3 lg:px-[350px]">
      {poolInfo &&
        <StakePoolKeyComponent
          onConfirm={Boolean(isStake) ? onStakeKeys : onUnstakeKeys}
          poolDetailsValues={poolDetails}
          onBack={() => router.back()}
          address={address}
          transactionLoading={transactionLoading}
          stakeKey={Boolean(isStake)}
        />
      }
    </div>
  );
};