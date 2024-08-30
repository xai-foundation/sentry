import {safeVerify} from "../../utils/safeVerify.mjs";
import {config} from "@sentry/core";

const NODE_LICENSE_CONTRACT = config.nodeLicenseAddress;
const REFEREE_CONTRACT = config.refereeAddress;
const POOL_FACTORY_CONTRACT = config.poolFactoryAddress;
const KEY_MULTIPLIER = 99 // qty of keys to be air dropped per 1 node license TODO Set This

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    console.log("Deploying contracts with the account:", deployer.address);
  
    // deploy tiny keys airdrop contract
    console.log("Deploying Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop = await upgrades.deployProxy(TinyKeysAirdrop, [NODE_LICENSE_CONTRACT, REFEREE_CONTRACT, POOL_FACTORY_CONTRACT, KEY_MULTIPLIER], { kind: "transparent", deployer });
    await tinyKeysAirdrop.deploymentTransaction();
    const tinyKeysAirdropAddress = await tinyKeysAirdrop.getAddress();
    console.log("Tiny Keys Airdrop deployed to:", tinyKeysAirdropAddress);   
    
    console.log("Deploying Referee Calculations Contract...");
    const RefereeCalculations = await ethers.getContractFactory("RefereeCalculations");
    const refereeCalculations = await upgrades.deployProxy(RefereeCalculations, [], { kind: "transparent", deployer });
    await refereeCalculations.deploymentTransaction();
    const refereeCalculationsAddress = await refereeCalculations.getAddress();
    console.log("Referee Calculations deployed to:", refereeCalculationsAddress);

    
	// verify contract
	await safeVerify({ contract: tinyKeysAirdrop });

	// verify contract
	await safeVerify({ contract: refereeCalculations });
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  