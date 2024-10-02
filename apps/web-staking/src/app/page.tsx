import { DashboardComponent } from "@/app/components/dashboard/DashboardComponent";
import { getNetworkData, INetworkData } from "@/server/services/Pool.service";
import { getNetwork } from "@/services/web3.service";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Dashboard | Xai",
  description: "Xai App Dashboard",
  openGraph: {
      title: "Xai Staking App",
      description: "Stake keys & esXai to earn rewards",
      url: "https://app.xai.games",
      siteName: "Xai Games",
      images: [
        {
          url: '/images/xai-preview.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Xai Staking App',
      description: 'Stake keys & esXai to earn rewards',
      siteId: '@xai_games',
      creator: '@xai_games',
      images: ['/images/xai-preview.jpg'],
    },
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
