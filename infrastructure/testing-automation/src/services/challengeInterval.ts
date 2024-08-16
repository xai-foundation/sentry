import path from "path";
import fs from 'fs';
import { submitChallenge } from "./challenger";

const UPLOAD_DIR = process.env['UPLOAD_DIR'] || "";
const statusFileDir = path.join(UPLOAD_DIR, 'interval_status');
const statusFilePath = path.join(statusFileDir, 'challenge_interval_status.json');

type ChallengeIntervalStatus = {
    intervalId: number | null;
    intervalSeconds: number | null;
}

const updateStatusFile = (challengeIntervalStatus: ChallengeIntervalStatus) => {
    fs.writeFileSync(statusFilePath, JSON.stringify(challengeIntervalStatus));
}

const readStatusFile = (): ChallengeIntervalStatus => {
    return JSON.parse(fs.readFileSync(statusFilePath, 'utf-8'));
}

export const startChallengeInterval = async (intervalSeconds: number) => {
    if (challengeIntervalRunning()) {
        throw new Error('Challenge interval already running');
    }

    try {
        await submitChallenge();
        console.log('Challenge interval: Submitting new challenge');
    } catch (error) {
        stopChallengeInterval();
        throw new Error(`Terminating challenge interval: Error submitting challenge: ${error}`);
    }

    const intervalId = Number(setInterval(async () => {
        try {
            await submitChallenge();
            console.log('Challenge interval: Submitting new challenge');
        } catch (error: any) {
            console.warn(`Challenge interval: Error submitting challenge: ${error}`);
            console.warn('Challenge interval: Terminating interval');
            stopChallengeInterval();
        }
    }, intervalSeconds * 1000));

    updateStatusFile({ intervalId, intervalSeconds });
}

export const stopChallengeInterval = () => {
    if (!challengeIntervalRunning()) {
        throw new Error('No challenge interval running');
    }
    const status = readStatusFile();
    clearInterval(status.intervalId!);
    updateStatusFile({ intervalId: null, intervalSeconds: null });
}

export const challengeIntervalRunning = (): boolean => {
    const status = readStatusFile();
    return status.intervalId != null && status.intervalSeconds != null;
}

export const getChallengeIntervalSeconds = (): number => {
    if (!challengeIntervalRunning()) {
        return 0;
    }
    const status = readStatusFile();
    return status.intervalSeconds!; // intervalSeconds is always defined when interval is running
}
