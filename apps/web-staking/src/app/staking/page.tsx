import { redirect } from "next/navigation";
import { StakingOverviewComponent } from "../components/staking/StakingOverviewComponent";
import { PagedPools, findPools } from "@/server/services/Pool.service";
import { getNetwork } from "@/services/web3.service";

export const dynamic = 'force-dynamic';

export default async function Staking({ searchParams }: { searchParams: { page: number, search: string, chainId: number, hideFull: string, hideFullKeys: string } }) {

  const pageFilter: any = {
    limit: 10,
    page: searchParams.page ? Number(searchParams.page) : 1,
    sort: [['tierIndex', -1], ['totalStakedAmount', -1], ['name', 1]]
  };

  const searchName = searchParams.search || "";
  const hideFullEsXai = searchParams.hideFull ? searchParams.hideFull === "true" : true;
  const hideFullKeys = searchParams.hideFullKeys ? searchParams.hideFullKeys === "true" : true;

  let pagedPools: PagedPools;
  try {
    pagedPools = await findPools({ pagination: pageFilter, searchName, network: getNetwork(searchParams.chainId), hideFullEsXai, hideFullKeys })
  } catch (err) {
    console.error("Failed to load pools", err);
    redirect("/");
  }

  return (
    <div className="flex w-full flex-col items-center lg:px-[130px] lg:pb-[40px]">
      <StakingOverviewComponent pagedPools={pagedPools} />
    </div>
  );
}
