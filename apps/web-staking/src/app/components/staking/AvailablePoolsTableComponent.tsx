import { PoolInfo, TierInfo } from "@/types/Pool";
import {
  TableHead,
  TableRowCapacity,
  TableRowLabel,
  TableRowPool,
  TableRowRewards,
} from "./TableChunksComponents";
import PaginationComponent from "../pagination/PaginationComponent";
import { getCurrentTierByStaking } from "./utils";
import { iconType } from "@/app/components/dashboard/constants/constants";
import { ConnectButton } from "../buttons/ButtonsComponent";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

const POOL_DATA_COLUMS = [
  "Pool",
  "Tier",
  "Key staking capacity",
  "Reward breakdown"
];

interface AvailableTableProps {
  showTableKeys: boolean;
  pools: PoolInfo[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  address: string | undefined;
  tiers: Array<TierInfo & { icon?: iconType }>;
}

const AvailablePoolsTableComponent = ({
  showTableKeys,
  pools,
  page,
  totalPages,
  setPage,
  address,
  tiers,
}: AvailableTableProps) => {
  const { open } = useWeb3Modal();
  const { isDisconnected } = useAccount();

  return (
    <>
      <table className="min-w-full text-base font-light mb-[25px]">
        <thead className="border-b">
          <tr>
            {POOL_DATA_COLUMS.map((column, index) => {
              return (
                <TableHead
                  key={index}
                  column={column}
                  index={index}
                  showTableKeys={showTableKeys}
                />
              );
            })}
          </tr>
        </thead>
        {pools.length > 0 && !isDisconnected && (
          <tbody>
            {pools.map((pool, index) => {
              return (
                <tr key={index} className={`border-b text-right`}>
                  <TableRowPool pool={pool}
                                tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount), tiers) as TierInfo & {
                                  icon: iconType
                                }} />
                  <TableRowLabel
                    tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount), tiers) as TierInfo & {
                      icon: iconType
                    }} poolAddress={pool.address} />
                  <TableRowCapacity pool={pool} showTableKeys={showTableKeys} />
                  <TableRowRewards pool={pool} showTableKeys={showTableKeys} />
                </tr>
              );
            })}
          </tbody>
        )}
      </table>
      {pools.length === 0 && address && <NoResultComponent />}
      <div className="flex sm:justify-center w-full">
        {isDisconnected && (
          <ConnectButton address={address} onOpen={open} />
        )}
      </div>
      <div className="flex sm:justify-center lg:justify-start w-full">
        <PaginationComponent
          pools={pools}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </div>
    </>
  );
};

function NoResultComponent() {
  return (
    <div className="w-full flex justify-center">
      <span className="text-graphiteGray py-[30px]">
        No search results found
      </span>
    </div>
  );
}

export default AvailablePoolsTableComponent;
