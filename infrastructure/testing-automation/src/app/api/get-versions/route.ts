import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env['UPLOAD_DIR'] || "";
const versionsDir = path.join(UPLOAD_DIR, 'versions');

const listVersions = async (): Promise<string[]> => {
    try {
        // Check if the versions directory exists
        if (!fs.existsSync(versionsDir)) {
            throw new Error(`Versions directory does not exist: ${versionsDir}`);
            return []; // Return an empty array if the directory doesn't exist
        }
        const versions = await fs.promises.readdir(versionsDir);

        return versions.filter(version => fs.statSync(path.join(versionsDir, version)).isDirectory());

    } catch (error: any) {
        throw new Error(`Error reading versions directory: ${error.message}`);
    }
};

export async function GET() {
    try {
        const versions = await listVersions();
        return new NextResponse(JSON.stringify({ versions }), {
            status: 200,
        });
    } catch (error: any) {
        return new NextResponse(`Failed to list versions: ${error.message}`, { status: 500 });
    }
}