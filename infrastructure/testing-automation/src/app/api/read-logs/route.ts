import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env["UPLOAD_DIR"] || "/app";
const statusFileDir = path.join(UPLOAD_DIR, "status");
const statusFilePath = path.join(statusFileDir, "operator_status");
const filePath = path.join(process.cwd(), "logs", "sentry-cli.log");
import { readdir } from "fs/promises";

function formatLog(log: string) {
  return log
    .split("\n")
    .map((line) => {
      const timestamp = new Date().toISOString();
      return `[${timestamp}] ${line}`;
    })
    .join("\n");
}

function cleanLogContent(logContent: string) {
  // Strip out ANSI escape sequences and redundant lines
  return logContent
    .replace(/\x1b\[.*?m/g, '') // Remove ANSI escape sequences
    .replace(/\[.*?K/g, '') // Remove more ANSI sequences
    .replace(/sentry-node\$ .*/g, '') // Remove repeated prompts
    .replace(/Enter the private key of the operator:.*/g, 'Enter the private key of the operator: *****') // Mask private key
    .replace(/\[.*?Z\]/g, '') // Remove redundant timestamps
    .split('\n') // Split into lines
    .filter((line, index, lines) => !line.includes('sentry-node$') || line !== lines[index - 1]) // Remove consecutive redundant lines
    .join('\n'); // Join back into a single string
}

export async function GET(request: NextRequest) {
  try {
     const logDir = path.join(process.cwd(), "logs");
    const files = await readdir(logDir);
    const walletAddress = request.nextUrl.searchParams.get("walletAddress") || ""
    //
    // if (walletAddress || walletAddress.length < 20) {
    //   return new NextResponse("No files found. Probably this wallet hasn't operated any runs.", { status: 404 });
    // }

    // Filter log files
    const logFiles = files.filter((file) => path.extname(file) === ".log");

    if (logFiles.length === 0) {
      return new NextResponse("No log files found!", { status: 404 });
    }

    // Get file stats including mtime
    const logFileStats = await Promise.all(
        logFiles.map(async file => {
          const filePath = path.join(logDir, file);
          const stats = await fs.promises.stat(filePath);
          return { file, mtime: stats.mtime };
        })
    );

    // Sort log files by mtime
    logFileStats.sort((a: any, b: any) => a.mtime - b.mtime);

    // Get the latest log file (last one in the sorted array)
    const latestLogFile = logFileStats[logFileStats.length - 1].file;

    const filePath = path.join(logDir, latestLogFile);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Log file not found!", { status: 404 });
    }

    const logs = fs.readFileSync(filePath, "utf-8");
    const formattedLogs = formatLog(logs);
    const cleanedLogs = cleanLogContent(formattedLogs);

    // Split logs by "boot-operator" and filter out any empty segments
    let tests = cleanedLogs.split("boot-operator");

    // Remove segments that contain "boot-operator" explicitly
    const filteredTests = tests.filter(test => test[0] !== "boot-operator" && test[0] !== " ");

    // Reverse the order to follow the pattern 5,4,3,2,1 (newest to oldest)
    const orderedTests = filteredTests.reverse();

    // Add the "boot-operator" marker back to each segment and join them into a single string
    const finalLogs = orderedTests.map(test => "boot-operator \n" + test).join('');

    return NextResponse.json({ cleanedLogs: finalLogs }, { status: 200 });
  } catch (error) {
    return new NextResponse(`Failed to read logs: ${error}`, { status: 500 });
  }
}
