import { redirect } from "next/navigation";
import { StakingOverviewComponent } from "../components/staking/StakingOverviewComponent";
import { PagedPools, findPools } from "@/server/services/Pool.service";
import { getNetwork } from "@/services/web3.service";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Staking",
  description: "Xai App Staking"
};

export default async function Staking({ searchParams }: {
  searchParams: {
    page: number,
    search: string,
    chainId: number,
    hideFull: string,
    hideFullKeys: string,
    sort: string,
    sortOrder: number;
    esXaiMinStake: number;
  }
}) {

  const isSortedByName = () => {
    if (searchParams.sort !== "name") {
      return Number(searchParams.sortOrder);
    }

    if (Number(searchParams.sortOrder) === 1) {
      return -1;
    } else {
      return 1;
    }

  };


  const pageFilter: any = {
    limit: 10,
    page: searchParams.page ? Number(searchParams.page) : 1,
    sort: searchParams.sort ? [[searchParams.sort, isSortedByName()]] : [["tierIndex", -1]]
  };

  const searchName = searchParams.search || "";
  const hideFullEsXai = searchParams.hideFull ? searchParams.hideFull === "true" : true;
  const hideFullKeys = searchParams.hideFullKeys ? searchParams.hideFullKeys === "true" : false;
  const esXaiMinStake = searchParams.esXaiMinStake || 0;

  let pagedPools: PagedPools;
  try {
    pagedPools = await findPools({ pagination: pageFilter, searchName, network: getNetwork(searchParams.chainId), hideFullEsXai, hideFullKeys, esXaiMinStake})
  } catch (err) {
    console.error("Failed to load pools", err);
    redirect("/");
  }

  return (
      <div className="flex w-full flex-col items-center xl:px-[50px] lg:pb-[40px]">
        <StakingOverviewComponent pagedPools={pagedPools} />
      </div>
  );
}
