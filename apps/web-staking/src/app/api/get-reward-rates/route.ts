import { getPoolRewardRatesByAddress } from "@/server/services/Pool.service";
import { PoolRewardRates } from "@/types/Pool";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const { poolAddresses } = await request.json();
  let rewardRates: PoolRewardRates[] = [];

  if (!poolAddresses) {
     return new NextResponse(
       JSON.stringify({ name: "Please provide pool addresses" }),
       { status: 400 }
     );
  }else if(poolAddresses.length > 0){
    rewardRates = await getPoolRewardRatesByAddress(poolAddresses);
  }

  return new NextResponse(JSON.stringify({ rewardRates: rewardRates }), {
    status: 200,
  });
}