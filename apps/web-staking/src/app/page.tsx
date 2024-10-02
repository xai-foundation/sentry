import { DashboardComponent } from "@/app/components/dashboard/DashboardComponent";
import { getNetworkData, INetworkData } from "@/server/services/Pool.service";
import { getNetwork } from "@/services/web3.service";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Dashboard | Xai",
  description: "Xai App Dashboard"
};

export default async function Home({ searchParams }: {
  searchParams: { chainId: number | undefined }
}) {

  let networkData!: INetworkData;
  try {
    networkData = await getNetworkData(getNetwork(searchParams.chainId));
  } catch (err) {
    console.error("Failed to load pools", err);
  }

  return (
    <main>
      <DashboardComponent
        networkData={networkData}
      />
    </main>
  );
}
