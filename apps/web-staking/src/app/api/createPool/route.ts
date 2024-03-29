import { createPool } from "@/server/services/Pool.service";
import { getPoolInfo } from "@/services/web3.service";
import { CreatePool } from "@/types/Pool";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * CREATE A POOL ON CHAIN AND ADD TO DB
 */
export async function POST(
	req: NextRequest
) {
	try {
		const body = await req.json();
		const poolInfo = await getPoolInfo(body.network, body.poolAddress);

		const formatData: CreatePool = {
			poolAddress: body.poolAddress,
			poolIndex: 0,
			owner: poolInfo.owner,
			name: poolInfo.meta.name,
			description: poolInfo.meta.description,
			logo: poolInfo.meta.logo,
			keyBucketTracker: poolInfo.keyBucketTracker,
			esXaiBucketTracker: poolInfo.esXaiBucketTracker,
			keyCount: poolInfo.keyCount,
			totalStakedAmount: poolInfo.totalStakedAmount,
			maxStakedAmount: poolInfo.maxStakedAmount,
			tierIndex: poolInfo.tier?.index || 0,
			ownerShare: poolInfo.ownerShare,
			keyBucketShare: poolInfo.keyBucketShare,
			stakedBucketShare: poolInfo.stakedBucketShare,
			updateSharesTimestamp: poolInfo.updateSharesTimestamp,
			pendingShares: poolInfo.pendingShares,
			socials: [poolInfo.meta.website, poolInfo.meta.twitter, poolInfo.meta.discord, poolInfo.meta.telegram, poolInfo.meta.instagram, poolInfo.meta.tiktok, poolInfo.meta.youtube],
			network: body.network
		};

		await createPool(formatData);

		return NextResponse.json({ response: 200 });
	} catch (error: any) {
		return new NextResponse(error.message, { status: 400 })
	};
};