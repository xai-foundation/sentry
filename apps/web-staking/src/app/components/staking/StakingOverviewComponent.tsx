"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import SearchBarComponent from "./SearchBarComponent";
import AvailablePoolsTableComponent from "./AvailablePoolsTableComponent";
import StakedPoolsTable from "./StakedPoolsTable";
import ClaimableRewardsComponent from "./ClaimableRewardsComponent";
import MainTitle from "../titles/MainTitle";
import { PagedPools } from "@/server/services/Pool.service";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import AgreeModalComponent from "../modal/AgreeModalComponents";
import { useGetMaxKeyPerPool, useGetTotalStakedHooks, useGetUserInteractedPools } from "@/app/hooks/hooks";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";
import { getNetwork, getTotalClaimAmount, mapWeb3Error } from "@/services/web3.service";
import { Id } from "react-toastify";
import { useGetTiers } from "@/app/hooks/useGetTiers";

export const StakingOverviewComponent = ({ pagedPools }: { pagedPools: PagedPools }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userPools, isLoading, totalClaimableAmount } = useGetUserInteractedPools();
  const { totalStaked, maxStakedCapacity } = useGetTotalStakedHooks();
  const { tiers } = useGetTiers();
  const { maxKeyPerPool } = useGetMaxKeyPerPool();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 1);
  const [showTableKeys, setShowTableKeys] = useState(searchParams.get("showKeys") ? searchParams.get("showKeys") === "true" : false);
  const [hideFullKeys, setHideFullKeys] = useState(searchParams.get("hideFullKeys") ? searchParams.get("hideFullKeys") === "true" : false);
  const [hideFullEsXai, setHideFullEsXai] = useState(searchParams.get("hideFull") ? searchParams.get("hideFull") === "true" : true);
  const [currentTotalClaimableAmount, setCurrentTotalClaimableAmount] = useState<number>(totalClaimableAmount);
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const toastId = useRef<Id>();

  // Substitute Timeouts with useWaitForTransaction
  const { data, isError, isLoading: transactionLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  useEffect(() => {
    setCurrentTotalClaimableAmount(totalClaimableAmount);
  }, [isLoading, totalClaimableAmount]);

  const updateOnSuccess = useCallback(() => {
    updateNotification(
      "Successfully claimed",
      toastId.current as Id,
      false,
      receipt,
      chainId
    );

    getTotalClaimAmount(getNetwork(chainId), userPools.map(p => p.address), address!)
      .then(totalClaim => {
        setCurrentTotalClaimableAmount(totalClaim);
      });
  }, [receipt, chainId, userPools, address])

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

  const onClaimAll = async () => {
    if (isLoading || transactionLoading) {
      return;
    }

    const poolsToClaim = userPools.filter(p => p.userClaimAmount && p.userClaimAmount > 0).map(p => p.address);

    toastId.current = loadingNotification("Transaction pending...");
    try {

      setReceipt(await executeContractWrite(
        WriteFunctions.claimFromPools,
        [poolsToClaim.slice(0, 10)], //TODO test if this works for more than 10 pools in 1 transaction
        chainId,
        writeContractAsync,
        switchChain
      ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
    }
  };

  const buildURI = (search: string, page: number, showTable: boolean, hideKeys: boolean, hideEsXai: boolean) => {
    return `/staking?chainId=${chainId}&search=${search}&page=${page}&showKeys=${showTable}&hideFull=${hideEsXai}&hideFullKeys=${hideKeys}`
  }

  const submitSearch = () => {
    setCurrentPage(1);
    router.push(buildURI(searchValue, 1, showTableKeys, hideFullKeys, hideFullEsXai),
      { scroll: false }
    );
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    router.push(buildURI(searchValue, page, showTableKeys, hideFullKeys, hideFullEsXai),
      { scroll: false }
    );
  };

  const onToggleShowKeys = (showKeys: boolean) => {
    setShowTableKeys(showKeys);
    router.push(buildURI(searchValue, currentPage, showKeys, hideFullKeys, hideFullEsXai),
      { scroll: false }
    );
  };

  const onClickFilterCB = (checked: boolean) => {
    if (showTableKeys) {
      setHideFullKeys(checked);
      router.push(buildURI(searchValue, currentPage, showTableKeys, checked, hideFullEsXai),
        { scroll: false }
      );
    } else {
      setHideFullEsXai(checked);
      router.push(buildURI(searchValue, currentPage, showTableKeys, hideFullKeys, checked),
        { scroll: false }
      );
    }
  }

  return (
    <div className="relative flex sm:flex-col items-start lg:px-6 sm:px-0 sm:w-full">
      <AgreeModalComponent address={address} />
      <div className="flex justify-between w-full flex-col xl:flex-row sm:mb-[70px] lg:mb-6 xl:mb-3">
        <MainTitle title={"Staking"} classNames="sm:indent-4 lg:indent-0" />

        {address && <div className="sm:w-[91%] absolute sm:right-[17px] sm:top-[85px] lg:right-[55px] lg:top-6 lg:w-[450px] shadow-light"><ClaimableRewardsComponent
          disabled={isLoading || transactionLoading || currentTotalClaimableAmount === 0}
          totalClaimAmount={currentTotalClaimableAmount}
          onClaim={onClaimAll}
        /></div>}

      </div>

      {(address && (userPools.length > 0 || totalStaked > 0)) && <StakedPoolsTable v1Stake={totalStaked} v1MaxStake={maxStakedCapacity} userPools={userPools} tiers={tiers} showTableKeys={showTableKeys} maxKeyPerPool={maxKeyPerPool} />}

      <SearchBarComponent
        searchValue={searchValue}
        showTableKeys={showTableKeys}
        setSearchValue={setSearchValue}
        setShowKeyInfo={setShowTableKeys}
        setClickSearch={submitSearch}
        filterCheckbox={showTableKeys ? hideFullKeys : hideFullEsXai}
        setFilterCheckbox={onClickFilterCB}
        onToggleShowKeys={onToggleShowKeys}
        showedPools={pagedPools.count}
        hiddenPools={pagedPools.totalPoolsInDB - pagedPools.count}
        userPools={userPools.length}
      />

      <AvailablePoolsTableComponent
        showTableKeys={showTableKeys}
        pools={pagedPools.poolInfos}
        page={currentPage}
        totalPages={Math.ceil(pagedPools.count / 10)}
        setPage={setPage}
        address={address}
        tiers={tiers}
        maxKeyPerPool={maxKeyPerPool}
      /> 
    </div>
  );
}