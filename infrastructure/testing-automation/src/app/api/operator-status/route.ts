import { NextResponse } from "next/server";
import { checkOperatorStatus } from "@/services/checkOperatorStatus";

export async function GET() {
  try {
    const isOperatorRunning = await checkOperatorStatus();

    return NextResponse.json({ running: isOperatorRunning }, { status: 200 });
  } catch (error) {
    return new NextResponse(`Error checking operator status: ${error}`, {
      status: 500,
    });
  }
}
