import { NextRequest, NextResponse } from "next/server";
import { startChallengeInterval } from "@/services/challengeInterval";

export async function POST(request: NextRequest) {

    const { interval } = await request.json();

    if (!interval) {
        return new NextResponse("Challenge interval is required!", { status: 400 });
    }

    try {
        await startChallengeInterval(interval);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Failed to start challenge interval: ${error}`, { status: 500 });
    }
}
