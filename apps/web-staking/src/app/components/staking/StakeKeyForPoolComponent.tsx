"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

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
import { Id } from "react-toastify";

export default function StakeForPoolComponent() {
  const router = useRouter();
  const { chainId, address } = useAccount();
  const { poolAddress, isStake } = useParams<{ poolAddress: string, isStake: string }>();
  const [poolInfo, setPoolInfo] = useState({} as PoolInfo);
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const toastId = useRef<Id>()

  // Substitute Timeouts with useWaitForTransaction
  const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

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

  const updateOnSuccess = useCallback(() => {
    updateNotification(
      `${Boolean(isStake) ? "Successfully stakedKeys" : "Successfully unstakedKeys"}`,
      toastId.current as Id,
      false,
      receipt,
      chainId
    );
  }, [isStake, receipt, chainId])

  const updateOnError = useCallback(() => {
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
  }, [status])

  useEffect(() => {
    if (isSuccess) {
      updateOnSuccess();
    }
    if (isError) {
      updateOnError();
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);

  const onStakeKeys = async (numKeys: number) => {
    toastId.current = loadingNotification("Transaction pending...");
    try {
      const keyIds = await getUnstakedKeysOfUser(
        getNetwork(chainId),
        address as string,
        Number(numKeys)
      );
      setReceipt(await executeContractWrite(
        WriteFunctions.stakeKeys,
        [poolAddress, keyIds],
        chainId,
        writeContractAsync,
        switchChain
      ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current, true);
    }
  };

  const onUnstakeKeys = async (numKeys: number) => {
    toastId.current = loadingNotification("Transaction pending...");
    try {
      const keyIds = await getUnstakedKeysOfUser(
        getNetwork(chainId),
        address as string,
        Number(numKeys)
      );
      setReceipt(await executeContractWrite(
        WriteFunctions.stakeKeys,
        [poolAddress, keyIds],
        chainId,
        writeContractAsync,
        switchChain
      ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center sm:px-3 lg:px-[350px]">
      {poolInfo &&
        <StakePoolKeyComponent
          onConfirm={Boolean(isStake) ? onStakeKeys : onUnstakeKeys}
          poolName={poolInfo.meta.name}
          poolLogoUrl={poolInfo.meta.logo}
          onBack={() => router.back()}
          address={address}
          transactionLoading={isLoading}
          stakeKey={Boolean(isStake)}
        />
      }
    </div>
  );
};