import { ethers } from "ethers";
import { config } from "../config.js";
import { getProvider, RefereeAbi } from "../index.js";



export async function getChallengerPublicKey(): Promise<string> {
    const provider = getProvider();
    const referee = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
    const publicKey = await referee.challengerPublicKey();

    return publicKey;
}