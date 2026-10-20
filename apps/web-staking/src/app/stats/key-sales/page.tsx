import { Metadata } from "next";
import { KeySalesComponent } from "@/app/components/stats/KeySalesComponent";
import { SentryKeySaleData, getSentryKeySales } from "@/server/services/KeySales.service";
import { getNetwork } from "@/services/web3.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sentry Key Sales",
  description: "Sentry Key sales of the Xai network over time"
};

// This page is intentionally not linked from the app navigation; it is linked from the gitbook.
export default async function KeySalesStats({ searchParams }: {
  searchParams: Promise<{ chainId: number | undefined }>
}) {
  const { chainId } = await searchParams;

  let sales: SentryKeySaleData = { days: [], splitDay: null, keyMultiplier: 1, lastUpdated: null };
  let loadError = false;
  try {
    sales = await getSentryKeySales(getNetwork(chainId));
  } catch (err) {
    console.error("Failed to load Sentry Key sales", err);
    loadError = true;
  }

  return (
    <main>
      <KeySalesComponent sales={sales} loadError={loadError} />
    </main>
  );
}
