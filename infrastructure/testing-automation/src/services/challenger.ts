import { ethers } from "ethers";
import { getProvider } from "./getProvider";
import { config } from '../config/index';
import { RefereeAbi } from "@/abis/RefereeAbi";
import crypto from 'crypto';
import { getSignerFromPrivateKey } from "./getSignerFromPrivateKey";

const PRIVATE_KEY_FOR_CHALLENGER_WALLET = process.env["CHALLENGER_PRIVATE_KEY"];
const CHALLENGE_NUMBER_ASSERTION_OFFSET = 200;

export const submitChallenge = async () => {

    try {
        // Get the provider
        const provider = getProvider();

        // Create an instance of the Referee contract
        const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

        if (!PRIVATE_KEY_FOR_CHALLENGER_WALLET) {
            throw new Error("Missing private key for fake challenger");
        }
        const challengerWallet = getSignerFromPrivateKey(PRIVATE_KEY_FOR_CHALLENGER_WALLET);

        // Create an instance of the Referee contract
        const refereeWriteChallenger = new ethers.Contract(config.refereeAddress, RefereeAbi, challengerWallet.signer);

        const counter = Number(await refereeContract.challengeCounter());
        console.log("Current ChallengeCount = " + counter);
        let challenge = {
            assertionId: BigInt(counter + CHALLENGE_NUMBER_ASSERTION_OFFSET),
            predecessorAssertionId: BigInt(counter + CHALLENGE_NUMBER_ASSERTION_OFFSET - 1),
            confirmData: generateRandomHexHash(),
            assertionTimestamp: Math.floor(Date.now() / 1000),
            challengerSignedHash: generateRandomHexHash()
        }

        console.log("Submit next test challenge");
        // Submit the challenge to the Referee contract
        const tx = await refereeWriteChallenger.submitChallenge(
            challenge.assertionId,
            challenge.predecessorAssertionId,
            challenge.confirmData,
            challenge.assertionTimestamp,
            challenge.challengerSignedHash,
        );

        await tx.wait(1);

        return challenge;
    } catch (error: any) {
        throw new Error(error);
    }

}

function generateRandomHexHash() {
    // 32 bytes is 256 bits, and each byte is represented by two hex characters
    const randomBytes = crypto.randomBytes(32);
    return "0x" + randomBytes.toString('hex');
}
