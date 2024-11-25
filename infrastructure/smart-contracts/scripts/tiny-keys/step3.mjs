import {config, RefereeAbi} from "@sentry/core";
import { safeVerify } from "../../utils/safeVerify.mjs";

async function main() {

    const REFEREE_ADDRESS = config.refereeAddress;
    // get the deployer
    const [deployer] = (await ethers.getSigners());
    
    console.log("Close Open Challenge...");
    const referee = await new ethers.Contract(REFEREE_ADDRESS, RefereeAbi, deployer);
    await referee.closeCurrentChallenge();
    console.log("Closed Open Challenge");
    
    /**
     * Upgrade Referee Contract
     * @description Upgrades the existing Referee contract to Referee9
     * @param {string} refereeCalculationsAddress - Address of the RefereeCalculations contract
     */
    console.log("Upgrading Referee...");
    const Referee10 = await ethers.getContractFactory("Referee10", deployer);
    console.log("Got Referee factory");

    const referee10 = await upgrades.upgradeProxy(REFEREE_ADDRESS, Referee10, { call: {fn: "initialize", args: [] } });
    console.log("Referee upgraded to version 10");

    console.log("Starting verification... ");
    await safeVerify({ contract: referee10 });
    console.log("Verification complete ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  