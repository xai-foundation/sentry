import { submitChallenge } from "@/services/challenger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const challengeData = await submitChallenge();

        return NextResponse.json({ assertionId: String(challengeData.assertionId) }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Failed to submit challenge: ${error}`, { status: 500 });
    }
}
