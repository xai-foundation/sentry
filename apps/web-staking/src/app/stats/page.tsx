import { Metadata } from "next";
import { EsXaiEmissionsComponent } from "@/app/components/stats/EsXaiEmissionsComponent";
import { EsXaiEmissionData, getEsXaiEmissions } from "@/server/services/Emissions.service";
import { getNetwork } from "@/services/web3.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "esXAI Emissions",
  description: "esXAI emissions of the Xai network over time"
};

// This page is intentionally not linked from the app navigation; it is linked from the gitbook.
export default async function Stats({ searchParams }: {
  searchParams: Promise<{ chainId: number | undefined }>
}) {
  const { chainId } = await searchParams;

  let emissions: EsXaiEmissionData = { days: [], lastUpdated: null };
  let loadError = false;
  try {
    emissions = await getEsXaiEmissions(getNetwork(chainId));
  } catch (err) {
    console.error("Failed to load esXAI emissions", err);
    loadError = true;
  }

  return (
    <main>
      <EsXaiEmissionsComponent emissions={emissions} loadError={loadError} />
    </main>
  );
}
