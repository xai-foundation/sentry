import fs from "fs";
import { signERC2612Permit } from "../utils/signERC2612Permit.mjs";

const PATH_TO_CLAIM_AMOUNTS = "./wallet-xai-drop.json";
const GASLESS_CLAIM_ADDRESS = "0x5E90cEAf3020Ba175bD0946E39B5eCA67b9Dcc23";
const CHAIN_ID = 421614;
const NONCE_PER_RUN = 0;
const OUTPUT_FILE = "../../apps/web-connect/public/xai-drop-permits.JSON"

async function main() {
    const permitAdmin = (await ethers.getSigners())[0];
    const permitAdminAddress = await permitAdmin.getAddress();
    console.log(`Permit Admin Address: ${permitAdminAddress}`);

    // read the file of amounts
    const claimAmounts = JSON.parse(fs.readFileSync(PATH_TO_CLAIM_AMOUNTS, 'utf8'));

    // create list of permits
    const permits = {};
    for (const {userWalletAddress, amount} of claimAmounts) {
        const signature = await signERC2612Permit(
            GASLESS_CLAIM_ADDRESS,
            CHAIN_ID,
            userWalletAddress,
            amount,
            process.env.MNEMONIC,
            0,
            permitAdmin,
            NONCE_PER_RUN,
            "XaiGaslessClaim"
        );
        permits[userWalletAddress] = signature;
    }

    // save permit list file into the web public directory
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(permits, null, 2), 'utf8');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  