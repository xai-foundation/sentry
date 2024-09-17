import { ethers } from "ethers";
import { config } from "../config.js";
import { getProvider, RefereeAbi } from "../index.js";



export async function getChallengerPublicKey(): Promise<string> {

    try {
        const provider = getProvider();
        const referee = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
        const publicKey = await referee.challengerPublicKey();

        return publicKey;
        
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        throw new Error(`Error getting challenger public key: ${message}`);        
    }
}
