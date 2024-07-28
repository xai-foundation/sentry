import { safeVerify } from "../utils/safeVerify";
import {config} from "@sentry/core";

const NODE_LICENSE_CONTRACT = config.nodeLicenseContract;
const REFEREE_CONTRACT = config.refereeContract;
const KEY_MULTIPLIER = 99 // qty of keys to be air dropped per 1 node license TODO Set This

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
  
    // deploy tiny keys airdrop contract
    console.log("Deploying Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop = await upgrades.deployProxy(TinyKeysAirdrop, [NODE_LICENSE_CONTRACT, REFEREE_CONTRACT, KEY_MULTIPLIER], { kind: "transparent", deployer });
    await tinyKeysAirdrop.deploymentTransaction();
    const tinyKeysAirdropAddress = await tinyKeysAirdrop.getAddress();
    console.log("Tiny Keys Airdrop deployed to:", tinyKeysAirdropAddress);    

    // verify contract
    await safeVerify({ contract: tinyKeysAirdrop });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  