"use client";

import { useEffect, useState } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import SearchBarComponent from "./SearchBarComponent";
import AvailablePoolsTableComponent from "./AvailablePoolsTableComponent";
import StakedPoolsTable from "./StakedPoolsTable";
import ClaimableRewardsComponent from "./ClaimableRewardsComponent";
import MainTitle from "../titles/MainTitle";
import { PagedPools } from "@/server/services/Pool.service";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import AgreeModalComponent from "../modal/AgreeModalComponents";
import { useGetUserInteractedPools } from "@/app/hooks/hooks";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";
import { getNetwork, getTotalClaimAmount, mapWeb3Error } from "@/services/web3.service";

export const StakingOverviewComponent = ({ pagedPools }: { pagedPools: PagedPools }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userPools, isLoading, totalClaimableAmount } = useGetUserInteractedPools();

  const [transactionLoading, setTransactionLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 1);
  const [showTableKeys, setShowTableKeys] = useState(searchParams.get("showKeys") ? searchParams.get("showKeys") === "true" : false);
  const [hideFullKeys, setHideFullKeys] = useState(searchParams.get("hideFullKeys") ? searchParams.get("hideFullKeys") === "true" : true);
  const [hideFullEsXai, setHideFullEsXai] = useState(searchParams.get("hideFull") ? searchParams.get("hideFull") === "true" : true);
  const [currentTotalClaimableAmount, setCurrentTotalClaimableAmount] = useState<number>(totalClaimableAmount);
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    setCurrentTotalClaimableAmount(totalClaimableAmount);
  }, [isLoading]);

  const onClaimAll = async () => {
    if (isLoading || transactionLoading) {
      return;
    }

    const poolsToClaim = userPools.filter(p => p.userClaimAmount && p.userClaimAmount > 0).map(p => p.address);

    setTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {

      const receipt = await executeContractWrite(
        WriteFunctions.claimFromPools,
        [poolsToClaim.slice(0, 10)], //TODO test if this works for more than 10 pools in 1 transaction
        chainId,
        writeContractAsync,
        switchChain
      );

      setTimeout(async () => {
        updateNotification(
          "Successfully claimed",
          loading,
          false,
          receipt,
          chainId
        );

        getTotalClaimAmount(getNetwork(chainId), userPools.map(p => p.address), address!)
          .then(totalClaim => {
            setTransactionLoading(false);
            setCurrentTotalClaimableAmount(totalClaim);
          });

      }, 3000);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
    }
  };

  const buildURI = (search: string, page: number, showTable: boolean, hideKeys: boolean, hideEsXai: boolean) => {
    return `/staking?chainId=${chainId}&search=${search}&page=${page}&showKeys=${showTable}&hideFull=${hideEsXai}&hideFullKeys=${hideKeys}`
  }

  const submitSearch = () => {
    router.push(buildURI(searchValue, currentPage, showTableKeys, hideFullKeys, hideFullEsXai),
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
    <div className="flex sm:flex-col items-start lg:px-6 sm:px-3 sm:w-full">
      <AgreeModalComponent address={address} />
      <div className="sm:flex sm:justify-between sm:w-full">
        <MainTitle title={"Staking"} classNames="" />

        {address && <ClaimableRewardsComponent
          disabled={isLoading || transactionLoading || currentTotalClaimableAmount === 0}
          totalClaimAmount={currentTotalClaimableAmount}
          onClick={onClaimAll}
        />}

      </div>

      {address && <StakedPoolsTable userPools={userPools} />}

      <SearchBarComponent
        searchValue={searchValue}
        showTableKeys={showTableKeys}
        setSearchValue={setSearchValue}
        setShowKeyInfo={setShowTableKeys}
        setClickSearch={submitSearch}
        filterCheckbox={showTableKeys ? hideFullKeys : hideFullEsXai}
        setFilterCheckbox={onClickFilterCB}
        onToggleShowKeys={onToggleShowKeys}
      />

      <AvailablePoolsTableComponent
        showTableKeys={showTableKeys}
        pools={pagedPools.poolInfos}
        page={currentPage}
        totalPages={Math.ceil(pagedPools.count / 10)}
        setPage={setPage}
      />
    </div>
  );
}