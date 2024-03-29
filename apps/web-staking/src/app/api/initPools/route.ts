import { createPool, findPool, updatePool } from "@/server/services/Pool.service";
import { NextRequest, NextResponse } from "next/server";
import { CreatePool, UpdateablePoolProps } from "@/types/Pool";
import { NetworkKey, getMaxKeyCount, getMaxStakedAmountPerLicense, getPoolAddressAtIndex, getPoolInfo, getPoolsCount, getRawPoolInfo, getWeb3Instance, toPoolInfo } from "@/services/web3.service";

export const dynamic = 'force-dynamic';

const REFRESH_INTERVAL = 60 * 1000; //Refresh every minute

/**
 * GET ALL POOLS FROM THE FACTORY AND UPDATE DB
 */
let intervalId: any;
let lastTimestamp: number = 0;
let lastRestart: number = 0;

function start(network: NetworkKey) {
	lastRestart = Date.now();
	populatePools(network);
	intervalId = setInterval(() => populatePools(network), REFRESH_INTERVAL);
};

function stop() {
	clearInterval(intervalId);
	intervalId = null;
};

async function populatePools(network: NetworkKey) {

	const poolsCount = await getPoolsCount(network);

	const maxKeyCount = await getMaxKeyCount(network);
	const maxStakePerLicense = await getMaxStakedAmountPerLicense(network);
	const web3 = getWeb3Instance(network);

	for (let i = 0; i < poolsCount; i++) {
		try {
			const poolAddressAtIndex = await getPoolAddressAtIndex(network, i);
			const rawPoolInfo = await getRawPoolInfo(network, poolAddressAtIndex);
			const poolInfo = toPoolInfo(web3, rawPoolInfo, undefined, maxKeyCount, maxStakePerLicense);

			const checkIfInDb = await findPool({ poolAddress: poolAddressAtIndex });

			if (!checkIfInDb) {
				const formatCreateData: CreatePool = {
					poolAddress: poolAddressAtIndex,
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
					updateSharesTimestamp: poolInfo.updateSharesTimestamp || 0,
					pendingShares: poolInfo.pendingShares || 0,
					socials: [poolInfo.meta.website, poolInfo.meta.twitter, poolInfo.meta.discord, poolInfo.meta.telegram, poolInfo.meta.instagram, poolInfo.meta.tiktok, poolInfo.meta.youtube],
					network: network
				};

				await createPool(formatCreateData);

			} else {

				const formatUpdateData: UpdateablePoolProps = {
					name: poolInfo.meta.name,
					description: poolInfo.meta.description,
					logo: poolInfo.meta.logo,
					keyCount: poolInfo.keyCount,
					totalStakedAmount: poolInfo.totalStakedAmount,
					maxStakedAmount: poolInfo.maxStakedAmount,
					tierIndex: poolInfo.tier?.index || 0,
					ownerShare: poolInfo.ownerShare,
					keyBucketShare: poolInfo.keyBucketShare,
					stakedBucketShare: poolInfo.stakedBucketShare,
					updateSharesTimestamp: poolInfo.updateSharesTimestamp || 0,
					pendingShares: poolInfo.pendingShares || 0,
					socials: [poolInfo.meta.website, poolInfo.meta.twitter, poolInfo.meta.discord, poolInfo.meta.telegram, poolInfo.meta.instagram, poolInfo.meta.tiktok, poolInfo.meta.youtube]
				};

				await updatePool({ poolAddress: poolInfo.address }, formatUpdateData);
			};
		} catch (error) {
			console.log("ERROR populating Pools:", error)
		}
	}

	lastTimestamp = Date.now();
};

export async function GET(
	req: NextRequest
) {

	//TODO check API key !

	try {
		const network = req.nextUrl.searchParams.get("network") as NetworkKey;
		const restart = req.nextUrl.searchParams.get("restart") as string;

		if (!network) {
			return new NextResponse("NETWORK not found", { status: 400 });
		}

		if (!intervalId) {
			start(network)
			return NextResponse.json({ message: "Interval started" });
		};

		if (restart === "true") {
			if (lastRestart + 60 * 1000 < Date.now()) {
				return new NextResponse("Timeout for restart not reached", { status: 400 });
			}

			if (intervalId) {
				stop();
			}
			start(network);
			return NextResponse.json({ message: "Interval restarted" });
		};

		return NextResponse.json({ lastTimestamp });
	} catch (error: any) {
		return new NextResponse(error.message, { status: 400 })
	};
};