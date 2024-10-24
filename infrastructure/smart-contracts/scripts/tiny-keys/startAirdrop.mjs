import {config, TinyKeysAirdropAbi, RefereeAbi} from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = config.tinyKeysAirdropAddress; // Needs to be set after deployment

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    
    console.log("Close Open Challenge...");
    const referee = await new ethers.Contract(config.refereeAddress, RefereeAbi, deployer);
    await referee.closeCurrentChallenge();

    // Activate tiny keys airdrop
    console.log("Activating Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);
    await TinyKeysAirdrop.startAirdrop();
    console.log("Tiny Keys Airdrop Started...");   
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  