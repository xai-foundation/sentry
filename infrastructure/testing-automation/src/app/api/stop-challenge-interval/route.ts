import { NextResponse } from "next/server";
import { stopChallengeInterval } from "@/services/challengeInterval";

export async function GET() {
    try {
        stopChallengeInterval();
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return new NextResponse(`Failed to stop challenge interval: ${error.message}`, { status: 500 });
    }
}
