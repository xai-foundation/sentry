import {NextRequest, NextResponse} from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { readdir } from "fs/promises";

// Set correct directory path
const UPLOAD_DIR = process.env['UPLOAD_DIR'] || "";
const logsDir = path.join(UPLOAD_DIR, 'logs');
const statusFileDir = path.join(logsDir, "status");
const operatorStatusFile = path.join(statusFileDir, "operator_status");
const zipFilePath = path.join(statusFileDir, "operator_status.zip");

const ensureDirectory = async (dir: string) => {
  try {
    await fs.promises.access(dir, fs.constants.F_OK);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      await fs.promises.mkdir(dir, { recursive: true });
    } else {
      throw error;
    }
  }
};

const createLogArchive = async (): Promise<string> => {
  await ensureDirectory(statusFileDir);

  return new Promise((resolve, reject) => {
    // Ensure the operatorStatusFile exists
    if (!fs.existsSync(operatorStatusFile)) {
      reject(new Error(`File not found: ${operatorStatusFile}`));
      return;
    }

    // Create write stream for the zip file
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level
    });

    // Handle stream events
    output.on("close", () => {
      resolve(zipFilePath);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Append the text file to the archive
    const fileName = path.basename(operatorStatusFile);
    archive.file(operatorStatusFile, { name: fileName });

    // Finalize the archive (ie, create the zip file)
    archive.finalize();
  });
};

export async function GET(request: NextRequest) {
  try {
    const logDir = path.join(process.cwd(), "logs");

    const files = await readdir(logDir);

    const walletAddress = request.nextUrl.searchParams.get("walletAddress") || ""
    //
    // if (walletAddress.length < 20) {
    //   return new NextResponse("No files found. Probably this wallet hasn't operated any runs.", { status: 404 })
    // }

    // Filter log files
    const logFiles = files.filter((file) =>
        path.extname(file) === ".log"
    );

    if (logFiles.length === 0) {
      return new NextResponse("No log files found", { status: 404 });
    }

    const archivePath = path.join(process.cwd(), "logs.zip");
    const output = fs.createWriteStream(archivePath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log(
        "Archiver has been finalized and the output file descriptor has closed."
      );
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);

    for (const file of logFiles) {
      const filePath = path.join(logDir, file);
      archive.file(filePath, { name: file });
    }

    await archive.finalize();
    await new Promise((resolve, reject) => {
      output.on("finish", resolve);
      output.on("error", reject);
    });

    const zipContent = fs.readFileSync(archivePath);

    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=logs.zip",
      },
    });
  } catch (error: any) {
    console.error("Error creating and downloading logs:", error);
    return new NextResponse(error.message, { status: 400 });
  }
}
