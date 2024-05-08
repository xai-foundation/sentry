import SummaryComponent from "@/app/components/summary/SummaryComponent";
import { isPoolBanned } from "@/server/services/Pool.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pool",
  description: "Xai App Pool"
};

const Summary = async ({ params }: { params: { poolAddress: string } }) => {

  let isBannedPool: boolean = false;
  try {

    isBannedPool = await isPoolBanned(params.poolAddress);
  } catch (error) {
    console.error("Failed to load pool", error);
  }

  return (
    <>
      <SummaryComponent isBannedPool={isBannedPool} />
    </>
  );
};

export default Summary;
