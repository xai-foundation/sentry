import { NextResponse } from "next/server";
import { getChallengeIntervalSeconds } from "@/services/challengeInterval";

export async function GET() {
    try {
        const challengeInterval = getChallengeIntervalSeconds();
        return new NextResponse(JSON.stringify({ interval: challengeInterval }), {
            status: 200,
        });
    } catch (error: any) {
        return new NextResponse(`Failed get challenge interval: ${error.message}`, { status: 500 });
    }
}
