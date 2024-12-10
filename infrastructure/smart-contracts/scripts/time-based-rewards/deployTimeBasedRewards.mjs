import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { config } from "@sentry/core";
import { safeVerify } from "../../utils/safeVerify.mjs";

/**
 * Main function to deploy and upgrade contracts for time-based rewards
 * @async
 * @function main
 * @description This function deploys new contracts and upgrades existing ones in the following order:
 * 1. Deploy Referee Calculations
 * 2. Upgrade to Referee9
 * 3. Verify contracts
 */
async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Deploying Referee Calculations Contract...");
    const RefereeCalculations = await ethers.getContractFactory("RefereeCalculations");
    const refereeCalculations = await upgrades.deployProxy(RefereeCalculations, [], { kind: "transparent", deployer });
    await refereeCalculations.deploymentTransaction();
    const refereeCalculationsAddress = await refereeCalculations.getAddress();
    console.log("Referee Calculations deployed to:", refereeCalculationsAddress);
    /**
   * Upgrade Referee Contract
   * @description Upgrades the existing Referee contract to Referee9
   * @param {string} refereeCalculationsAddress - Address of the RefereeCalculations contract
   */
    console.log("Upgrading Referee...");
    const Referee9 = await ethers.getContractFactory("Referee9");
    console.log("Got Referee factory");

    const refereeUpgradeParams = [refereeCalculationsAddress];
    const referee9 = await upgrades.upgradeProxy(config.refereeAddress, Referee9, { call: { fn: "initialize", args: refereeUpgradeParams } });

    // verify contract
    await safeVerify({ contract: referee9 });

    // verify contract
    await safeVerify({ contract: refereeCalculations });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
