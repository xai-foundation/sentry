import { ethers } from "hardhat";
import { extractAbi } from "../utils/exportAbi";
import { safeVerify } from "../utils/safeVerify";
import { writeToConfig } from "../utils/writeToConfig";
import { config } from "@xai-vanguard-node/core";

const options = {
  admins: [
    "0xc32493515E3537E55a323B3F0aF1AC4ED0E71BF4", // Christopher
    "0xd942EBC67d2C91Eb1a0757345D55A48F953D585b" // Avo
  ]
}

async function main() {

  console.log("Deploying Referee...");
  const Referee = await ethers.getContractFactory("Referee");
  const referee = await Referee.deploy();
  await referee.deploymentTransaction();
  const address = await referee.getAddress();

  console.log("Referee deployed to:", await referee.getAddress());

  // Set the rollupAddress
  await referee.setRollupAddress(config.rollupAddress)

  // Export the ABI of referee
  await extractAbi("Referee", referee);
  console.log("Referee Abi exported");

  // Update the referee contract address in the config
  writeToConfig({ refereeAddress: address });
  console.log("Referee contract address updated in the config");

  // Add admins to the contract
  const adminRole = await referee.DEFAULT_ADMIN_ROLE();
  for (const address of options.admins) {
    await referee.grantRole(adminRole, address);
    console.log(`Granted admin role to ${address}`);
  }

  // Verify the contract
  await safeVerify({ contract: referee });
  console.log("Referee contract verified");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

