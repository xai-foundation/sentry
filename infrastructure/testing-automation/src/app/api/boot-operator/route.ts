import { NextRequest, NextResponse } from "next/server";
import { startOperator } from "@/services/bootOperator";

export async function POST(request: NextRequest) {
    //not implemented yet
    const { version, privateKey } = await request.json();

    if (!version || !privateKey) {
        return new NextResponse("Version and private key are required!", { status: 400 });
    }

    try {
        await startOperator(version, privateKey);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Failed to boot operator: ${error}`, { status: 500 });
    }
}
