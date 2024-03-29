import { updatePool } from "@/server/services/Pool.service";
import { NextRequest, NextResponse } from "next/server";
import { UpdateablePoolProps } from "@/types/Pool";
import { getPoolInfo } from "@/services/web3.service";

/**
 * UPDATE DB
 */
export async function POST(
	req: NextRequest
) {
	try {
		const body = await req.json();

		if (!body.network) {
			return new NextResponse("NETWORK not found", { status: 400 });
		};

		const poolInfo = await getPoolInfo(body.network, body.poolAddress);

		const formatUpdateData: UpdateablePoolProps = {
			name: poolInfo.meta.name,
			description: poolInfo.meta.description,
			logo: poolInfo.meta.logo,
			keyCount: poolInfo.keyCount,
			totalStakedAmount: poolInfo.totalStakedAmount,
			maxStakedAmount: poolInfo.maxStakedAmount,
			tierIndex: poolInfo.tier?.index,
			ownerShare: poolInfo.ownerShare,
			keyBucketShare: poolInfo.keyBucketShare,
			stakedBucketShare: poolInfo.stakedBucketShare,
			updateSharesTimestamp: poolInfo.updateSharesTimestamp,
			pendingShares: poolInfo.pendingShares,
			socials: [poolInfo.meta.website, poolInfo.meta.twitter, poolInfo.meta.discord, poolInfo.meta.telegram, poolInfo.meta.instagram, poolInfo.meta.tiktok, poolInfo.meta.youtube]
		};

		await updatePool({ poolAddress: body.poolAddress }, formatUpdateData);

		return NextResponse.json({ status: 200 });
	} catch (error: any) {
		return new NextResponse(error.message, { status: 400 })
	};
};