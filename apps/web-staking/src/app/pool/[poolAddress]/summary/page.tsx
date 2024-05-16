import SummaryComponent from "@/app/components/summary/SummaryComponent";
import { findPool } from "@/server/services/Pool.service";
import { PoolInfo } from "@/types/Pool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pool",
  description: "Xai App Pool"
};

const Summary = async ({ params }: { params: { poolAddress: string } }) => {

  let isBannedPool: boolean = false;
  let pool: PoolInfo | undefined = undefined;

  try {
    pool = await findPool({ poolAddress: params.poolAddress });
    isBannedPool = pool.visibility == "banned";
  } catch (error) {
    console.error("Failed to load pool", error);
  }

  return (
    <>
      <SummaryComponent isBannedPool={isBannedPool} poolFromDb={pool} />
    </>
  );
};

export default Summary;
