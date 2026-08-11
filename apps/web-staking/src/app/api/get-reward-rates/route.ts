import { getPoolRewardRatesByAddress } from "@/server/services/Pool.service";
import { PoolRewardRates } from "@/types/Pool";
import { NextRequest, NextResponse } from "next/server";

const isAddressString = (value: unknown): value is string =>
  typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);

export async function POST(request: NextRequest) {
  const { poolAddresses } = await request.json();
  let rewardRates: PoolRewardRates[] = [];

  if (!poolAddresses) {
     return new NextResponse(
       JSON.stringify({ name: "Please provide pool addresses" }),
       { status: 400 }
     );
  }

  // Only accept an array of plain address strings. Without this, a caller can
  // pass objects (e.g. {"$regex": "..."}) which reach the $in query as Mongo
  // operators instead of values.
  if (!Array.isArray(poolAddresses) || !poolAddresses.every(isAddressString)) {
    return new NextResponse(
      JSON.stringify({ name: "poolAddresses must be an array of address strings" }),
      { status: 400 }
    );
  }

  if (poolAddresses.length > 0) {
    rewardRates = await getPoolRewardRatesByAddress(poolAddresses);
  }

  return new NextResponse(JSON.stringify({ rewardRates: rewardRates }), {
    status: 200,
  });
}