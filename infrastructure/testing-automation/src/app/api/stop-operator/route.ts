import { stopOperator } from "@/services/bootOperator";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await stopOperator();
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Failed to boot operator: ${error}`, { status: 500 });
    }
}
