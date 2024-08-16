import { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import unzipper from "unzipper";

const UPLOAD_DIR = process.env['UPLOAD_DIR'] || "";
const pipeline = promisify(require("stream").pipeline);
const versionsDir = path.join(UPLOAD_DIR, "versions");

// Ensure versions directory exists, create it if it doesn't
const ensureVersionsDirectory = async () => {
  try {
    await fs.promises.access(versionsDir, fs.constants.F_OK); // Check if directory exists
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Directory doesn't exist, create it
      await fs.promises.mkdir(versionsDir, { recursive: true });
    } else {
      throw error; // Throw any other access errors
    }
  }
};

const downloadAndUnzip = async (downloadLink: string): Promise<string> => {
  try {
    await ensureVersionsDirectory(); // Ensure versions directory exists
    const response = await fetch(downloadLink);
    if (!response.ok) {
      throw new Error(`Failed to download file from ${downloadLink}`);
    }
    const version = downloadLink.split("/")[7];

    // TODO name like actual version
    const zipFileName = `${version}.zip`; // Unique filename for each download
    const zipFilePath = path.join(versionsDir, zipFileName);

    // Save the file to the versions folder
    await pipeline(response.body, fs.createWriteStream(zipFilePath));

    // Unzip the downloaded file
    const unzipFolder = path.join(versionsDir, version);
    // Create the directory if it doesn't exist
    await fs.promises.mkdir(unzipFolder, { recursive: true });

    // Extract files from the zip archive
    await fs
      .createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: unzipFolder }))
      .promise();

    // Remove the downloaded zip file after unzip
    await fs.promises.unlink(zipFilePath);

    return version;
  } catch (error) {
    throw error;
  }
};

export async function POST(req: Request, res: NextApiResponse) {
  const { downloadLink } = await req.json();

  if (!downloadLink) {
    return new NextResponse("No downloadlink detected", { status: 500 });
  }
  try {
    const version = await downloadAndUnzip(downloadLink);
    return NextResponse.json({ version }, { status: 200 });
  } catch (error: any) {
    console.error("Error downloading and unzipping:", error);
    return new NextResponse(error.message, { status: 400 });
  }
}
